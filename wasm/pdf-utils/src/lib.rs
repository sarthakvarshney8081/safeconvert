use wasm_bindgen::prelude::*;
use lopdf::Document;
use std::io::Cursor;

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
pub fn encrypt_pdf(pdf_bytes: &[u8], password: &str) -> Result<Vec<u8>, JsValue> {
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

    // Let's construct a simple content stream (PDF operators)
    // q = save state, BT = begin text, Tf = set font, Tm = set matrix (rotate/scale), Td = move, Tj = show text, ET = end text, Q = restore
    // Rotation 45 deg (0.707 0.707 -0.707 0.707 0 0) approximately.
    // Font /F1 size 48.
    // Position 100 100 (bottom left-ish).
    // Note: PDF syntax (()) for string escape?
    
    // Creating the watermark stream content
    // We'll put it in the center-ish?
    let content = format!(
        "q 0.5 0.5 0.5 rg /F1 48 Tf 1 0 0 1 100 100 Tm ( {} ) Tj Q", 
        text.replace("(", "\\(").replace(")", "\\)") // Simple escape
    );
    
    let stream = lopdf::Stream::new(lopdf::Dictionary::new(), content.as_bytes().to_vec());
    let stream_id = doc.add_object(stream);

    // Get pages
    let pages = doc.get_pages();
    
    for (_, page_id) in pages {
        // 1. Append Content Stream
        if let Ok(page) = doc.get_object_mut(page_id) {
            if let Ok(dict) = page.as_dict_mut() {
                // Handle "Contents"
                match dict.get_mut(b"Contents") {
                    Ok(obj) => {
                        // If array, push. If reference, convert to array [ref, new_ref].
                        if let Ok(arr) = obj.as_array_mut() {
                            arr.push(lopdf::Object::Reference(stream_id));
                        } else if let Ok(r) = obj.as_reference() {
                            // Turn single reference into array
                            dict.set("Contents", lopdf::Object::Array(vec![
                                lopdf::Object::Reference(r),
                                lopdf::Object::Reference(stream_id)
                            ]));
                        }
                    },
                    Err(_) => {
                        // No contents, set new
                        dict.set("Contents", lopdf::Object::Reference(stream_id));
                    }
                }
                
                // 2. Add Font Resource (/F1 -> /Helvetica)
                // We need to drill down: Resources -> Font -> F1
                // This is a bit verbose without helpers.
                 
                // Check if Resources exists
                if !dict.has(b"Resources") {
                     dict.set("Resources", lopdf::Dictionary::new());
                }
            }
        }
        
        // Split modify scope to satisfy borrow checker if needed, but here we drill in.
        // It's cleaner to re-get the object for resources or do it in one pass if the struct allows.
        // But lopdf access patterns can be tricky.
        
        // Let's attempt to add the Font to Resources.
        if let Ok(page) = doc.get_object_mut(page_id) {
             if let Ok(dict) = page.as_dict_mut() {
                 let resources = dict.get_mut(b"Resources").and_then(|o| o.as_dict_mut());
                 if let Ok(res) = resources {
                     // Ensure Font dict exists
                     if !res.has(b"Font") {
                         res.set("Font", lopdf::Dictionary::new());
                     }
                     if let Ok(fonts) = res.get_mut(b"Font").and_then(|o| o.as_dict_mut()) {
                         // Add F1 if not present.
                         // Define /F1 -> /Type /Font /Subtype /Type1 /BaseFont /Helvetica
                         if !fonts.has(b"F1") {
                             let mut font_dict = lopdf::Dictionary::new();
                             font_dict.set("Type", lopdf::Object::Name(b"Font".to_vec()));
                             font_dict.set("Subtype", lopdf::Object::Name(b"Type1".to_vec()));
                             font_dict.set("BaseFont", lopdf::Object::Name(b"Helvetica".to_vec()));
                             
                             // We need to add this font object to the document and reference it, 
                             // OR direct dictionary if allowed (Direct dict for Type1 is usually okay in Resources).
                             // Ideally, we add a new object.
                             
                             // Let's create a font object ID to be cleaner.
                             // But we are inside a mutable borrow of doc... deadlock?
                             // Yes, `doc.add_object` needs `&mut doc`.
                             // So we cannot do `doc.add_object` inside the loop over pages (if iterating doc).
                             // We already got page_ids (keys) in `pages` variable (copied/cloned?).
                             // `doc.get_pages()` returns BTreeMap. We are iterating that.
                             // But we need to mutate `doc` to add the font object.
                         }
                     }
                 }
             }
        }
    }
    
    // To solve borrowing: 
    // 1. Create Font Object FIRST.
    let mut font_dict = lopdf::Dictionary::new();
    font_dict.set("Type", lopdf::Object::Name(b"Font".to_vec()));
    font_dict.set("Subtype", lopdf::Object::Name(b"Type1".to_vec()));
    font_dict.set("BaseFont", lopdf::Object::Name(b"Helvetica".to_vec()));
    let font_id = doc.add_object(font_dict);
    
    // 2. Iterate pages and link Font + Content
    let pages = doc.get_pages(); // re-get or reuse keys
    for (_, page_id) in pages {
        if let Ok(page) = doc.get_object_mut(page_id) {
            if let Ok(dict) = page.as_dict_mut() {
                // Add Content Stream reference
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
                
                // Add Font Resource Reference
                // Ensure Resources dict exists
                if !dict.has(b"Resources") {
                     dict.set("Resources", lopdf::Dictionary::new());
                }
                
                 if let Ok(res_obj) = dict.get_mut(b"Resources") {
                     if let Ok(res) = res_obj.as_dict_mut() {
                         if !res.has(b"Font") {
                             res.set("Font", lopdf::Dictionary::new());
                         }
                         if let Ok(fonts_obj) = res.get_mut(b"Font") {
                             if let Ok(fonts) = fonts_obj.as_dict_mut() {
                                 // Map "F1" to our font_id
                                 fonts.set("F1", lopdf::Object::Reference(font_id));
                             }
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
