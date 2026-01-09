from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import pikepdf
from pyhanko.sign import signers
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign.signers import SimpleSigner, PdfSignatureMetadata

router = APIRouter(prefix="/security", tags=["security"])

@router.post("/protect")
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    password: str = Form(...)
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        output_filename = f"protected_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        pdf = pikepdf.Pdf.open(temp_file)
        # AES-256 encryption
        encryption = pikepdf.Encryption(
            user=password, 
            owner=password, 
            R=6
        )
        pdf.save(output_path, encryption=encryption)
        pdf.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="protected.pdf", media_type="application/pdf")

    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Protect failed: {str(e)}")

@router.post("/unlock")
async def unlock_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    password: str = Form(...)
):
    temp_file = None
    try:
        temp_file = await save_upload_file(file)
        
        output_filename = f"unlocked_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        
        try:
            pdf = pikepdf.Pdf.open(temp_file, password=password)
        except pikepdf.PasswordError:
            raise HTTPException(status_code=400, detail="Incorrect password")
            
        pdf.save(output_path)
        pdf.close()
        
        background_tasks.add_task(cleanup_file, temp_file)
        return FileResponse(output_path, filename="unlocked.pdf", media_type="application/pdf")

    except HTTPException:
        raise
    except Exception as e:
        if temp_file: cleanup_file(temp_file)
        raise HTTPException(status_code=500, detail=f"Unlock failed: {str(e)}")

