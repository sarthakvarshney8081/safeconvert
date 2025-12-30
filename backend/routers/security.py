from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import pikepdf

router = APIRouter(prefix="/security", tags=["security"])

@router.post("/protect")
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    password: str = Form(...)
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        output_filename = f"protected_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        pdf = pikepdf.Pdf.open(temp_file)
        # AES-256 encryption
        encryption = pikepdf.Encryption(
            user=password, 
            owner=password, 
            R=6
        )
        pdf.save(output_path, encryption=encryption)
        pdf.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="protected.pdf", media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Protect failed: {str(e)}")

@router.post("/unlock")
async def unlock_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    password: str = Form(...)
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        output_filename = f"unlocked_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        try:
            pdf = pikepdf.Pdf.open(temp_file, password=password)
        except pikepdf.PasswordError:
            raise HTTPException(status_code=400, detail="Incorrect password")
            
        pdf.save(output_path)
        pdf.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="unlocked.pdf", media_type="application/pdf")

    except HTTPException:
        raise
    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Unlock failed: {str(e)}")
