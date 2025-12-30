FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# poppler-utils: required for pdf2image
# tesseract-ocr: required for OCR
# libreoffice-writer/calc/impress: minimal libreoffice for conversion
# ghostscript: required for some PDF operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    tesseract-ocr \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    ghostscript \
    # libGL/libXext sometimes needed for OpenCV/Pillow extensions if present
    libgl1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
