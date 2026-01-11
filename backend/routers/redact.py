from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
import fitz  # pymupdf
import json
import io

router = APIRouter()

@router.post("/process")
async def redact_pdf(
    file: UploadFile = File(...),
    redactions: str = Form(...) # JSON String: [{"page": 1, "x": 10, "y": 10, "w": 100, "h": 50}, ...]
):
    try:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        
        redaction_list = json.loads(redactions)
        
        for r in redaction_list:
            page_idx = int(r.get('page', 1)) - 1
            if 0 <= page_idx < len(doc):
                page = doc[page_idx]
                
                # Coordinates
                # Usually frontend sends normalized (%) or pixels relative to 72dpi?
                # We assume Frontend sends Normalized (0-1) or PDF points?
                # Let's align with Frontend Plan: Frontend sends Normalized (%) to handle resolution diffs.
                # BUT standard ReactCrop returns Pixels.
                # BETTER: Frontend sends % (x,y,w,h in 0-1 range).
                
                rect = page.rect # (x0, y0, x1, y1)
                w = rect.width
                h = rect.height
                
                rx = float(r.get('x', 0))
                ry = float(r.get('y', 0))
                rw = float(r.get('w', 0))
                rh = float(r.get('h', 0))
                
                # Check if inputs are normalized (<=1.0 usually)
                # If inputs are clearly pixels (e.g. > 1), treat as pixels.
                # But safer to dictate standard.
                # Let's assume Normalized (0-1) as planned in previous tasks for robustness.
                
                # Wait, in Redact tool, we might use absolute if we know PDF dimensions.
                # Let's implement Normalized support.
                
                final_x = rx * w
                final_y = ry * h
                final_w = rw * w
                final_h = rh * h
                
                # PyMuPDF Rect: (x0, y0, x1, y1)
                # Origin is Top-Left in PDF usually? No, PDF origin is Bottom-Left in native, Top-Left in PyMuPDF.
                # PyMuPDF uses Top-Left origin (like image).
                # ReactCrop uses Top-Left. Matches!
                
                quad = fitz.Rect(final_x, final_y, final_x + final_w, final_y + final_h)
                
                # Add Redaction Annotation
                page.add_redact_annot(quad, fill=(0, 0, 0)) # Black fill
                
        # Apply Redactions (Burn in)
        doc.ez_save(__file__) # Garbage collection helper
        
        # apply_redactions() removes content
        for page in doc:
            page.apply_redactions()
            
        # Save to buffer
        out_buffer = io.BytesIO()
        doc.save(out_buffer)
        
        return Response(
            content=out_buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=redacted.pdf"}
        )

    except Exception as e:
        print(f"Redaction Error: {e}")
        return Response(content=str(e), status_code=500)
