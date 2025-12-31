FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# poppler-utils: required for pdf2image
# tesseract-ocr: required for OCR
# libreoffice: required for office conversion
# ghostscript: required for some PDF operations
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    libreoffice \
    libreoffice-java-common \
    ghostscript \
    default-jre \
    ffmpeg \
    libsm6 \
    libxext6 \
    potrace \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
