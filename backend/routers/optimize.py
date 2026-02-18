from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import subprocess
import os
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR

router = APIRouter(prefix="/optimize", tags=["Optimize PDF"])

@router.post("/compress")
async def compress_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...), level: str = "ebook", target_size: float = None):
    """
    Compress PDF using Ghostscript.
    Levels: screen (lowest), ebook (medium), printer (high quality), prepress (highest)
    """
    temp_file = await save_upload_file(file)
    output_path = temp_file + "_compressed.pdf"
    
    # Map friendly names to GS settings
    # /screen (72 dpi), /ebook (150 dpi), /printer (300 dpi), /prepress (300 dpi, color preserving)
    gs_setting = "/ebook"
    
    if level == "screen": 
        gs_setting = "/screen"
    elif level == "printer": 
        gs_setting = "/printer"
    elif level == "prepress": 
        gs_setting = "/prepress"
    elif level == "target" and target_size:
        # Calculate heuristics based on file size
        original_size = os.path.getsize(temp_file)
        target_bytes = float(target_size) * 1024 * 1024
        
        if original_size > 0:
            ratio = target_bytes / original_size
            if ratio < 0.1:
                gs_setting = "/screen" # Aggressive
            elif ratio < 0.5:
                gs_setting = "/ebook"  # Moderate
            else:
                gs_setting = "/printer" # Light
        else:
            gs_setting = "/ebook" # Fallback
    
    try:
        cmd = [
            "gs",
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-dPDFSETTINGS={gs_setting}",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            f"-sOutputFile={output_path}",
            temp_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Ghostscript Error: {result.stderr}")
            raise HTTPException(status_code=500, detail="Compression failed")
            
        background_tasks.add_task(cleanup_file, temp_file)
        background_tasks.add_task(cleanup_file, output_path)
        
        return FileResponse(
            output_path, 
            filename=f"compressed_{file.filename}",
            media_type="application/pdf"
        )
        
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        if os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/repair")
async def repair_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Repair PDF using Ghostscript (re-distilling).
    """
    temp_file = await save_upload_file(file)
    output_path = temp_file + "_repaired.pdf"
    
    try:
        # GS command to rewrite PDF (often fixes corruption)
        cmd = [
            "gs",
            "-o", output_path,
            "-sDEVICE=pdfwrite",
            "-dPDFSETTINGS=/prepress",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            temp_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Ghostscript Repair Error: {result.stderr}")
            # Try falback? sometimes /prepress fails on bad files. 
            # Retrying with simple rewrite might work better or worse.
            raise HTTPException(status_code=500, detail="Repair failed")
            
        background_tasks.add_task(cleanup_file, temp_file)
        background_tasks.add_task(cleanup_file, output_path)
        
        return FileResponse(
            output_path, 
            filename=f"repaired_{file.filename}",
            media_type="application/pdf"
        )
        
    except Exception as e:
        if os.path.exists(temp_file): cleanup_file(temp_file)
        if os.path.exists(output_path): cleanup_file(output_path)
        raise HTTPException(status_code=500, detail=str(e))
