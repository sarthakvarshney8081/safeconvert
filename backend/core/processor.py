import os
import shutil
import uuid
from pathlib import Path
from tempfile import NamedTemporaryFile

from core.audit_logger import log_audit_event

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "temp")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def save_upload_file(upload_file) -> str:
    """
    Saves an uploaded file to the temp directory and returns the absolute path.
    """
    file_id = str(uuid.uuid4())
    # Preserve extension if possible
    ext = Path(upload_file.filename).suffix
    file_name = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    log_audit_event("FILE_UPLOAD_SUCCESS", file_id, f"Original: {upload_file.filename}")
    return file_path

def cleanup_file(file_path: str):
    """
    Removes a file from the filesystem.
    """
    try:
        if os.path.exists(file_path):
            file_id = Path(file_path).stem
            os.remove(file_path)
            log_audit_event("FILE_CLEANUP_SUCCESS", file_id, f"Path: {file_path}")
    except Exception as e:
        print(f"Error cleaning up file {file_path}: {e}")
