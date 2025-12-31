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
