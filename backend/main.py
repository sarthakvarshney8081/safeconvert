from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="SafeConverts API")

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SafeConverts API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

import asyncio
import time
import shutil
from core.audit_logger import log_audit_event
from core.processor import UPLOAD_DIR
from contextlib import asynccontextmanager
from pathlib import Path

async def periodic_cleanup():
    while True:
        try:
            # Run cleanup every 5 minutes
            await asyncio.sleep(300)
            now = time.time()
            if os.path.exists(UPLOAD_DIR):
                files_to_check = os.listdir(UPLOAD_DIR)
                if files_to_check:
                    log_audit_event("AUTO_CLEANUP_BATCH_START", "SYSTEM", f"Checking {len(files_to_check)} files")
                
                for filename in files_to_check:
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    # Delete if older than 10 minutes (600 seconds)
                    if os.path.isfile(file_path):
                        if os.stat(file_path).st_mtime < now - 600:
                            file_id = Path(filename).stem
                            os.remove(file_path)
                            log_audit_event("AUTO_CLEANUP_DELETE", file_id, f"Reason: Exceeded 10m TTL | Path: {file_path}")
                            print(f"Cleaned up {filename}")
        except Exception as e:
            print(f"Cleanup error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start periodic cleanup task
    asyncio.create_task(periodic_cleanup())
    yield

app.router.lifespan_context = lifespan

# Import Routers
from routers import pdf_tools, converters, image_tools, security, ocr, workflow, office_tools, convert_from_pdf, optimize, video_tools, web_tools, resume, redact

app.include_router(pdf_tools.router, prefix="/pdf", tags=["pdf"])
app.include_router(converters.router, prefix="/convert", tags=["convert"])
app.include_router(image_tools.router)
app.include_router(security.router)
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
app.include_router(workflow.router)
app.include_router(office_tools.router)

app.include_router(convert_from_pdf.router)
app.include_router(optimize.router)
app.include_router(video_tools.router, prefix="/video", tags=["video"])
app.include_router(web_tools.router, prefix="/web", tags=["web"])
app.include_router(resume.router)
app.include_router(redact.router, prefix="/redact", tags=["redact"])
