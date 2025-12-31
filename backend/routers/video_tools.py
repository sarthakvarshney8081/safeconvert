from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
import shutil
import os
import subprocess
import uuid
from typing import List

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/temp")

def cleanup_file(path: str):
    """Background task to remove file after response"""
    try:
        if os.path.exists(path):
            os.remove(path)
        # Also clean up parent dir if it was a temp job dir
        parent = os.path.dirname(path)
        if parent != UPLOAD_DIR and os.path.exists(parent):
            shutil.rmtree(parent)
    except Exception as e:
        print(f"Error cleaning up {path}: {e}")

@router.post("/video-to-gif")
async def video_to_gif(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    fps: int = Form(10),
    width: int = Form(320)
):
    """Convert input video to GIF using FFmpeg"""
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(UPLOAD_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    input_path = os.path.join(job_dir, f"input_{file.filename}")
    output_path = os.path.join(job_dir, "output.gif")

    try:
        # Save uploaded video
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Build FFmpeg command
        # fps=10,scale=320:-1:flags=lanczos
        # split [s0][s1];[s0]palettegen[p];[s1][p]paletteuse
        # The palette method produces much higher quality GIFs
        
        filter_complex = f"fps={fps},scale={width}:-1:flags=lanczos[x];[x]split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
        
        cmd = [
            "ffmpeg",
            "-i", input_path,
            "-vf", filter_complex,
            "-loop", "0",
            "-y",
            output_path
        ]

        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        background_tasks.add_task(cleanup_file, output_path)
        return FileResponse(output_path, filename=f"{os.path.splitext(file.filename)[0]}.gif", media_type="image/gif")

    except subprocess.CalledProcessError as e:
        shutil.rmtree(job_dir)
        print(f"FFmpeg error: {e.stderr.decode()}")
        raise HTTPException(status_code=500, detail="Conversion failed")
    except Exception as e:
        shutil.rmtree(job_dir)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gif-maker")
async def gif_maker(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    fps: int = Form(2)
):
    """Convert list of images to GIF"""
    # Create job directory
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(UPLOAD_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    output_path = os.path.join(job_dir, "output.gif")

    # RE-WRITING LOGIC FOR GIF MAKER TO BE ROBUST
    # 1. Save all to temp.
    # 2. Use Pillow to open each, resize to common width (optional) and save as sequence of PNGs.
    # 3. Call ffmpeg on the PNG sequence.
    
    from PIL import Image
    
    try:
        images = []
        for file in files:
             # Save temp
             temp_path = os.path.join(job_dir, file.filename)
             with open(temp_path, "wb") as f:
                 shutil.copyfileobj(file.file, f)
             images.append(temp_path)
             
        # Convert to sequence
        # Find max width to standardise? Or just use first image size?
        # Let's use first image size.
        first_img = Image.open(images[0])
        base_size = first_img.size
        
        for i, img_path in enumerate(images):
            with Image.open(img_path) as img:
                # Resize if needed to match first frame, otherwise ffmpeg fails
                if img.size != base_size:
                    img = img.resize(base_size, Image.Resampling.LANCZOS)
                
                # Convert to RGB to avoid mode issues
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                    
                img.save(os.path.join(job_dir, f"frame_{i:03d}.png"))

        cmd = [
            "ffmpeg",
            "-framerate", str(fps),
            "-i", os.path.join(job_dir, "frame_%03d.png"), 
            "-vf", "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
            "-loop", "0",
            "-y",
            output_path
        ]
        
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        background_tasks.add_task(cleanup_file, output_path)
        return FileResponse(output_path, filename="animation.gif", media_type="image/gif")

    except Exception as e:
        shutil.rmtree(job_dir)
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
