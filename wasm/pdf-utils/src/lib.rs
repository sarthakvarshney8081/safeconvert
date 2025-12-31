use wasm_bindgen::prelude::*;
use lopdf::Document;
use std::io::Cursor;
use vtracer::{Config, convert};
use visioncortex::ColorImage;


#[wasm_bindgen]
pub fn rotate_pdf(pdf_bytes: &[u8], angle: i32) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // In lopdf 0.31+, to get pages we usually need to traverse the page tree.
    // get_pages() returns BTreeMap<u32, ObjectId>
    let pages = doc.get_pages();
    
    for (_, object_id) in pages {
        if let Ok(object) = doc.get_object_mut(object_id) {
            if let Ok(dict) = object.as_dict_mut() {
                 let rotation = match dict.get(b"Rotate") {
                    Ok(obj) => obj.as_i64().unwrap_or(0),
                    Err(_) => 0,
                };
                dict.set("Rotate", rotation + angle as i64);
            }
        }
    }

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save PDF: {}", e)))?;

    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn compress_image(image_bytes: &[u8], quality: u8) -> Result<Vec<u8>, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    let mut out_buffer = Cursor::new(Vec::new());
    
    // Write as JPEG with specified quality
    img.write_to(&mut out_buffer, image::ImageOutputFormat::Jpeg(quality))
        .map_err(|e| JsValue::from_str(&format!("Failed to compress image: {}", e)))?;

    Ok(out_buffer.into_inner())
}

#[wasm_bindgen]
pub fn merge_pdfs(files_array: js_sys::Array) -> Result<Vec<u8>, JsValue> {
    // 0. Setup Panic Hook for debugging
    console_error_panic_hook::set_once();
    
    // 1. Create a Master Document
    let mut master_doc = Document::with_version("1.5");
    
    // We need to setup a basic structure for the master doc if it's empty,
    // but typically we can simple take the first doc as base and append others,
    // OR create a blank one and append all.
    // Creating blank is safer for clean metadata.
    
    let mut pages_id = master_doc.new_object_id();
    let catalog_id = master_doc.new_object_id();
    
    // We will collect all page ObjectIds here
    let mut master_pages = Vec::new();
    
    // Map to track global objects (just for creating the catalog at the end)
    // Actually, we will just iterate inputs.

    // To merge:
    // We iterate each input PDF.
    // For each PDF, we shift its ObjectIDs so they don't collide with the Master (or previous).
    // Then we add its objects to Master.
    // We find its Pages and add them to `master_pages`.
    
    // JS Array handling
    for i in 0..files_array.length() {
        let file_js = files_array.get(i);
        let bytes = js_sys::Uint8Array::new(&file_js).to_vec();
        
        let mut doc = Document::load_from(Cursor::new(&bytes))
            .map_err(|e| JsValue::from_str(&format!("Failed to load PDF {}: {}", i, e)))?;
            
        // 2. Remap IDs
        // We need a map of OldID -> NewID for this document.
        let mut id_map = std::collections::BTreeMap::new();
        
        // Generate new IDs in Master for every object in Doc
        for &old_id in doc.objects.keys() {
            let new_id = master_doc.new_object_id();
            id_map.insert(old_id, new_id);
        }
        
        // Helper to renumber objects
        // We traverse all objects in `doc` and replace references using `id_map`.
        for (_, object) in doc.objects.iter_mut() {
            renumber_object(object, &id_map);
        }
        
        // 3. Move Objects to Master
        // We assume `doc.get_pages()` works on the *original* doc structure? 
        // Wait, we just mutated `doc.objects` in place? No, we mutated the *content* of objects (references), 
        // but the keys in `doc.objects` are still old_ids? Yes.
        
        // We need to identify Pages BEFORE we move them or rely on the map.
        // `doc.get_pages()` relies on crawling the Page Tree. 
        // If we mutated references in properties (Kids, Pages), `get_pages` might fail if links are now pointing to new_ids 
        // but the objects keying them are still old_ids in `doc.objects`.
        
        // Strategy: 
        // Get pages FIRST.
        let current_pages = doc.get_pages(); // BTreeMap<u32, ObjectId> (OldIDs)
        
        // Sort by page number to maintain order
        let mut sorted_pages: Vec<lopdf::ObjectId> = current_pages.into_iter().map(|(_, id)| id).collect();
        // Since BTreeMap is sorted by key (page num), `values()` is mostly ordered, but let's trust the iterator.
        
        // Now copy objects to master with NEW keys.
        for (old_id, object) in doc.objects {
            if let Some(&new_id) = id_map.get(&old_id) {
                master_doc.objects.insert(new_id, object);
            }
        }
        
        // 4. Add Pages to Master List
        for old_page_id in sorted_pages {
             if let Some(&new_page_id) = id_map.get(&old_page_id) {
                 master_pages.push(new_page_id);
             }
        }
    }
    
    // 5. Finalize Master Document Structure (Catalog & Pages)
    // Create Pages Dictionary
    let mut pages_dict = lopdf::Dictionary::new();
    pages_dict.set("Type", lopdf::Object::Name(b"Pages".to_vec()));
    pages_dict.set("Count", lopdf::Object::Integer(master_pages.len() as i64));
    
    // Kids array
    let kids: Vec<lopdf::Object> = master_pages.into_iter().map(lopdf::Object::Reference).collect();
    pages_dict.set("Kids", lopdf::Object::Array(kids));
    
    master_doc.objects.insert(pages_id, lopdf::Object::Dictionary(pages_dict));
    
    // Create Catalog
    let mut catalog_dict = lopdf::Dictionary::new();
    catalog_dict.set("Type", lopdf::Object::Name(b"Catalog".to_vec()));
    catalog_dict.set("Pages", lopdf::Object::Reference(pages_id));
    master_doc.objects.insert(catalog_id, lopdf::Object::Dictionary(catalog_dict));
    
    // Set Trailer
    master_doc.trailer.set("Root", lopdf::Object::Reference(catalog_id));
    // Remove ID to force regeneration or just leave it clean?
    // master_doc.trailer.remove(b"ID"); 
    
    // 6. Save
    let mut out_buffer = Vec::new();
    master_doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save merged PDF: {}", e)))?;
        
    Ok(out_buffer)
}

