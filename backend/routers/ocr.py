from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import ocrmypdf

router = APIRouter(prefix="/ocr", tags=["ocr"])

@router.post("/scan-to-pdf")
async def ocr_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    lang: str = Form("eng")
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        output_filename = f"ocr_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        # Run OCR
        # Note: 'force_ocr=True' ensures rasterizing if needed, or 'skip_text=True' if we text already exists
        # 'deskew=True' corrects rotation
        ocrmypdf.ocr(
            temp_file, 
            output_path, 
            language=lang, 
            deskew=True,
            force_ocr=True
        )
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="ocr_document.pdf", media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        # Check if it was "PriorOcrFoundError" - we might want to return the original or skip
        if "PriorOcrFoundError" in str(e):
             raise HTTPException(status_code=400, detail="Document already contains text (OCR).")
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")
