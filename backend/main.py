from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="SafeConvert API")

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
    return {"message": "SafeConvert API is running"}

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
            # Run cleanup every 15 minutes
            await asyncio.sleep(900)
            now = time.time()
            if os.path.exists(UPLOAD_DIR):
                for filename in os.listdir(UPLOAD_DIR):
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    # Delete if older than 20 minutes (1200 seconds)
                    if os.path.isfile(file_path):
                        if os.stat(file_path).st_mtime < now - 1200:
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
from routers import pdf_tools, converters, image_tools, security, ocr, workflow, office_tools, pdf_extra, convert_from_pdf, optimize

app.include_router(pdf_tools.router)
app.include_router(converters.router)
app.include_router(image_tools.router)
app.include_router(security.router)
app.include_router(ocr.router)
app.include_router(workflow.router)
app.include_router(office_tools.router)
app.include_router(pdf_extra.router)
app.include_router(convert_from_pdf.router)
app.include_router(optimize.router)
