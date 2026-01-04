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
from core.processor import UPLOAD_DIR
from contextlib import asynccontextmanager

async def periodic_cleanup():
    while True:
        try:
            # Run cleanup every 5 minutes
            await asyncio.sleep(300)
            now = time.time()
            if os.path.exists(UPLOAD_DIR):
                for filename in os.listdir(UPLOAD_DIR):
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    # Delete if older than 10 minutes (600 seconds)
                    if os.path.isfile(file_path):
                        if os.stat(file_path).st_mtime < now - 600:
                            os.remove(file_path)
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
from routers import pdf_tools, converters, image_tools, security, ocr, workflow, office_tools, convert_from_pdf, optimize, video_tools, web_tools

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
