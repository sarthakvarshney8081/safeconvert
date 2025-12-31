from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid
import shutil
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
from pdf2docx import Converter

router = APIRouter(prefix="/convert-from-pdf", tags=["Convert From PDF"])

@router.post("/to-word")
async def pdf_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Convert PDF to DOCX using pdf2docx.
    """
    temp_file = await save_upload_file(file)
    output_filename = os.path.splitext(os.path.basename(temp_file))[0] + ".docx"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    
    try:
        # Convert
        cv = Converter(temp_file)
        cv.convert(output_path, start=0, end=None)
        cv.close()
        
        if not os.path.exists(output_path):
             raise HTTPException(status_code=500, detail="Conversion failed")
             
        background_tasks.add_task(cleanup_file, temp_file)
        background_tasks.add_task(cleanup_file, output_path)
        
        return FileResponse(
            output_path, 
            filename=f"{os.path.splitext(file.filename)[0]}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        if os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=str(e))
