from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file
import os

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
from pypdf import PdfWriter, PdfReader

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    merger = PdfWriter()
    temp_files = []

    try:
        # Save and merge all files
        for file in files:
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

@router.post("/split")
async def split_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    pages: str = Form("all") # "1-3", "5", "all"
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        reader = PdfReader(temp_file)
        writer = PdfWriter()

        # Simple logic: if 'all', split into zip?. For now, let's implement extraction of specific range to 1 PDF
        # Parsing "1-3,5" is complex, implementing simple start-end for now or "all" -> single PDF? 
        # Requirement: "Split PDF files". Usually means turning 1 PDF into multiple or extracting range.
        # User requested: "Organize PDF pages (reorder, delete, extract)" as well.
        # Let's assume Split = Extract pages for now.
        
        # Parse logic (simplified)
        total_pages = len(reader.pages)
        
        if pages == "all":
             # This might mean burst split? Let's just return the same for now or assume range
             # For MVP, let's implement "extract range"
             selected_pages = range(total_pages)
        else:
             # Basic parser: "1-5"
             try:
                start, end = map(int, pages.split('-'))
                selected_pages = range(start - 1, end) # 1-based to 0-based
             except:
                # specific page
                selected_pages = [int(pages) - 1]

        for p_idx in selected_pages:
            if 0 <= p_idx < total_pages:
                writer.add_page(reader.pages[p_idx])

        output_filename = f"split_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        writer.write(output_path)
        writer.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename=f"split.pdf", media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")

@router.post("/rotate")
async def rotate_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    angle: int = Form(0) # 90, 180, 270
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        reader = PdfReader(temp_file)
        writer = PdfWriter()

        for page in reader.pages:
            page.rotate(angle)
            writer.add_page(page)

        output_filename = f"rotated_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        writer.write(output_path)
        writer.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="rotated.pdf", media_type="application/pdf")
    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Rotate failed: {str(e)}")

@router.post("/compress")
async def compress_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    level: str = Form("ebook") # screen, ebook, printer, prepress
):
    import subprocess
    
    temp_file = None
    output_path = None
    
    try:
        temp_file = await save_upload_file(file)
        
        # internal gs preset name
        # /screen (72 dpi) - Strong
        # /ebook (150 dpi) - Basic
        # /printer (300 dpi) - High Quality
        # /prepress - Max Quality
        
        gs_setting = "/ebook"
        if level == "strong" or level == "screen" or level == "email":
            gs_setting = "/screen"
        elif level == "basic" or level == "ebook":
            gs_setting = "/ebook"
        elif level == "printer":
            gs_setting = "/printer"
        elif level == "prepress":
            gs_setting = "/prepress"

        output_filename = f"compressed_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)

        # Ghostscript command
        # gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
        
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
        
        # Run subprocess
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Ghostscript error: {result.stderr}")
            
        # Verify output exists
        if not os.path.exists(output_path):
             raise Exception("Ghostscript failed to generate output file")

        background_tasks.add_task(cleanup_file, temp_file)
        # We rely on cron cleanup for output, or we can't easily clean it up after FileResponse unless we use a custom iterator
        
        return FileResponse(output_path, filename=f"compressed_{level}.pdf", media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        if output_path and os.path.exists(output_path): cleanup_file(output_path)
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")
