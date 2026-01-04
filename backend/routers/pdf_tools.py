from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file
import os

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
from pypdf import PdfWriter

router = APIRouter(tags=["pdf"])

@router.post("/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    merger = PdfWriter()
    temp_files = []

    try:
        # Save and merge all files
        # Save and merge all files
        for file in files:
            # Security Validation
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF files are allowed.")
            
            if file.content_type != 'application/pdf':
                raise HTTPException(status_code=400, detail=f"Invalid content type: {file.filename}. Expected application/pdf.")

            # Magic Byte Validation (Prevent extension spoofing)
            header = await file.read(4)
            await file.seek(0) # Reset cursor
            if header != b'%PDF':
                raise HTTPException(status_code=400, detail=f"Invalid file signature: {file.filename}. Not a valid PDF.")

            path = await save_upload_file(file)
            temp_files.append(path)
            merger.append(path)

        # Create output
        output_filename = f"merged_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        merger.write(output_path)
        merger.close()

        # Schedule input cleanup
        for path in temp_files:
            background_tasks.add_task(cleanup_file, path)
            
        # Note: Output cleanup should be handled by a cron/scheduled task or specialized response
            
        return FileResponse(output_path, filename="merged.pdf", media_type="application/pdf")

    except Exception as e:
        for path in temp_files:
            cleanup_file(path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

    except Exception as e:
        for path in temp_files:
            cleanup_file(path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

