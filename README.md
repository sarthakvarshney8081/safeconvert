# SafeConverts - Self-Hosted File Tools

SafeConverts is a privacy-focused, self-hosted web platform for file manipulation (PDF and Images), running entirely on your own infrastructure using Docker.

## Quick Start

1. **Start the Application**:
   ```bash
   docker compose up -d
   ```

2. **Access the Tools**:
   - **Frontend UI**: [http://localhost:3333](http://localhost:3333)
   - **Backend API**: [http://localhost:8888/docs](http://localhost:8888/docs)

## Features
- **PDF Tools**: Merge, Split, Rotate, Protect, Unlock, OCR.
- **Image Tools**: Compress, Convert (PNG/JPEG/WEBP).
- **Converters**: Office to PDF, Image to PDF, PDF to Image.
- **Workflows**: Visual builder for chaining operations.

## Architecture
- **Frontend**: Next.js 14 (Node 20+).
- **Backend**: Python FastAPI.
- **Infrastructure**: Docker Compose.

## Configuration
- **Frontend Port**: 3333 (Mapped to internal 3000)
- **Backend Port**: 8888 (Mapped to internal 8000)
