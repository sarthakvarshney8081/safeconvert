from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import json
import shutil
# Logic imports
from pypdf import PdfWriter, PdfReader
from PIL import Image
import img2pdf
from pdf2image import convert_from_path

router = APIRouter(prefix="/workflow", tags=["workflow"])

async def process_step(current_file_path: str, action: dict) -> str:
    """
    Applies a single action to the file and returns the path to the new file.
    Deletes the old file (current_file_path) after processing if it was a temp intermediate.
    """
    step_type = action.get("type")
    params = action.get("params", {})
    
    new_file_path = None
    
    try:
        if step_type == "rotate_pdf":
            angle = int(params.get("angle", 0))
            reader = PdfReader(current_file_path)
            writer = PdfWriter()
            for page in reader.pages:
                page.rotate(angle)
                writer.add_page(page)
                
            new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
            writer.write(new_file_path)
            writer.close()

        elif step_type == "compress_image":
             quality = int(params.get("quality", 60))
             img = Image.open(current_file_path)
             fmt = img.format if img.format else "JPEG"
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt.lower()}")
             img.save(new_file_path, quality=quality, optimize=True)

        elif step_type == "convert_image_to_pdf":
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             with open(new_file_path, "wb") as f:
                f.write(img2pdf.convert([current_file_path]))

        elif step_type == "convert_pdf_to_image":
             # Returns Zip if multiple? Or just first page? Workflow usually implies linear chain.
             # If PDF -> Image, we might break linear chain unless next step handles zip of images?
             # For simplicity, let's extract FIRST page as image if used in workflow
             fmt = params.get("fmt", "png")
             images = convert_from_path(current_file_path)
             if not images: raise Exception("No images found in PDF")
             
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt}")
             images[0].save(new_file_path, fmt.upper())

        else:
             # Unknown step, pass through
             return current_file_path

        return new_file_path

    except Exception as e:
        raise Exception(f"Action {step_type} failed: {str(e)}")


@router.post("/run")
async def run_workflow(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    workflow_json: str = Form(...) # JSON string of steps
):
    temp_file = None
    intermediate_files = []
    
    try:
        steps = json.loads(workflow_json) # List of {type, params}
        
        # Initial save
        current_path = await save_upload_file(file)
        temp_file = current_path # track original
        
        # Chain
        for step in steps:
            next_path = await process_step(current_path, step)
            if next_path and next_path != current_path:
                intermediate_files.append(next_path)
                # We do NOT delete current_path immediately if it was the initial upload (temp_file)
                # But intermediate files should be tracked for cleanup
                current_path = next_path
        
        # Final result is current_path
        
        # Cleanup instructions
        background_tasks.add_task(cleanup_file, temp_file)
        for p in intermediate_files:
             # Don't delete the final result yet!
             if p != current_path:
                 background_tasks.add_task(cleanup_file, p)
        
        # Schedule final result cleanup? leaving for auto-cleanup
        
        filename = os.path.basename(current_path)
        return FileResponse(current_path, filename=f"result_{filename}", media_type="application/octet-stream")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        for p in intermediate_files: cleanup_file(p)
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")
