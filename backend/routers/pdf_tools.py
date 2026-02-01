from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file
import os

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
from pypdf import PdfWriter

router = APIRouter(tags=["pdf"])

@router.post("/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...), manifest: str = Form(None)):
    merger = PdfWriter()
    temp_files = []

    try:
        # 1. Save all files first
        for file in files:
            # Security Validation
            filename_lower = file.filename.lower()
            if not (filename_lower.endswith('.pdf') or filename_lower.endswith(('.jpg', '.jpeg', '.png', '.webp'))):
                raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF and Image files are allowed.")
            
            path = await save_upload_file(file)
            temp_files.append(path)

        # 2. Process Merge
        import json
        from fastapi import Form
        import img2pdf
        from PIL import Image

        # Pre-process: Convert any images to temp PDFs
        processed_files = [] # This will hold paths to PDFs (original or converted)
        
        for path in temp_files:
            if path.lower().endswith('.pdf'):
                processed_files.append(path)
            else:
                # It's an image, convert to PDF
                try:
                    img_pdf_path = path + ".pdf"
                    
                    # Handle RGBA/P modes for JPG conversion compatibility if needed, 
                    # but img2pdf handles many. 
                    # Generally safely convert to RGB or use PIL to save as PDF if img2pdf fails? 
                    # Let's use the logic from converters.py (PIL -> RGB if needed, then img2pdf)
                    
                    # Check mode
                    try: 
                        img = Image.open(path)
                        valid_img_path = path
                        
                        if img.mode == 'RGBA':
                             valid_img_path = path + "_rgb.jpg"
                             img.convert('RGB').save(valid_img_path, "JPEG")
                             # We need to cleanup this intermediate file too
                             background_tasks.add_task(cleanup_file, valid_img_path)
                             
                        with open(img_pdf_path, "wb") as f:
                            f.write(img2pdf.convert(valid_img_path))
                            
                        processed_files.append(img_pdf_path)
                        background_tasks.add_task(cleanup_file, img_pdf_path) # Cleanup temp pdf
                        
                    except Exception as img_err:
                        print(f"Error converting image {path}: {img_err}")
                        raise HTTPException(status_code=400, detail=f"Failed to convert image {os.path.basename(path)}")

                except Exception as e:
                     raise HTTPException(status_code=500, detail=f"Image conversion error: {str(e)}")

        # Use processed_files for merging instead of temp_files (which were raw uploads)
        # Note: indices in manifest refer to the uploaded files order, which matches processed_files order.

        
        # Check if manifest is provided (It comes as a Form field)
        # Note: manifest argument must be added to function signature
        
        if manifest:
            try:
                instructions = json.loads(manifest)
                # instructions: [{ "file_index": 0, "pages": "1-3" }, ...]
                
                for item in instructions:
                    idx = int(item.get('file_index', 0))
                    if idx < 0 or idx >= len(processed_files):
                        continue
                        
                    input_path = processed_files[idx]
                    page_range = item.get('pages', 'all')
                    
                    if page_range.lower() == 'all':
                        merger.append(input_path)
                    else:
                        # Parse Range: "1-3", "5", "4-end"
                        # Expects strictly "start-end" or "single" (1-based from UI, 0-based for pypdf?)
                        # Let's assume UI sends 1-based strings, convert to 0-based for pypdf.
                        # Actually pypdf.append(pages=(start, stop)) is (start, stop).
                        # Let's parse securely.
                        import re
                        
                        # Get total pages to handle 'end'
                        from pypdf import PdfReader
                        reader = PdfReader(input_path)
                        total_pages = len(reader.pages)
                        
                        def parse_page_str(p_str, max_p):
                            if p_str.lower() == 'end': return max_p
                            val = int(p_str)
                            return min(max(val, 1), max_p)

                        # Handle "1-3"
                        if '-' in page_range:
                            start_s, end_s = page_range.split('-')
                            start = parse_page_str(start_s, total_pages) - 1 # 0-based
                            end = parse_page_str(end_s, total_pages)         # Stop is exclusive? No, pypdf pages=(start, stop) is usually inclusive? 
                            # Wait, pypdf.append(pages=...) is (start, stop[, step]). Stop is exclusive.
                            # UI "1-3" usually means 1, 2, 3. So stop should be 3 (index 3 is excluded).
                            # If UI "1-3" (Indices 0, 1, 2). Stop 3.
                            # So start=0, end=3.
                            merger.append(input_path, pages=(start, end))
                        else:
                            # Single Page "5"
                            p = parse_page_str(page_range, total_pages) - 1
                            merger.append(input_path, pages=(p, p+1))

            except Exception as e:
                print(f"Manifest Error: {e}")
                # Fallback or Error? Error ideally.
                raise HTTPException(status_code=400, detail=f"Invalid Manifest: {str(e)}")

        else:
            # Legacy Mode: Append all files in order
            for path in processed_files:
                merger.append(path)

        # Create output
        output_filename = f"merged_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        merger.write(output_path)
        merger.close()

        # Schedule input cleanup
        for path in temp_files:
            background_tasks.add_task(cleanup_file, path)
            
        # Note: Output cleanup should be handled by a cron/scheduled task or specialized response
            
        return FileResponse(output_path, filename="merged.pdf", media_type="application/pdf")

    except Exception as e:
        for path in temp_files:
            cleanup_file(path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")

    except Exception as e:
        for path in temp_files:
            cleanup_file(path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")


@router.post("/verify-signature")
async def verify_signature(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    temp_path = await save_upload_file(file)
    results = []

    try:
        from pyhanko.pdf_utils.reader import PdfFileReader
        from pyhanko.sign import validation
        from pyhanko.sign.general import load_certs_from_pemder

        with open(temp_path, 'rb') as f:
            reader = PdfFileReader(f)
            
            # Check for signatures
            if not reader.embedded_signatures:
                return {"signatures": []}

            # embedded_signatures is a list of SignatureObject in some versions, or a dict in others?
            # pyhanko>=0.20 reader.embedded_signatures returns a list of signature fields (strings)? 
            # OR it returns a list of objects.
            
            # According to error: "list indices must be integers or slices, not EmbeddedPdfSignature"
            # This implies reader.embedded_signatures IS A LIST.
            # And 'sig' IS An Element of that list (EmbeddedPdfSignature object).
            # So I should pass 'sig' directly, not reader.embedded_signatures[sig].

            import nest_asyncio
            nest_asyncio.apply()

            from pyhanko.sign.validation import pdf_embedded
            
            # Monkeypatch _validate_subfilter to support legacy formats
            original_validate = pdf_embedded._validate_subfilter
            def patched_validate(subfilter_str, permitted_subfilters, err_msg):
                if subfilter_str in ('/adbe.pkcs7.sha1', '/adbe.x509.rsa_sha1'):
                    return
                return original_validate(subfilter_str, permitted_subfilters, err_msg)
            
            pdf_embedded._validate_subfilter = patched_validate

            for sig in reader.embedded_signatures:
                try:
                    # Fix: Use nest_asyncio to allow pyhanko's internal asyncio.run() to work
                    # even if we are in a running loop.
                    status = validation.validate_pdf_signature(sig)

                    signer_cert = getattr(status, 'signing_cert', getattr(status, 'signer_cert', None))
                    signing_time = getattr(status, 'signing_time', None)

                    # Extract Data
                    results.append({
                        "field": sig.field_name if hasattr(sig, 'field_name') else str(sig),
                        "valid": status.bottom_line,
                        "signer": signer_cert.subject.human_friendly if signer_cert else "Unknown",
                        "timestamp": str(signing_time) if signing_time else "N/A",
                        "integrity": status.integrity,
                        "trust": status.trusted
                    })
                except Exception as e:
                    print(f"Error validating signature: {e}")
                    # Don't try to serialize 'sig' if it's complex
                    results.append({
                        "field": str(sig),
                        "error": str(e),
                        "valid": False
                    })

    except Exception as e:
        print(f"Verification Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        background_tasks.add_task(cleanup_file, temp_path)

    return {"signatures": results}
