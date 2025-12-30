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

async def periodic_cleanup():
    while True:
        await asyncio.sleep(3600) # Every hour
        now = time.time()
        try:
            for f in os.listdir(UPLOAD_DIR):
                fpath = os.path.join(UPLOAD_DIR, f)
                # Delete files older than 1 hour
                if os.stat(fpath).st_mtime < now - 3600:
                    if os.path.isfile(fpath): os.remove(fpath)
                    elif os.path.isdir(fpath): shutil.rmtree(fpath)
        except Exception as e:
            print(f"Cleanup error: {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_cleanup())

# Import Routers
from routers import pdf_tools, converters, image_tools, security, ocr, workflow

app.include_router(pdf_tools.router)
app.include_router(converters.router)
app.include_router(image_tools.router)
app.include_router(security.router)
app.include_router(ocr.router)
app.include_router(workflow.router)
