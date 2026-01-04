from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import subprocess
import os
import shutil
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import uuid

router = APIRouter(prefix="/office", tags=["Office Tools"])

@router.post("/to-pdf")
async def convert_office_to_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Convert Office documents (DOCX, XLSX, PPTX) to PDF using LibreOffice headless.
    """
    temp_file = None
    output_dir = os.path.join(UPLOAD_DIR, "office_out_" + str(uuid.uuid4()))
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        temp_file = await save_upload_file(file)
        
        # Security Validation
        ALLOWED_EXTS = {'.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt'}
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTS:
             if temp_file and os.path.exists(temp_file): os.remove(temp_file)
             raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}. Allowed: {', '.join(ALLOWED_EXTS)}")

        # Magic Byte Check for Modern Office (XML-based) which are ZIPs
        if ext in {'.docx', '.xlsx', '.pptx'}:
            with open(temp_file, 'rb') as f:
                header = f.read(4)
                if header != b'PK\x03\x04':
                     if os.path.exists(temp_file): os.remove(temp_file)
                     raise HTTPException(status_code=400, detail="Invalid file signature. Not a valid Office Open XML file.")
        
        # Command: libreoffice --headless --convert-to pdf --outdir <dir> <file>
        cmd = [
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", output_dir,
            temp_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"LibreOffice Error: {result.stderr}")
            raise HTTPException(status_code=500, detail="Conversion process failed.")
        
        # Find the output PDF
        # LibreOffice uses the same basename.pdf
        base_name = os.path.splitext(os.path.basename(temp_file))[0]
        output_file = os.path.join(output_dir, base_name + ".pdf")
        
        if not os.path.exists(output_file):
             raise HTTPException(status_code=500, detail="Output PDF not found after conversion.")

        # Cleanup input immediately
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)

        # Schedule directory cleanup (which includes the output file)
        # Note: cleanup_file logic might need to handle directory removal or we rely on main.py periodic cleanup
        # For now, we rely on periodic cleanup, but we can schedule explicit delete if we want strictness.
        # But FileResponse needs it to exist.
        
        return FileResponse(
            output_file, 
            filename=f"{os.path.splitext(file.filename)[0]}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        raise HTTPException(status_code=500, detail=str(e))
