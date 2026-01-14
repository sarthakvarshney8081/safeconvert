from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
import ocrmypdf
import os
from core.processor import save_upload_file, cleanup_file

router = APIRouter(tags=["OCR"])

@router.post("/scan-pdf") # Keep endpoint same to avoid breaking if frontend isn't updated immediately, or update frontend to /ocr-pdf? Frontend calls /api/ocr/scan-pdf currently.
async def perform_ocr(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    lang: str = Form("eng") # Change to Form param to match frontend
):
    """
    Perform OCR on a PDF/Image using ocrmypdf.
    """
    temp_file = await save_upload_file(file)
    output_pdf = temp_file + "_ocr.pdf"
    
    try:
        # ocrmypdf requires input to be a file path.
        # It handles Image inputs if installed plugins (tesseract) support it, but primarily it expects PDF.
        # If input is image, we might need to convert to PDF first?
        # ocrmypdf supports image inputs via 'image_to_pdf' preprocessing? 
        # Actually standard ocrmypdf takes PDF as input.
        
        # Check content type
        content_type = file.content_type
        input_path = temp_file
        
        if "image" in content_type:
             # Convert image to PDF first using img2pdf or Pillow
             from PIL import Image
             import img2pdf
             img_pdf_path = temp_file + ".pdf"
             
             # Convert using img2pdf (lossless)
             with open(temp_file, "rb") as f:
                 pdf_bytes = img2pdf.convert(f)
             with open(img_pdf_path, "wb") as f:
                 f.write(pdf_bytes)
             
             input_path = img_pdf_path
        
        # Process with OCRmyPDF
        # force_ocr=True ensures purely image PDFs get processed.
        # skip_text=True avoids processing pages that already have text (unless force_ocr).
        # We want to force OCR if user asks.
        
        ocrmypdf.ocr(
            input_path, 
            output_pdf, 
            language=lang,
            force_ocr=True, # Make sure we get text layer
            progress_bar=False,
            jobs=4, # Parallel processing
            invalidate_digital_signatures=True
        )
        
        # Cleanup input if we created intermediate
        if input_path != temp_file and os.path.exists(input_path):
            os.remove(input_path)

        background_tasks.add_task(cleanup_file, temp_file)
        # We don't verify output existence, ocrmypdf throws error if fail.
        
        return FileResponse(
            output_pdf, 
            filename="ocr_result_searchable.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        print(f"OCR Error: {e}")
        if os.path.exists(temp_file):
             os.remove(temp_file)
        if os.path.exists(output_pdf):
             os.remove(output_pdf)
        raise HTTPException(status_code=500, detail=str(e))