// Helper to recursively renumber IDs in an Object
fn renumber_object(object: &mut lopdf::Object, id_map: &std::collections::BTreeMap<lopdf::ObjectId, lopdf::ObjectId>) {
    match *object {
        lopdf::Object::Reference(ref mut id) => {
            if let Some(new_id) = id_map.get(id) {
                *id = *new_id;
            }
        },
        lopdf::Object::Array(ref mut arr) => {
            for item in arr {
                renumber_object(item, id_map);
            }
        },
        lopdf::Object::Dictionary(ref mut dict) => {
            for (_, value) in dict.iter_mut() {
                renumber_object(value, id_map);
            }
        },
        lopdf::Object::Stream(ref mut stream) => {
             for (_, value) in stream.dict.iter_mut() {
                renumber_object(value, id_map);
            }
        },
        _ => {}
    }
}


#[wasm_bindgen]
pub fn convert_image(image_bytes: &[u8], format: &str) -> Result<Vec<u8>, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    let mut out_buffer = Cursor::new(Vec::new());
    
    let output_format = match format {
        "png" => image::ImageOutputFormat::Png,
        "jpeg" | "jpg" => image::ImageOutputFormat::Jpeg(85), // Default quality
        "webp" => image::ImageOutputFormat::WebP,
        "bmp" => image::ImageOutputFormat::Bmp,
        _ => return Err(JsValue::from_str("Unsupported output format")),
    };

    img.write_to(&mut out_buffer, output_format)
        .map_err(|e| JsValue::from_str(&format!("Failed to convert image: {}", e)))?;

    Ok(out_buffer.into_inner())
}

