# Stage 1: Builder
FROM python:3.12-slim as builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies with --no-install-recommends to reduce size
# Note: We keep essential tools like LibreOffice and TeXLive but skip documentation/extras
RUN apt-get update && apt-get install -y --no-install-recommends \
    zip \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-hin \
    tesseract-ocr-fra \
    tesseract-ocr-deu \
    tesseract-ocr-spa \
    libreoffice \
    libreoffice-java-common \
    ghostscript \
    default-jre \
    ffmpeg \
    libxext6 \
    potrace \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /install /usr/local

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