@router.post("/sign")
async def sign_pdf(
    file: UploadFile = File(...),
    pfx_file: UploadFile = File(...),
    password: str = Form(...),
    reason: str = Form("Digital Signature"),
    location: str = Form("SafeConverts"),
    visual_image: UploadFile = File(None),
    visual_coords: str = Form(None), # JSON: {x,y,w,h,page} 
):
    try:
        import nest_asyncio
        nest_asyncio.apply()
        
        # Read inputs into memory
        content = await file.read()
        pfx_content = await pfx_file.read()
        
        # Libraries
        from endesive import pdf
        from cryptography.hazmat.primitives.serialization import pkcs12
        from cryptography.hazmat.primitives import hashes
        from cryptography.x509.oid import NameOID
        import datetime
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
        from PIL import Image, ImageDraw, ImageFont
        from fastapi import Response
        import io
        import json

        # 1. Load PFX & Extract Name
        try:
            private_key, certificate, additional_certificates = pkcs12.load_key_and_certificates(
                pfx_content,
                password.encode()
            )
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid PFX password or file.")

        if not private_key:
             raise HTTPException(status_code=400, detail="Certificate does not contain a private key.")
        
        # Extract Common Name
        start_name = "User"
        try:
            subject = certificate.subject
            cn_attributes = subject.get_attributes_for_oid(NameOID.COMMON_NAME)
            if cn_attributes:
                start_name = cn_attributes[0].value
            else:
                o_attributes = subject.get_attributes_for_oid(NameOID.ORGANIZATION_NAME)
                if o_attributes:
                    start_name = o_attributes[0].value
        except Exception:
            start_name = location or "Signer"

        # 2. Generate Badge & Overlay
        final_pdf_data = content
        
        if visual_coords:
            try:
                coords = json.loads(visual_coords)
                
                reader = PdfReader(io.BytesIO(content))
                writer = PdfWriter()
                
                page_idx = coords.get('page', 1) - 1
                if page_idx < 0: page_idx = 0
                if page_idx >= len(reader.pages): page_idx = len(reader.pages) - 1
                
                for i in range(len(reader.pages)):
                    page = reader.pages[i]
                    if i == page_idx:
                        mb = page.mediabox
                        page_w = float(mb.width)
                        page_h = float(mb.height)
                        
                        x_pct = float(coords.get('x', 0))
                        y_pct = float(coords.get('y', 0))
                        w_pct = float(coords.get('w', 0.2))
                        h_pct = float(coords.get('h', 0.1))
                        
                        rect_w = w_pct * page_w
                        rect_h = h_pct * page_h
                        rect_x = x_pct * page_w
                        rect_y = page_h * (1.0 - (y_pct + h_pct))
                        
                        # ReportLab Overlay
                        packet = io.BytesIO()
                        c = canvas.Canvas(packet, pagesize=(page_w, page_h))
                        
                        # Background Box
                        c.setFillColorRGB(1, 1, 1)
                        c.rect(rect_x, rect_y, rect_w, rect_h, fill=1, stroke=1)
                        c.setStrokeColorRGB(0.8, 0.8, 0.8)
                        
                        c.saveState()
                        c.translate(rect_x, rect_y)
                        scale_factor = min(rect_w / 300.0, rect_h / 100.0)
                        c.scale(scale_factor, scale_factor)
                        
                        # Icon
                        c.setFillColorRGB(0.96, 1.0, 0.93)
                        c.setStrokeColorRGB(0.72, 0.92, 0.56)
                        c.circle(50, 50, 40, fill=1, stroke=1)
                        
                        # Checkmark
                        c.setStrokeColorRGB(0.32, 0.77, 0.1)
                        c.setLineWidth(5)
                        p = c.beginPath()
                        p.moveTo(30, 50)
                        p.lineTo(45, 35)
                        p.lineTo(70, 65)
                        c.drawPath(p, stroke=1, fill=0)

                        # Text
                        c.setFillColorRGB(0, 0, 0)
                        c.setFont("Helvetica-Bold", 18)
                        c.drawString(100, 70, "Signature Valid")
                        
                        c.setFont("Helvetica", 12)
                        c.setFillColorRGB(0.2, 0.2, 0.2)
                        c.drawString(100, 50, f"Digitally signed by {start_name}")
                        
                        c.setFont("Helvetica", 10)
                        c.setFillColorRGB(0.4, 0.4, 0.4)
                        c.drawString(100, 35, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}")
                        c.drawString(100, 20, f"Reason: {reason}")

                        c.restoreState()
                        c.save()
                        packet.seek(0)
                        
                        overlay_pdf = PdfReader(packet)
                        page.merge_page(overlay_pdf.pages[0])
                    
                    writer.add_page(page)
                
                out_buffer = io.BytesIO()
                writer.write(out_buffer)
                final_pdf_data = out_buffer.getvalue()

            except Exception as e:
                print(f"Overlay Error: {e}")
                import traceback
                traceback.print_exc()
                # Fallback to original content
                final_pdf_data = content

        # 2.5 Sanitize PDF with PikePDF (Critical Fix for Corruption)
        # pypdf sometimes produces structures that endesive/Acrobat dislike.
        # pikepdf (QPDF) repairs them.
        try:
            import pikepdf
            with pikepdf.open(io.BytesIO(final_pdf_data)) as pdf_doc:
                clean_buffer = io.BytesIO()
                pdf_doc.save(clean_buffer)
                final_pdf_data = clean_buffer.getvalue()
        except Exception as e:
            print(f"PikePDF Sanitization Failed: {e}")
            # Proceed with un-sanitized data if pikepdf fails (unlikely)
            pass

        # 3. Sign using PyHanko (Robust Standard)
        # Endesive was causing corruption. PyHanko handles PDF signing structures (incremental updates) much better.
        try:
            from pyhanko.sign import signers
            from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
            
            # Load Signer
            # The library strictly expects a file path. Raw bytes cause 'embedded null byte' error.
            # We use a temp file to safely pass the PFX.
            import tempfile
            import os
            
            pfx_temp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False) as tmp:
                    tmp.write(pfx_content)
                    pfx_temp_path = tmp.name
                
                signer = signers.SimpleSigner.load_pkcs12(
                    pfx_file=pfx_temp_path,
                    passphrase=password.encode()
                )
            finally:
                if pfx_temp_path and os.path.exists(pfx_temp_path):
                    os.unlink(pfx_temp_path)

            # Metadata
            date = datetime.datetime.now(datetime.timezone.utc)
            
            # Prepare Output
            signed_output_buffer = io.BytesIO()
            
            # Sign
            # We wrap the data in BytesIO
            data_io = io.BytesIO(final_pdf_data)
            
            signers.sign_pdf(
                IncrementalPdfFileWriter(data_io),
                signers.PdfSignatureMetadata(
                    field_name='Signature1',
                    reason=reason,
                    location=location,
                    contact_info=location
                ),
                signer=signer,
                output=signed_output_buffer,
            )
            
            signed_data = signed_output_buffer.getvalue()
            
        except Exception as e:
            print(f"PyHanko Signing Error: {e}")
            import traceback
            traceback.print_exc()
            # If PyHanko fails, we fallback to returning the unsigned (but overlayed) PDF
            # so the user at least gets something and sees the error in logs.
            # But better to raise error if strictly required.
            raise HTTPException(status_code=500, detail=f"Signing failed: {str(e)}")
        
        return Response(
            content=signed_data, 
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=signed_document.pdf"}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Global Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Process failed: {str(e)}")