#[wasm_bindgen]
pub fn split_pdf(pdf_bytes: &[u8], start_page: u32, end_page: u32) -> Result<Vec<u8>, JsValue> {
    // Basic Split: Load doc, prune undefined pages, save.
    // Note: start_page is 1-indexed (from UI usually), ensure we handle 0-indexed logic if needed.
    // Let's assume input is 1-indexed.
    
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // Validate range
    let pages = doc.get_pages();
    let total_pages = pages.len() as u32;
    if start_page < 1 || end_page > total_pages || start_page > end_page {
         return Err(JsValue::from_str(&format!("Invalid page range: {}-{} (Total: {})", start_page, end_page, total_pages)));
    }
    
    // Collect IDs of pages to KEEP
    // Pages are usually stored by Object ID in the page tree.
    // doc.get_pages() returns BTreeMap<u32, ObjectId> where key is page number (1-indexed).
    
    let mut pages_to_delete = Vec::new();
    for (page_num, _) in pages {
        if page_num < start_page || page_num > end_page {
            pages_to_delete.push(page_num);
        }
    }
    
    // Delete unwanted pages
    doc.delete_pages(&pages_to_delete);
    // Prune objects not used? `doc.prune_objects()` available in newer lopdf?
    // 0.31.0 has `prune_objects` but sometimes it is finicky. 
    // `doc.save_to` generally writes accessible objects. 
    // However, without pruning, the file size might remain large (containing hidden pages).
    // Let's try basic `prune_objects()` if available, or just save.
    
    doc.prune_objects(); 

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
         .map_err(|e| JsValue::from_str(&format!("Failed to save split PDF: {}", e)))?;

     Ok(out_buffer)
}

#[wasm_bindgen]
pub fn resize_image(image_bytes: &[u8], width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    // Use fast resizing (Nearest) or High Quality (Lanczos3)?
    // FilterType::Lanczos3 is best for quality/downscaling.
    let resized = img.resize_exact(width, height, image::imageops::FilterType::Lanczos3);

    let mut out_buffer = Cursor::new(Vec::new());
    // Default to JPEG for output to save size, or match input?
    // Let's output PNG to support transparency if present? Or JPEG for photos.
    // For simplicity, let's output PNG (lossless-ish).
    resized.write_to(&mut out_buffer, image::ImageOutputFormat::Png)
        .map_err(|e| JsValue::from_str(&format!("Failed to save resized image: {}", e)))?;

    Ok(out_buffer.into_inner())
}

