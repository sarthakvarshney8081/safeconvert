from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import os
import subprocess
import shutil
import uuid
from typing import Optional
from pdfminer.high_level import extract_text
import logging

router = APIRouter(prefix="/resume", tags=["Resume"])

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/compile")
async def compile_latex(latex_code: str = Form(...)):
    """
    Compiles LaTeX code into a PDF using Tectonic.
    """
    job_id = str(uuid.uuid4())
    tex_file = os.path.join(UPLOAD_DIR, f"{job_id}.tex")
    pdf_file = os.path.join(UPLOAD_DIR, f"{job_id}.pdf") # Tectonic outputs to same dir by default

    try:
        # 1. Write LaTeX code to file
        with open(tex_file, "w", encoding="utf-8") as f:
            f.write(latex_code)

        # 2. Run pdflatex
        # pdflatex -interaction=nonstopmode -output-directory UPLOAD_DIR tex_file
        # We need to run it twice for references (sometimes), but once is fine for MVP.
        process = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-output-directory", UPLOAD_DIR, tex_file],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if process.returncode != 0:
            logger.error(f"PDFLaTeX failed: {process.stdout}")
            # If PDF was not created, strictly fail.
            if not os.path.exists(pdf_file) or os.path.getsize(pdf_file) == 0:
                 return JSONResponse(status_code=400, content={"error": "Compilation failed", "details": process.stdout})
            
            # If PDF exists but there was an error, it might be partial. Ideally we warn, but for now we let it pass if file exists.
            logger.warning("PDFLaTeX returned non-zero but PDF exists. Returning potentially incomplete PDF.")

        if not os.path.exists(pdf_file) or os.path.getsize(pdf_file) == 0:
             return JSONResponse(status_code=400, content={"error": "Compilation produced no output", "details": process.stdout})

        return FileResponse(
            pdf_file, 
            media_type="application/pdf", 
            filename="resume.pdf"
        )

    except subprocess.TimeoutExpired:
        return JSONResponse(status_code=408, content={"error": "Compilation timed out."})
    except Exception as e:
        logger.error(f"Error compiling: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Cleanup input tex. keep PDF for response (it will be streamed then we can't delete immediately easily in FastAPI without background tasks)
        # For simplicity in MVP, we rely on the cron cleanup script.
        pass

@router.post("/decompile")
async def decompile_pdf(file: UploadFile = File(...)):
    """
    Extracts text from PDF to pre-fill a template (Best Effort).
    """
    job_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract Text
        text = extract_text(input_path)
        
        # Clean text
        text = text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}") # Basic escape for latex placement
        
        # We return the RAW text for now. Front-end can insert it into comment blocks or a field.
        # Ideally we'd parse sections, but that's complex AI.
        
        return {"extracted_text": text}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # We rely on cron cleanup
        pass
