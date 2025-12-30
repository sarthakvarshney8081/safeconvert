from fastapi import APIRouter, UploadFile, File
from core.processor import save_upload_file, cleanup_file

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import img2pdf
from pdf2image import convert_from_path
import subprocess
import zipfile
import shutil

router = APIRouter(prefix="/convert", tags=["convert"])

@router.post("/office-to-pdf")
async def convert_office(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_file = None
    output_dir = os.path.join(UPLOAD_DIR, f"office_{uuid.uuid4()}")
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        temp_file = await save_upload_file(file)
        
        # Check if LibreOffice is available (fallback? error?)
        # Command: libreoffice --headless --convert-to pdf <file> --outdir <dir>
        process = subprocess.run(
            ['libreoffice', '--headless', '--convert-to', 'pdf', temp_file, '--outdir', output_dir],
            capture_output=True,
            text=True
        )
        
        if process.returncode != 0:
             raise Exception(f"LibreOffice conversion failed: {process.stderr}")

        # Find the output pdf
        files_in_output = os.listdir(output_dir)
        pdf_files = [f for f in files_in_output if f.lower().endswith('.pdf')]
        
        if not pdf_files:
             raise Exception("Output PDF not found after conversion")
             
        output_pdf_path = os.path.join(output_dir, pdf_files[0])
        
        # Cleanup input immediately
        if temp_file: cleanup_file(temp_file)
        
        # Schedule directory cleanup? 
        # Background task can remove the whole folder after serving
        background_tasks.add_task(shutil.rmtree, output_dir, ignore_errors=True) # Recursive delete

        return FileResponse(output_pdf_path, filename=pdf_files[0], media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        shutil.rmtree(output_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@router.post("/image-to-pdf")
async def convert_image_to_pdf(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    temp_files = []
    try:
        # Save images
        image_paths = []
        for file in files:
            path = await save_upload_file(file)
            temp_files.append(path)
            image_paths.append(path)

        output_filename = f"img2pdf_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        # Convert
        with open(output_path, "wb") as f:
            f.write(img2pdf.convert(image_paths))

        for path in temp_files:
            background_tasks.add_task(cleanup_file, path)

        return FileResponse(output_path, filename="converted.pdf", media_type="application/pdf")

    except Exception as e:
        for path in temp_files:
            cleanup_file(path)
        raise HTTPException(status_code=500, detail=f"Image to PDF failed: {str(e)}")

@router.post("/pdf-to-image")
async def convert_pdf_to_image(background_tasks: BackgroundTasks, file: UploadFile = File(...), fmt: str = "png"):
    temp_file = None
    output_dir = os.path.join(UPLOAD_DIR, f"pdf2img_{uuid.uuid4()}")
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        temp_file = await save_upload_file(file)
        
        images = convert_from_path(temp_file)
        
        output_paths = []
        for i, image in enumerate(images):
            image_path = os.path.join(output_dir, f"page_{i+1}.{fmt}")
            image.save(image_path, fmt.upper())
            output_paths.append(image_path)
            
        # If single page, return image. If multiple, return zip.
        if len(output_paths) == 1:
            background_tasks.add_task(shutil.rmtree, output_dir, ignore_errors=True)
            background_tasks.add_task(cleanup_file, temp_file)
            return FileResponse(output_paths[0], filename=f"page_1.{fmt}")
        else:
            # Create zip
            zip_path = os.path.join(UPLOAD_DIR, f"images_{uuid.uuid4()}.zip")
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for img_path in output_paths:
                    zipf.write(img_path, arcname=os.path.basename(img_path))
            
            background_tasks.add_task(shutil.rmtree, output_dir, ignore_errors=True)
            background_tasks.add_task(cleanup_file, temp_file)
            # Cleanup zip eventually?
            # background_tasks.add_task(cleanup_file, zip_path) # Risk of deleting before stream
            
            return FileResponse(zip_path, filename="images.zip", media_type="application/zip")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        shutil.rmtree(output_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"PDF to Image failed: {str(e)}")
