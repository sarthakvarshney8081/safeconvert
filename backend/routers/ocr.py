from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
from core.processor import save_upload_file, cleanup_file
import pypdf

router = APIRouter(prefix="/ocr", tags=["OCR"])

@router.post("/scan-pdf")
async def perform_ocr(background_tasks: BackgroundTasks, file: UploadFile = File(...), lang: str = "eng"):
    """
    Perform OCR on a PDF or Image and return a searchable PDF.
    Uses pytesseract.image_to_pdf_or_hocr
    """
    temp_file = await save_upload_file(file)
    output_pdf = temp_file + "_ocr.pdf"
    
    try:
        # Check if file is image or PDF
        content_type = file.content_type
        
        if "image" in content_type:
            # Simple Image to PDF OCR
            pdf_bytes = pytesseract.image_to_pdf_or_hocr(temp_file, extension='pdf', lang=lang)
            with open(output_pdf, "wb") as f:
                f.write(pdf_bytes)
                
        elif "pdf" in content_type:
            # PDF to PDF (OCR) - Convert pages to images then OCR them
            # This is complex (ocrmypdf is better but we use bare tesseract for now)
            # Strategy: Convert PDF pages to images -> OCR each -> Merge
            # Easier: Use ocrmypdf if installed (it was in requirements logic but Tesseract is available)
            # Fallback manual pipelne:
            
            # Since ocrmypdf might not be in path or complicated, let's use a simpler approach for 'Scan to PDF'
            # Assume input is Scanned Image-only PDF.
            images = convert_from_path(temp_file)
            
            from pypdf import PdfWriter, PdfReader
            import io
            
            writer = PdfWriter()
            
            for img in images:
                pdf_bytes = pytesseract.image_to_pdf_or_hocr(img, extension='pdf', lang=lang)
                # Load this page
                page_reader = PdfReader(io.BytesIO(pdf_bytes))
                writer.add_page(page_reader.pages[0])
                
            writer.write(output_pdf)
            
        else:
             raise HTTPException(status_code=400, detail="Unsupported file format")

        background_tasks.add_task(cleanup_file, temp_file)
        
        return FileResponse(
            output_pdf, 
            filename="ocr_result.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        if os.path.exists(output_pdf):
             os.remove(output_pdf)
        raise HTTPException(status_code=500, detail=str(e))
