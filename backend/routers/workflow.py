from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from core.processor import save_upload_file, cleanup_file, UPLOAD_DIR
import os
import uuid
import json
import shutil
import subprocess
from typing import List, Union
from pypdf import PdfWriter, PdfReader
from PIL import Image, ImageOps, ImageEnhance # Imported ImageOps, ImageEnhance
import img2pdf
from pdf2image import convert_from_path
import pikepdf
import ocrmypdf # Imported ocrmypdf

router = APIRouter(prefix="/workflow", tags=["workflow"])

async def process_single_file_step(current_file_path: str, action: dict) -> Union[str, List[str]]:
    """
    Applies a single action to the file and represents the path to the new file(s).
    Deletes the old file (current_file_path) after processing if it was a temp intermediate.
    """
    step_type = action.get("type")
    params = action.get("params", {})
    
    new_file_path = None
    
    if step_type == "rotate": step_type = "rotate_pdf"
    
    try:
        if step_type == "rotate_pdf":
            angle = int(params.get("angle", 90))
            reader = PdfReader(current_file_path)
            writer = PdfWriter()
            for page in reader.pages:
                page.rotate(angle)
                writer.add_page(page)
                
            new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
            writer.write(new_file_path)
            writer.close()

        elif step_type == "compress":
             # Use Ghostscript for compression (from optimize.py)
             level = params.get("level", "ebook")
             # Map friendly names to GS settings
             gs_setting = "/ebook"
             if level == "screen": gs_setting = "/screen"
             elif level == "printer": gs_setting = "/printer"
             elif level == "prepress": gs_setting = "/prepress"
             
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             
             cmd = [
                "gs",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                f"-dPDFSETTINGS={gs_setting}",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                f"-sOutputFile={new_file_path}",
                current_file_path
            ]
            
             result = subprocess.run(cmd, capture_output=True, text=True)
             if result.returncode != 0:
                 raise Exception(f"Ghostscript compression failed: {result.stderr}")

        elif step_type == "repair":
             # Use Ghostscript for repair
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             
             cmd = [
                "gs",
                "-o", new_file_path,
                "-sDEVICE=pdfwrite",
                "-dPDFSETTINGS=/prepress",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                current_file_path
            ]
            
             result = subprocess.run(cmd, capture_output=True, text=True)
             if result.returncode != 0:
                 raise Exception(f"Ghostscript repair failed: {result.stderr}")

        elif step_type == "protect":
             password = params.get("password")
             owner_password = params.get("owner_password", password)
             permissions = params.get("permissions", [])
             
             if not password:
                  print("Protection skipped: No password provided in workflow params")
                  return current_file_path

             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             
             pdf = pikepdf.Pdf.open(current_file_path)
             
             # Map simplified frontend perms to pikepdf
             current_perms = pikepdf.Permissions(
                 print_lowres=('print' in permissions),
                 print_highres=('print' in permissions),
                 extract_content=('copy' in permissions),
                 modify_other=('modify' in permissions),
                 modify_annotation=('modify' in permissions),
                 modify_form=('modify' in permissions),
                 modify_assembly=('modify' in permissions)
             )
             
             encryption = pikepdf.Encryption(
                user=password, 
                owner=owner_password, 
                allow=current_perms,
                R=6
             )
             pdf.save(new_file_path, encryption=encryption)
             pdf.close()

        elif step_type == "compress_image" or step_type == "compress_img":
             quality = int(params.get("quality", 80)) # Default 80
             img = Image.open(current_file_path)
             # Convert to RGB if needed (e.g. PNG to JPEG)
             if img.mode in ("RGBA", "P"): img = img.convert("RGB")
             
             fmt = img.format if img.format else "JPEG"
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt.lower()}")
             img.save(new_file_path, quality=quality, optimize=True)

        elif step_type == "convert_image_to_pdf" or step_type == "to_pdf":
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             with open(new_file_path, "wb") as f:
                f.write(img2pdf.convert([current_file_path]))

        elif step_type == "resize":
             width = int(params.get("width", 0))
             height = int(params.get("height", 0))
             
             img = Image.open(current_file_path)
             
             # If one dim is missing, maintain aspect ratio
             if width == 0 and height == 0:
                 return current_file_path # No op
             
             if width == 0:
                 ratio = height / float(img.size[1])
                 width = int(float(img.size[0]) * ratio)
             if height == 0:
                 ratio = width / float(img.size[0])
                 height = int(float(img.size[1]) * ratio)
                 
             img = img.resize((width, height), Image.Resampling.LANCZOS)
             
             fmt = img.format if img.format else "JPEG"
             # Save
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt.lower()}")
             img.save(new_file_path)

        elif step_type == "convert_format":
             target_fmt = params.get("format", "png").lower()
             img = Image.open(current_file_path)
             
             # Handle transparency for JPEG
             if target_fmt in ["jpg", "jpeg"] and img.mode == "RGBA":
                 img = img.convert("RGB")
                 
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{target_fmt}")
             img.save(new_file_path)

        elif step_type == "crop":
             x = int(params.get("x", 0))
             y = int(params.get("y", 0))
             w = int(params.get("width", 100))
             h = int(params.get("height", 100))
             
             img = Image.open(current_file_path)
             img = img.crop((x, y, x+w, y+h))
             
             fmt = img.format if img.format else "JPEG"
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt.lower()}")
             img.save(new_file_path)

        elif step_type == "convert_pdf_to_image":
             fmt = params.get("fmt", "png")
             images = convert_from_path(current_file_path)
             if not images: raise Exception("No images found in PDF")
             
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt}")
             images[0].save(new_file_path, fmt.upper())
             
        elif step_type == "split":
            mode = params.get("mode", "all")
            split_files = []
            reader = PdfReader(current_file_path)
            total_pages = len(reader.pages)

            if mode == "ranges":
                 # Ranges: "1-3, 5, 7-9" -> Create 3 files: [1-3], [5], [7-9]
                 ranges_str = str(params.get("ranges", "")).strip()
                 if not ranges_str: return [current_file_path] # Fallback?
                 
                 parts = ranges_str.split(',')
                 for i, part in enumerate(parts):
                     part = part.strip()
                     writer = PdfWriter()
                     added_any = False
                     
                     if '-' in part:
                         start, end = map(int, part.split('-'))
                         # 1-based, inclusive in UI -> 0-based exclusive in python range?
                         # range(1, 4) -> 1, 2, 3.
                         start_idx = max(0, start - 1)
                         end_idx = min(total_pages, end)
                         
                         for p_idx in range(start_idx, end_idx):
                             writer.add_page(reader.pages[p_idx])
                             added_any = True
                     else:
                        try:
                           idx = int(part) - 1
                           if 0 <= idx < total_pages:
                               writer.add_page(reader.pages[idx])
                               added_any = True
                        except: pass
                        
                     if added_any:
                        out_path = os.path.join(UPLOAD_DIR, f"split_range_{i}_{uuid.uuid4()}.pdf")
                        writer.write(out_path)
                        writer.close()
                        split_files.append(out_path)
                     else:
                        writer.close()

            else:
                # Default "all" / "burst" mode
                for i, page in enumerate(reader.pages):
                     writer = PdfWriter()
                     writer.add_page(page)
                     
                     # Create temp file for page
                     page_pdf_path = os.path.join(UPLOAD_DIR, f"split_page_{i}_{uuid.uuid4()}.pdf")
                     writer.write(page_pdf_path)
                     writer.close()
                     split_files.append(page_pdf_path)
                 
            return split_files

        elif step_type == "organize":
             # Parse page order: "1,3, 5-7"
             order_str = str(params.get("page_order", "")).strip()
             if not order_str:
                 return current_file_path # No change
                 
             reader = PdfReader(current_file_path)
             total_pages = len(reader.pages)
             writer = PdfWriter()
             
             # Parse ranges
             pages_to_add = []
             parts = order_str.split(',')
             for part in parts:
                 part = part.strip()
                 if '-' in part:
                     start, end = map(int, part.split('-'))
                     # Python range is exclusive at end, so +1. Adjust for 0-index
                     # User Input: 1-3 (Pages 1, 2, 3) -> Python: 0 to 3 (exclusive) -> 0, 1, 2
                     start_idx = max(0, start - 1)
                     end_idx = min(total_pages, end)
                     pages_to_add.extend(range(start_idx, end_idx))
                 else:
                     try:
                        idx = int(part) - 1
                        if 0 <= idx < total_pages:
                            pages_to_add.append(idx)
                     except ValueError:
                        pass # Ignore invalid inputs
             
             for idx in pages_to_add:
                 writer.add_page(reader.pages[idx])
                 
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             writer.write(new_file_path)
             writer.close()
             
             return new_file_path

        elif step_type == "ocr_pdf":
             lang = params.get("lang", "eng")
             force = params.get("force", False)
             
             # Check if input is image, if so convert to PDF first
             input_path = current_file_path
             temp_pdf = None
             
             if not current_file_path.endswith('.pdf'):
                 # Convert image to PDF
                 img = Image.open(current_file_path)
                 temp_pdf = os.path.join(UPLOAD_DIR, f"temp_img_to_pdf_{uuid.uuid4()}.pdf")
                 img.save(temp_pdf, "PDF", resolution=100.0)
                 input_path = temp_pdf

             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.pdf")
             
             import ocrmypdf
             try:
                 ocrmypdf.ocr(
                    input_path,
                    new_file_path,
                    language=lang,
                    force_ocr=True, # Always force for workflow context unless specified
                    progress_bar=False,
                    jobs=1,
                    invalidate_digital_signatures=True
                 )
             except Exception as ocr_err:
                 raise Exception(f"OCR failed: {str(ocr_err)}")
             finally:
                 if temp_pdf and os.path.exists(temp_pdf):
                     os.remove(temp_pdf)

        elif step_type == "enhance_image":
             # Simple enhancement: Auto Contrast + Sharpen
             from PIL import ImageOps, ImageEnhance
             img = Image.open(current_file_path)
             if img.mode != 'RGB': img = img.convert('RGB')
             
             # Auto Contrast
             img = ImageOps.autocontrast(img)
             # Sharpen slightly
             enhancer = ImageEnhance.Sharpness(img)
             img = enhancer.enhance(1.5)
             
             fmt = img.format if img.format else "PNG"
             new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.{fmt.lower()}")
             img.save(new_file_path)

        elif step_type == "extract_text":
             # OCR then dump text
             # First ensure it's a PDF or Image, process with Tesseract via ocrmypdf sidecar not ideal
             # Simpler: Use tesseract directly for extraction if valid
             # Or use ocrmypdf to make PDF then extract text with pypdf
             
             # Let's use the ocr_pdf logic first to ensure we have text
             # Then extract.
             
             # 1. OCR (Reuse logic roughly or call it?)
             # Inline logic for speed
             lang = params.get("lang", "eng")
             
             input_path = current_file_path
             temp_pdf = None
             if not current_file_path.endswith('.pdf'):
                 img = Image.open(current_file_path)
                 temp_pdf = os.path.join(UPLOAD_DIR, f"temp_img_to_pdf_{uuid.uuid4()}.pdf")
                 img.save(temp_pdf, "PDF", resolution=100.0)
                 input_path = temp_pdf
                 
             searchable_pdf = os.path.join(UPLOAD_DIR, f"temp_searchable_{uuid.uuid4()}.pdf")
             import ocrmypdf
             try:
                 ocrmypdf.ocr(
                    input_path,
                    searchable_pdf,
                    language=lang,
                    force_ocr=True,
                    progress_bar=False,
                    jobs=1,
                    sidecar=None,
                    invalidate_digital_signatures=True
                 )
                 
                 # 2. Extract Text from Searchable PDF
                 reader = PdfReader(searchable_pdf)
                 full_text = ""
                 for page in reader.pages:
                     full_text += page.extract_text() + "\n\n"
                     
                 new_file_path = os.path.join(UPLOAD_DIR, f"workflow_step_{uuid.uuid4()}.txt")
                 with open(new_file_path, "w", encoding="utf-8") as f:
                     f.write(full_text)
                     
             except Exception as e:
                 raise e
             finally:
                 if temp_pdf and os.path.exists(temp_pdf): os.remove(temp_pdf)
                 if os.path.exists(searchable_pdf): os.remove(searchable_pdf)

        else:
             # Unknown step or step handled elsewhere (like merge), pass through
             return current_file_path

        return new_file_path

    except Exception as e:
        raise Exception(f"Action {step_type} failed: {str(e)}")

