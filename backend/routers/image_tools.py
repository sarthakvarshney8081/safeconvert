from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
from PIL import Image

router = APIRouter(prefix="/images", tags=["images"])

@router.post("/compress")
async def compress_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    quality: int = Form(60)
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        img = Image.open(temp_file)
        original_format = img.format if img.format else "JPEG"
        
        output_filename = f"compressed_{uuid.uuid4()}.{original_format.lower()}"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        # Optimize
        img.save(output_path, quality=quality, optimize=True)
        # Note: PNG quality logic is different in Pillow, but 'optimize=True' helps.
        # For JPEG/WEBP 'quality' works.

        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename=f"compressed.{original_format.lower()}")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")

@router.post("/convert-format")
async def convert_format(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    target_format: str = Form("png")
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        img = Image.open(temp_file)
        
        # Convert mode if needed (e.g. RGBA -> RGB for JPEG)
        if target_format.lower() in ["jpg", "jpeg"] and img.mode == "RGBA":
            img = img.convert("RGB")
            
        output_filename = f"converted_{uuid.uuid4()}.{target_format.lower()}"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        img.save(output_path, format=target_format.upper())
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename=f"converted.{target_format.lower()}")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

import subprocess

@router.post("/png-to-svg")
async def png_to_svg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    temp_file = None
    bmp_path = None
    try:
        temp_file = await save_upload_file(file)
        
        # 1. Convert to BMP (Potrace requires BMP)
        img = Image.open(temp_file)
        # Ensure black and white / grayscale for best tracing? Potrace handles it but simplified is better.
        # But let's just convert to BMP first.
        bmp_filename = f"temp_{uuid.uuid4()}.bmp"
        bmp_path = os.path.join(UPLOAD_DIR, bmp_filename)
        img.save(bmp_path)

        # 2. Run Potrace
        svg_filename = f"vectorized_{uuid.uuid4()}.svg"
        svg_path = os.path.join(UPLOAD_DIR, svg_filename)
        
        # -s for SVG, -o output
        cmd = ["potrace", bmp_path, "-s", "-o", svg_path]
        
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Cleanup temp BMP immediately
        if os.path.exists(bmp_path):
            os.remove(bmp_path)

        background_tasks.add_task(cleanup_file, temp_file)
        background_tasks.add_task(cleanup_file, svg_path)
        
        return FileResponse(svg_path, filename=f"{os.path.splitext(file.filename)[0]}.svg", media_type="image/svg+xml")

    except subprocess.CalledProcessError as e:
        if temp_file: cleanup_file(temp_file)
        if bmp_path and os.path.exists(bmp_path): os.remove(bmp_path)
        print(f"Potrace error: {e.stderr.decode()}")
        raise HTTPException(status_code=500, detail="Vectorization failed")
    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        if bmp_path and os.path.exists(bmp_path): os.remove(bmp_path)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
