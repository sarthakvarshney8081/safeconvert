from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file
import os

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
from pypdf import PdfWriter

router = APIRouter(tags=["pdf"])

@router.post("/merge")
async def merge_pdfs(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    merger = PdfWriter()
    temp_files = []

    try:
        # Save and merge all files
        # Save and merge all files
        for file in files:
            # Security Validation
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Only PDF files are allowed.")
            
            if file.content_type != 'application/pdf':
                raise HTTPException(status_code=400, detail=f"Invalid content type: {file.filename}. Expected application/pdf.")

            # Magic Byte Validation (Prevent extension spoofing)
            header = await file.read(4)
            await file.seek(0) # Reset cursor
            if header != b'%PDF':
                raise HTTPException(status_code=400, detail=f"Invalid file signature: {file.filename}. Not a valid PDF.")

            path = await save_upload_file(file)
            temp_files.append(path)
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
                    
                    # Extract Data
                    results.append({
                        "field": sig.field_name if hasattr(sig, 'field_name') else str(sig),
                        "valid": status.bottom_line,
                        "signer": status.signer_cert.subject.human_friendly if status.signer_cert else "Unknown",
                        "timestamp": str(status.signing_time) if status.signing_time else None,
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
