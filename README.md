# SafeConverts - Self-Hosted File Tools

SafeConverts is a privacy-focused, self-hosted web platform for file manipulation (PDF and Images), running entirely on your own infrastructure using Docker.

## Quick Start

1. **Deploy**:
   ```bash
   git pull
   docker compose pull
   docker compose up -d
   ```

2. **Access the Tools**:
   - **Web Interface**: [http://localhost](http://localhost) (Port 80)
   - **API Docs**: [http://localhost/api/docs](http://localhost/api/docs)

## Architecture
- **Gateway**: Nginx (Hardened, Port 80). Routes traffic to Frontend/Backend.
- **Frontend**: Next.js 14 (Internal Port 3000).
- **Backend**: Python FastAPI (Internal Port 8000).
- **Security**: Direct access to internal ports (3333, 8888) is blocked. All traffic flows through the Gateway.

## Configuration
- **Public Port**: 80 (Gateway)
- **Images**:
    - `varshneysarthak/safeconvert-gateway:latest`
    - `varshneysarthak/safeconvert-frontend:latest`
    - `varshneysarthak/safeconvert-backend:latest`

