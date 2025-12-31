from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, Response
from pdf2image import convert_from_path
import os
import zipfile
import io
from core.processor import save_upload_file, cleanup_file

router = APIRouter(prefix="/pdf-extra", tags=["PDF Extra Tools"])

@router.post("/to-image")
async def pdf_to_image(background_tasks: BackgroundTasks, file: UploadFile = File(...), format: str = "png"):
    """
    Convert PDF pages to Images (PNG/JPG). Returns a ZIP file if multiple pages.
    """
    temp_file = await save_upload_file(file)
    
    try:
        # Convert PDF to list of Pillow Images
        images = convert_from_path(temp_file)
        
        if len(images) == 0:
            raise HTTPException(status_code=400, detail="Empty PDF")
            
        # If single page, return image directly
        if len(images) == 1:
            img = images[0]
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format=format.upper())
            img_byte_arr.seek(0)
            
            background_tasks.add_task(cleanup_file, temp_file)
            return Response(content=img_byte_arr.getvalue(), media_type=f"image/{format}")
            
        # If multiple pages, zip them
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for i, img in enumerate(images):
                img_data = io.BytesIO()
                img.save(img_data, format=format.upper())
                zip_file.writestr(f"page_{i+1}.{format}", img_data.getvalue())
        
        zip_buffer.seek(0)
        background_tasks.add_task(cleanup_file, temp_file)
        
        return Response(
            content=zip_buffer.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=images.zip"}
        )

    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise HTTPException(status_code=500, detail=str(e))