async def process_merge_step(current_files: List[str], action: dict) -> str:
    if not current_files:
        raise Exception("No files to merge")
        
    merger = PdfWriter()
    try:
        for path in current_files:
            merger.append(path)
            
        output_filename = f"merged_workflow_{uuid.uuid4()}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_filename)
        merger.write(output_path)
        merger.close()
        return output_path
    except Exception as e:
        raise Exception(f"Merge failed: {str(e)}")

@router.post("/run")
async def run_workflow(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    workflow_json: str = Form(...) # JSON string of steps
):
    temp_files = [] # Track initial uploads for cleanup
    intermediate_files = [] # Track intermediate steps for cleanup
    current_files = [] # Current state of files in the pipeline
    
    try:
        try:
            steps = json.loads(workflow_json) # List of {type, params}
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid workflow JSON: {str(e)}")
        
        # Initial save
        for file in files:
            path = await save_upload_file(file)
            temp_files.append(path)
            current_files.append(path)
        
        # Chain
        for step in steps:
            step_type = step.get("type")
            
            if step_type == "merge":
                # Merge operation: Many -> One
                if len(current_files) > 0:
                    merged_path = await process_merge_step(current_files, step)
                    intermediate_files.append(merged_path)
                    current_files = [merged_path]
                # If 0 files, do nothing
                
            else:
                # One-to-One operations mapped over input files
                # Note: One input file could become MANY output files (e.g. Split)
                next_files = []
                for path in current_files:
                    try:
                        result = await process_single_file_step(path, step)
                        
                        if isinstance(result, list):
                             # Step produced multiple files (Expansion)
                             for res_path in result:
                                 intermediate_files.append(res_path)
                                 next_files.append(res_path)
                        else:
                             # Step produced one file
                             new_path = result
                             if new_path and new_path != path:
                                 intermediate_files.append(new_path)
                             next_files.append(new_path)
                             
                    except Exception as e:
                        # Log error but maybe continue with others? Or fail workflow?
                        # Fail workflow for consistency
                        raise Exception(f"Step '{step_type}' failed on file {os.path.basename(path)}: {str(e)}")
                        
                current_files = next_files
        
        # Final Result handling
        if len(current_files) == 0:
            raise Exception("Workflow produced no output")
            
        if len(current_files) == 1:
            # Single file result
            final_path = current_files[0]
            filename = os.path.basename(final_path)
            
            # Cleanup
            for p in temp_files: background_tasks.add_task(cleanup_file, p)
            for p in intermediate_files:
                if p != final_path:
                    background_tasks.add_task(cleanup_file, p)
            
            media_type = "application/octet-stream"
            if final_path.endswith('.pdf'): media_type = "application/pdf"
            if final_path.endswith('.zip'): media_type = "application/zip"
            if final_path.endswith('.png'): media_type = "image/png"
            if final_path.endswith('.jpg'): media_type = "image/jpeg"
            if final_path.endswith('.txt'): media_type = "text/plain" # Content type for text
            
            return FileResponse(final_path, filename=f"result_{filename}", media_type=media_type)
            
        else:
            # Multiple files result -> Zip them
            import zipfile
            zip_filename = f"workflow_result_{uuid.uuid4()}.zip"
            zip_path = os.path.join(UPLOAD_DIR, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for file_path in current_files:
                    zipf.write(file_path, os.path.basename(file_path))
            
            # Cleanup everything including the final components since they are in the zip
            for p in temp_files: background_tasks.add_task(cleanup_file, p)
            for p in intermediate_files: background_tasks.add_task(cleanup_file, p)
            
            return FileResponse(zip_path, filename="workflow_results.zip", media_type="application/zip")
            
    except Exception as e:
        # Cleanup on failure
        temp_files_task = [p for p in temp_files if os.path.exists(p)]
        intermediate_files_task = [p for p in intermediate_files if os.path.exists(p)]
        for p in temp_files_task: background_tasks.add_task(cleanup_file, p)
        for p in intermediate_files_task: background_tasks.add_task(cleanup_file, p)
        raise HTTPException(status_code=400, detail=str(e))