#[wasm_bindgen]
pub fn decrypt_pdf(pdf_bytes: &[u8], password: &str) -> Result<Vec<u8>, JsValue> {
    // Load the document
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // Decrypt (lopdf supports standard encryption)
    // Note: This relies on lopdf's built-in decrypt being available and capable.
    // If files are not encrypted, this might be a no-op or error.
    
    // We try to decrypt with the provided password.
    // `decrypt` returns Result<(), Error>
    match doc.decrypt(password.as_bytes()) {
        Ok(_) => {},
        Err(e) => {
            // If it failed, check if it was actually encrypted.
            if doc.is_encrypted() {
                 return Err(JsValue::from_str(&format!("Decryption failed (Wrong Password?): {}", e)));
            }
            // If not encrypted, we just return the bytes as is (or save the doc).
        }
    }
    
    // If successfully decrypted, the objects are now accessible.
    // We need to save it back *without* encryption.
    // lopdf saves without encryption by default unless encrypt dictionary is set?
    // We should remove the Encrypt dictionary to be sure.
    doc.trailer.remove(b"Encrypt");

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save decrypted PDF: {}", e)))?;

    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn encrypt_pdf(_pdf_bytes: &[u8], _password: &str) -> Result<Vec<u8>, JsValue> {
    // Encrypting is complex in lopdf 0.31 (needs manual setup of security handler).
    // For this Wasm Pilot, providing full encryption (RC4/AES) manually is verbose.
    // 
    // IF lopdf doesn't have `encrypt()` method exposed conveniently:
    // We might have to return an "Not Implemented" or use a placeholder.
    // 
    // Checking memory: lopdf DOES NOT have a simple `doc.encrypt(pass)` method.
    // It requires constructing the Encrypt dictionary and Encrypting streams.
    // 
    // DECISION: To avoid breaking the build with bad implementation, 
    // I will return an error for now explaining it needs a heavier crate (like `pdf_writer` or `pdf-rs` 
    // or careful implementation).
    // 
    // HOWEVER, user asked for it. 
    // I will try to use a simple approach if possible, but encryption is sensitive.
    // 
    // Fallback: Return Error recommending Python for Encryption, OR just Stub it.
    // Given the previous "Merge" experience, I will be honest.
    
    // Attempting basic encryption or returning error.
    return Err(JsValue::from_str("Client-side Encryption is not yet fully supported in this Wasm module. Please use the backend tool (Python) for robust encryption."));
}

#[wasm_bindgen]
pub fn watermark_pdf(pdf_bytes: &[u8], text: &str) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // We need to add a font resource to each page or globally.
    // For simplicity, we'll try to use a standard font /Helvetica.
    // We strictly need to add it to the Resources dictionary of the page.
    // 
    // Plan:
    // 1. Create a Stream Object with the watermark content.
    // 2. Add it to the document.
    // 3. For each page, append this Stream's ID to the "Contents" array.
    // 4. Update "Resources" -> "Font" -> "F1" -> Reference(StandardFont).
    // 1. Create Font Object
    let mut font_dict = lopdf::Dictionary::new();
    font_dict.set("Type", lopdf::Object::Name(b"Font".to_vec()));
    font_dict.set("Subtype", lopdf::Object::Name(b"Type1".to_vec()));
    font_dict.set("BaseFont", lopdf::Object::Name(b"Helvetica".to_vec()));
    let font_id = doc.add_object(font_dict);

    // 2. Iterate pages
    let pages = doc.get_pages();
    
    for (page_num, page_id) in pages {
        // Calculate dimensions from MediaBox
        let media_box = doc.get_object(page_id)
             .and_then(|o| o.as_dict())
             .and_then(|d| d.get(b"MediaBox"))
             .and_then(|o| o.as_array())
             .map(|a| a.iter().map(|o| obj_to_f64(o)).collect::<Vec<f64>>())
             .unwrap_or(vec![0.0, 0.0, 595.0, 842.0]);
             
        let width = media_box.get(2).unwrap_or(&595.0) - media_box.get(0).unwrap_or(&0.0);
        let height = media_box.get(3).unwrap_or(&842.0) - media_box.get(1).unwrap_or(&0.0);
        
        let x = width / 2.0 - 100.0;
        let y = height / 2.0;

        let safe_text = text.replace("(", "\\(").replace(")", "\\)");
        
        // Watermark Content Stream
        // Use unique font name /WmkFont to avoid collision with existing /F1
        // Use BT ... ET block for text object
        let content = format!(
            "q 1 0 0 rg BT /WmkFont 48 Tf 0.707 0.707 -0.707 0.707 {} {} Tm ({}) Tj ET Q", 
            x, y, safe_text
        );

        let stream = lopdf::Stream::new(lopdf::Dictionary::new(), content.as_bytes().to_vec());
        let stream_id = doc.add_object(stream);

        // ... (Resource logic)
        
        let mut new_resources: Option<lopdf::Object> = None;
        
        // Step A: Read existing Resources
        if let Ok(page) = doc.get_object(page_id) {
            if let Ok(dict) = page.as_dict() {
                 if let Ok(res_obj) = dict.get(b"Resources") {
                     match *res_obj {
                         lopdf::Object::Reference(rid) => {
                             if let Ok(resolved_res) = doc.get_object(rid) {
                                  new_resources = Some(resolved_res.clone());
                             }
                         },
                         lopdf::Object::Dictionary(_) => {
                              new_resources = Some(res_obj.clone());
                         },
                         _ => {}
                     }
                 } else {
                     new_resources = Some(lopdf::Object::Dictionary(lopdf::Dictionary::new()));
                 }
            }
        }
        
        // Step B: Modify the Cloned Resources (add Font)
        if let Some(mut res_obj) = new_resources {
            if let Ok(res_dict) = res_obj.as_dict_mut() {
                 if !res_dict.has(b"Font") {
                     res_dict.set("Font", lopdf::Dictionary::new());
                 }
                 if let Ok(fonts) = res_dict.get_mut(b"Font").and_then(|o| o.as_dict_mut()) {
                     fonts.set("WmkFont", lopdf::Object::Reference(font_id));
                 }
            }
            
            // Step C: Write back to Page
            if let Ok(page) = doc.get_object_mut(page_id) {
                if let Ok(dict) = page.as_dict_mut() {
                    // Update Resources
                    dict.set("Resources", res_obj);
                    
                    // Add Content Stream
                    match dict.get_mut(b"Contents") {
                        Ok(obj) => {
                            if let Ok(arr) = obj.as_array_mut() {
                                arr.push(lopdf::Object::Reference(stream_id));
                            } else if let Ok(r) = obj.as_reference() {
                                dict.set("Contents", lopdf::Object::Array(vec![
                                    lopdf::Object::Reference(r),
                                    lopdf::Object::Reference(stream_id)
                                ]));
                            }
                        },
                        Err(_) => {
                             dict.set("Contents", lopdf::Object::Reference(stream_id));
                        }
                    }
                }
            }
        }
    }

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save watermarked PDF: {}", e)))?;

    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn remove_pages(pdf_bytes: &[u8], page_nums: Vec<u32>) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // lopdf delete_pages expects slice of u32 (1-indexed)
    doc.delete_pages(&page_nums);
    doc.prune_objects();

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save PDF: {}", e)))?;

    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn extract_pages(pdf_bytes: &[u8], page_nums: Vec<u32>) -> Result<Vec<u8>, JsValue> {
    // Strategy: Create new doc, copy pages from old doc.
    // Or: Load doc, delete everything EXCEPT page_nums.
    // Deletion is easier to preserve resources.
    
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    let pages = doc.get_pages();
    let mut pages_to_delete = Vec::new();

    // Identify pages NOT in our list
    for (page_num, _) in pages {
        if !page_nums.contains(&page_num) {
            pages_to_delete.push(page_num);
        }
    }
    
    doc.delete_pages(&pages_to_delete);
    // doc.prune_objects(); // CAUTION: Pruning can break shared resources in some PDFs, causing blank pages.

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
         .map_err(|e| JsValue::from_str(&format!("Failed to save extracted PDF: {}", e)))?;

    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn reorder_pages(pdf_bytes: &[u8], page_order: Vec<u32>) -> Result<Vec<u8>, JsValue> {
    // ... (existing reorder implementation kept same) ...
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    let pages = doc.get_pages();
    for &p in &page_order {
        if !pages.contains_key(&p) {
             return Err(JsValue::from_str(&format!("Page {} not found in document", p)));
        }
    }
    
    let new_page_object_ids: Vec<lopdf::ObjectId> = page_order.iter()
        .map(|p| *pages.get(p).unwrap())
        .collect();

    let catalog_id = doc.trailer.get(b"Root")
        .and_then(|obj| obj.as_reference())
        .map_err(|_| JsValue::from_str("Missing Root"))?;
        
    let mut pages_id = {
        let catalog = doc.get_object(catalog_id).and_then(|o| o.as_dict())
            .map_err(|_| JsValue::from_str("Invalid Catalog"))?;
        catalog.get(b"Pages").and_then(|o| o.as_reference())
            .map_err(|_| JsValue::from_str("Missing Pages"))?
    };
    
    doc.get_object_mut(pages_id).and_then(|obj| {
        let dict = obj.as_dict_mut()?;
        let kids: Vec<lopdf::Object> = new_page_object_ids.into_iter()
            .map(lopdf::Object::Reference)
            .collect();
        dict.set("Kids", lopdf::Object::Array(kids));
        dict.set("Count", lopdf::Object::Integer(page_order.len() as i64));
        Ok(())
    }).map_err(|_| JsValue::from_str("Failed to modify Pages tree"))?;
    
    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save reordered PDF: {}", e)))?;

    Ok(out_buffer)
}

fn obj_to_f64(obj: &lopdf::Object) -> f64 {
    match *obj {
        lopdf::Object::Real(f) => f as f64,
        lopdf::Object::Integer(i) => i as f64,
        _ => 0.0,
    }
}

#[wasm_bindgen]
pub fn add_page_numbers(pdf_bytes: &[u8], position: &str) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    let mut font_dict = lopdf::Dictionary::new();
    font_dict.set("Type", lopdf::Object::Name(b"Font".to_vec()));
    font_dict.set("Subtype", lopdf::Object::Name(b"Type1".to_vec()));
    font_dict.set("BaseFont", lopdf::Object::Name(b"Helvetica".to_vec()));
    let font_id = doc.add_object(font_dict);

    let pages = doc.get_pages();
    let total_pages = pages.len();
    
    for (page_num, page_id) in pages {
        let media_box = doc.get_object(page_id)
             .and_then(|o| o.as_dict())
             .and_then(|d| d.get(b"MediaBox"))
             .and_then(|o| o.as_array())
             .map(|a| a.iter().map(|o| obj_to_f64(o)).collect::<Vec<f64>>())
             .unwrap_or(vec![0.0, 0.0, 595.0, 842.0]);
             
        let width = media_box.get(2).unwrap_or(&595.0) - media_box.get(0).unwrap_or(&0.0);
        let height = media_box.get(3).unwrap_or(&842.0) - media_box.get(1).unwrap_or(&0.0);
        
        let x = width / 2.0 - 20.0;
        let y = if position == "top" { height - 20.0 } else { 20.0 };
        
        let text = format!("Page {} of {}", page_num, total_pages);
        
        let content = format!(
            "q 0 0 0 rg /F_PN 10 Tf 1 0 0 1 {} {} Tm ({}) Tj Q", 
            x, y, text
        );

        let stream = lopdf::Stream::new(lopdf::Dictionary::new(), content.as_bytes().to_vec());
        let stream_id = doc.add_object(stream);
        
        if let Ok(page) = doc.get_object_mut(page_id) {
            if let Ok(dict) = page.as_dict_mut() {
                 match dict.get_mut(b"Contents") {
                    Ok(obj) => {
                        if let Ok(arr) = obj.as_array_mut() {
                            arr.push(lopdf::Object::Reference(stream_id));
                        } else if let Ok(r) = obj.as_reference() {
                            dict.set("Contents", lopdf::Object::Array(vec![
                                lopdf::Object::Reference(r),
                                lopdf::Object::Reference(stream_id)
                            ]));
                        }
                    },
                    Err(_) => {
                         dict.set("Contents", lopdf::Object::Reference(stream_id));
                    }
                }
                
                if !dict.has(b"Resources") {
                     dict.set("Resources", lopdf::Dictionary::new());
                }
                if let Ok(res) = dict.get_mut(b"Resources").and_then(|o| o.as_dict_mut()) {
                    if !res.has(b"Font") {
                        res.set("Font", lopdf::Dictionary::new());
                    }
                    if let Ok(fonts) = res.get_mut(b"Font").and_then(|o| o.as_dict_mut()) {
                        fonts.set("F_PN", lopdf::Object::Reference(font_id));
                    }
                }
            }
        }
    }

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save PDF: {}", e)))?;
    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn crop_pdf(pdf_bytes: &[u8], margin: f64) -> Result<Vec<u8>, JsValue> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    for (_, object_id) in doc.get_pages() {
        if let Ok(page) = doc.get_object_mut(object_id) {
            if let Ok(dict) = page.as_dict_mut() {
                 let current_box = dict.get(b"MediaBox")
                     .and_then(|o| o.as_array())
                     .map(|a| a.iter().map(|o| obj_to_f64(o)).collect::<Vec<f64>>());
                
                if let Ok(bbox) = current_box {
                    if bbox.len() == 4 {
                        // Margin logic: shrink from all sides? Or just trim white space?
                        // User input is "margin" in likely points.
                        // We increase X1/Y1 and decrease X2/Y2.
                        let x1 = bbox[0] + margin;
                        let y1 = bbox[1] + margin;
                        let x2 = bbox[2] - margin;
                        let y2 = bbox[3] - margin;
                        
                        let new_box = vec![
                            lopdf::Object::Real(x1 as f32),
                            lopdf::Object::Real(y1 as f32),
                            lopdf::Object::Real(x2 as f32),
                            lopdf::Object::Real(y2 as f32)
                        ];
                        dict.set("MediaBox", lopdf::Object::Array(new_box));
                    }
                }
            }
        }
    }

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save cropped PDF: {}", e)))?;
    Ok(out_buffer)
}

// Enable console logging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn compress_pdf(pdf_bytes: &[u8], options_str: &str) -> Result<Vec<u8>, JsValue> {
    use image::GenericImageView;

    console_log!("Starting compression with options: {}", options_str);

    let mut doc = Document::load_from(Cursor::new(pdf_bytes))
        .map_err(|e| JsValue::from_str(&format!("Failed to load PDF: {}", e)))?;

    // Parse options: simple presets or custom "dpi:X,q:Y" string
    let (mut max_dim, mut quality) = match options_str {
        "strong" | "screen" => (800, 40), 
        "basic" | "ebook" => (1500, 75), 
        "printer" => (2400, 90),          
        _ => (1500, 75),                  
    };

    // Simple custom parser "custom:max_dim:X,q:Y"
    if options_str.starts_with("custom:") {
        let parts: Vec<&str> = options_str.split(',').collect();
        for Part in parts {
            if let Some(val) = Part.strip_prefix("max_dim:") {
                max_dim = val.parse().unwrap_or(1500);
            } else if let Some(val) = Part.strip_prefix("q:") {
                quality = val.parse().unwrap_or(75);
            }
        }
    }
    
    if options_str == "email" {
        max_dim = 600; 
        quality = 30;  
    }

    console_log!("Settings - Max Dim: {}, Quality: {}", max_dim, quality);

    if max_dim > 0 {
        let mut image_ids = Vec::new();
        for (id, obj) in &doc.objects {
            if let Ok(dict) = obj.as_dict() {
                if dict.get(b"Type").and_then(|o| o.as_name_str()).unwrap_or("") == "XObject" &&
                   dict.get(b"Subtype").and_then(|o| o.as_name_str()).unwrap_or("") == "Image" {
                    image_ids.push(*id);
                }
            }
        }
        
        console_log!("Found {} candidate images.", image_ids.len());

        for id in image_ids {
            let mut new_stream_data: Option<(Vec<u8>, u32, u32)> = None;
            let mut raw_width = 0u32;
            let mut raw_height = 0u32;
            let mut img_result: Option<image::DynamicImage> = None;
            let mut colorspace_name = String::new();

             if let Ok(stream) = doc.get_object(id).and_then(|o| o.as_stream()) {
                 let dict = &stream.dict;
                 raw_width = dict.get(b"Width").and_then(|o| o.as_i64()).unwrap_or(0) as u32;
                 raw_height = dict.get(b"Height").and_then(|o| o.as_i64()).unwrap_or(0) as u32;
                  
                  if let Ok(cs) = dict.get(b"ColorSpace") {
                      if let Ok(name) = cs.as_name_str() {
                          colorspace_name = name.to_string();
                      } else if let Ok(arr) = cs.as_array() {
                          if arr.len() > 0 {
                              if let Ok(name) = arr[0].as_name_str() {
                                  colorspace_name = name.to_string();
                              }
                          }
                      }
                  }
             }

            if let Ok(stream) = doc.get_object_mut(id).and_then(|o| o.as_stream_mut()) {
                if let Ok(data) = stream.decompressed_content() {
                    let original_size = data.len();

                    if let Ok(img) = image::load_from_memory(&data) {
                        img_result = Some(img);
                    } else {
                         let num_pixels = (raw_width * raw_height) as usize;
                         if num_pixels > 0 {
                             if data.len() == num_pixels {
                                 console_log!("Image {}: Detected Grayscale.", id.0);
                                 if let Some(buf) = image::ImageBuffer::<image::Luma<u8>, Vec<u8>>::from_raw(raw_width, raw_height, data.clone()) {
                                     img_result = Some(image::DynamicImage::ImageLuma8(buf));
                                 }
                             } else if data.len() == num_pixels * 3 {
                                 console_log!("Image {}: Detected RGB.", id.0);
                                 if let Some(buf) = image::ImageBuffer::<image::Rgb<u8>, Vec<u8>>::from_raw(raw_width, raw_height, data.clone()) {
                                     img_result = Some(image::DynamicImage::ImageRgb8(buf));
                                 }
                             } else if data.len() == num_pixels * 4 {
                                 console_log!("Image {}: Detected CMYK/RGBA.", id.0);
                                 let is_cmyk = colorspace_name == "DeviceCMYK";
                                 let mut rgb_data = Vec::with_capacity(num_pixels * 3);
                                 
                                 if is_cmyk {
                                    for chunk in data.chunks(4) {
                                        if chunk.len() < 4 { break; }
                                        let c = chunk[0] as f32 / 255.0;
                                        let m = chunk[1] as f32 / 255.0;
                                        let y = chunk[2] as f32 / 255.0;
                                        let k = chunk[3] as f32 / 255.0;
                                        
                                        // Simple CMYK to RGB
                                        let r = (1.0 - c) * (1.0 - k);
                                        let g = (1.0 - m) * (1.0 - k);
                                        let b = (1.0 - y) * (1.0 - k);
                                        
                                        rgb_data.push((r * 255.0) as u8);
                                        rgb_data.push((g * 255.0) as u8);
                                        rgb_data.push((b * 255.0) as u8);
                                    }
                // ... existing code ...


                                     for chunk in data.chunks(4) {
                                        if chunk.len() < 4 { break; }
                                         rgb_data.push(chunk[0]);
                                         rgb_data.push(chunk[1]);
                                         rgb_data.push(chunk[2]);
                                     }
                                 }
                                 if let Some(buf) = image::ImageBuffer::<image::Rgb<u8>, Vec<u8>>::from_raw(raw_width, raw_height, rgb_data) {
                                     img_result = Some(image::DynamicImage::ImageRgb8(buf));
                                 }
                             }
                         }
                    }

                    if let Some(img) = img_result {
                        let (w, h) = img.dimensions();
                        let should_resize = w > max_dim || h > max_dim;
                        
                        let processed = if should_resize {
                            img.resize(max_dim, max_dim, image::imageops::FilterType::Lanczos3)
                        } else {
                            if quality < 80 { img } else { img }
                        };
                        
                        let (nw, nh) = processed.dimensions();
                        let mut comp_buf = Cursor::new(Vec::new());
                        if let Ok(_) = processed.write_to(&mut comp_buf, image::ImageOutputFormat::Jpeg(quality)) {
                             let compressed_bytes = comp_buf.into_inner();
                             let comp_len = compressed_bytes.len();
                             
                             // VITAL: Only replace if it actually shrinks!
                             if comp_len < original_size {
                                 console_log!("Image {}: Compressed {} -> {} ({}%)", id.0, original_size, comp_len, (comp_len * 100 / original_size));
                                 new_stream_data = Some((compressed_bytes, nw, nh));
                             } else {
                                 console_log!("Image {}: Skipping. New size {} >= Original {}", id.0, comp_len, original_size);
                             }
                        }
                    }
                }
            }

            if let Some((data, w, h)) = new_stream_data {
                if let Ok(stream) = doc.get_object_mut(id).and_then(|o| o.as_stream_mut()) {
                    stream.content = data;
                    stream.dict.set("Filter", lopdf::Object::Name(b"DCTDecode".to_vec()));
                    stream.dict.set("Width", lopdf::Object::Integer(w as i64));
                    stream.dict.set("Height", lopdf::Object::Integer(h as i64));
                    // Critical: Remove old decompression params
                    stream.dict.remove(b"Length");
                    stream.dict.remove(b"DecodeParms");
                    stream.dict.remove(b"BitsPerComponent"); 
                    stream.dict.set("ColorSpace", lopdf::Object::Name(b"DeviceRGB".to_vec())); 
                }
            }
        }
    }
    
    doc.compress(); 
    doc.prune_objects();

    let mut out_buffer = Vec::new();
    doc.save_to(&mut out_buffer)
        .map_err(|e| JsValue::from_str(&format!("Failed to save compressed PDF: {}", e)))?;
        
    Ok(out_buffer)
}

#[wasm_bindgen]
pub fn bitmap_to_svg(image_bytes: &[u8]) -> Result<String, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    let width = img.width() as usize;
    let height = img.height() as usize;
    let img_rgba = img.into_rgba8();
    let pixels = img_rgba.into_raw(); // Vec<u8>

    // Visioncortex ColorImage takes Vec<u8> (RGBA assumed)
    let color_image = ColorImage {
        pixels,
        width,
        height,
    };

    let config = Config::default();
    
    // vtracer::convert returns Result<SvgFile, ...>
    let svg = convert(color_image, config)
        .map_err(|e| JsValue::from_str(&format!("Vectorization failed: {}", e)))?;

    // SvgFile implements Display or to_string?
    // Compiler suggested using conversion method.
    // We try to_string() as per common Rust pattern or SvgFile API.
    Ok(svg.to_string())
}
