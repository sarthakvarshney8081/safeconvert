use wasm_bindgen::prelude::*;
use lopdf::{Document, Object, Dictionary, Stream, ObjectId};
use std::io::Cursor;
use vtracer::{Config, convert};
use visioncortex::ColorImage;
use image::GenericImageView;

type Result<T> = std::result::Result<T, JsValue>;

#[wasm_bindgen]
pub fn crop_pdf(pdf_bytes: &[u8], x: f32, y: f32, width: f32, height: f32, page_limit: i32) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mb = vec![Object::Real(x), Object::Real(y), Object::Real(x + width), Object::Real(y + height)];
    for (_, pid) in doc.get_pages() {
        if let Ok(po) = doc.get_object_mut(pid) {
            if let Ok(pd) = po.as_dict_mut() {
                pd.set("MediaBox", Object::Array(mb.clone()));
            }
        }
    }
    let mut b = Vec::new();
    doc.save_to(&mut b).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(b)
}

#[wasm_bindgen]
pub fn rotate_pdf(pdf_bytes: &[u8], angle: i32) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    for (_, pid) in doc.get_pages() {
        if let Ok(po) = doc.get_object_mut(pid) {
            if let Ok(pd) = po.as_dict_mut() {
                let rot = match pd.get(b"Rotate") { Ok(o) => o.as_i64().unwrap_or(0), Err(_) => 0 };
                pd.set("Rotate", rot + angle as i64);
            }
        }
    }
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn compress_image(image_bytes: &[u8], quality: u8) -> Result<Vec<u8>> {
    let img = image::load_from_memory(image_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mut out = Cursor::new(Vec::new());
    img.write_to(&mut out, image::ImageOutputFormat::Jpeg(quality)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out.into_inner())
}

#[wasm_bindgen]
pub fn merge_pdfs(files: js_sys::Array) -> Result<Vec<u8>> {
    let mut master = Document::with_version("1.5");
    let pages_id = master.new_object_id();
    let catalog_id = master.new_object_id();
    let mut master_pages = Vec::new();
    for i in 0..files.length() {
        let bytes = js_sys::Uint8Array::new(&files.get(i)).to_vec();
        let mut doc = Document::load_from(Cursor::new(&bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let mut id_map = std::collections::BTreeMap::new();
        for &oid in doc.objects.keys() { id_map.insert(oid, master.new_object_id()); }
        for (_, obj) in doc.objects.iter_mut() { renumber_obj(obj, &id_map); }
        let current_pages = doc.get_pages();
        let sorted: Vec<ObjectId> = current_pages.into_iter().map(|(_, id)| id).collect();
        for (oid, obj) in doc.objects { if let Some(&nid) = id_map.get(&oid) { master.objects.insert(nid, obj); } }
        for pid in sorted { if let Some(&nid) = id_map.get(&pid) { master_pages.push(nid); } }
    }
    let mut pd = Dictionary::new();
    pd.set("Type", Object::Name(b"Pages".to_vec()));
    pd.set("Count", Object::Integer(master_pages.len() as i64));
    pd.set("Kids", Object::Array(master_pages.into_iter().map(Object::Reference).collect()));
    master.objects.insert(pages_id, Object::Dictionary(pd));
    let mut cd = Dictionary::new();
    cd.set("Type", Object::Name(b"Catalog".to_vec()));
    cd.set("Pages", Object::Reference(pages_id));
    master.objects.insert(catalog_id, Object::Dictionary(cd));
    master.trailer.set("Root", Object::Reference(catalog_id));
    let mut out = Vec::new();
    master.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

fn renumber_obj(obj: &mut Object, map: &std::collections::BTreeMap<ObjectId, ObjectId>) {
    match *obj {
        Object::Reference(ref mut id) => { if let Some(nid) = map.get(id) { *id = *nid; } },
        Object::Array(ref mut arr) => { for i in arr { renumber_obj(i, map); } },
        Object::Dictionary(ref mut dict) => { for (_, v) in dict.iter_mut() { renumber_obj(v, map); } },
        Object::Stream(ref mut s) => { for (_, v) in s.dict.iter_mut() { renumber_obj(v, map); } },
        _ => {}
    }
}

#[wasm_bindgen]
pub fn add_image_overlay(
    pdf_bytes: &[u8],
    image_bytes: &[u8],
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    page_index: i32,
) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let img = image::load_from_memory(image_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let rgb = img.to_rgb8();

    let mut image_dict = Dictionary::new();
    image_dict.set("Type", Object::Name(b"XObject".to_vec()));
    image_dict.set("Subtype", Object::Name(b"Image".to_vec()));
    image_dict.set("Width", Object::Integer(rgb.width() as i64));
    image_dict.set("Height", Object::Integer(rgb.height() as i64));
    image_dict.set("ColorSpace", Object::Name(b"DeviceRGB".to_vec()));
    image_dict.set("BitsPerComponent", Object::Integer(8));
    let iid = doc.add_object(Stream::new(image_dict, rgb.into_raw()));
    
    let page_id = *doc.get_pages().get(&(page_index as u32 + 1)).ok_or_else(|| JsValue::from_str("Page not found"))?;
    
    // Check Rotation
    let rotation = doc.get_object(page_id).and_then(|o| o.as_dict()).and_then(|d| d.get(b"Rotate")).and_then(|o| o.as_i64()).unwrap_or(0);
    
    // Rotation Adjustment
    // matrix: a b c d e f -> aX+cY+e, bX+dY+f
    // Default: width 0 0 height x y
    let matrix = match rotation % 360 {
        90 => format!("0 {} -{} 0 {} {}", width, height, x + width, y),
        180 => format!("-{} 0 0 -{} {} {}", width, height, x + width, y + height),
        270 => format!("0 -{} {} 0 {} {}", width, height, x, y + height),
        _ => format!("{} 0 0 {} {} {}", width, height, x, y),
    };

    let xname = format!("ImgSig{}", iid.0);
    let op = format!("q {} cm /{} Do Q", matrix, xname);
    let cid = doc.add_object(Stream::new(Dictionary::new(), op.as_bytes().to_vec()));

    if let Ok(po) = doc.get_object_mut(page_id) {
        if let Ok(pd) = po.as_dict_mut() {
            if !pd.has(b"Resources") { pd.set("Resources", Object::Dictionary(Dictionary::new())); }
            if let Ok(res) = pd.get_mut(b"Resources").and_then(|o| o.as_dict_mut()) {
                if !res.has(b"XObject") { res.set("XObject", Object::Dictionary(Dictionary::new())); }
                if let Ok(xo) = res.get_mut(b"XObject").and_then(|o| o.as_dict_mut()) { xo.set(xname, Object::Reference(iid)); }
            }
            match pd.get_mut(b"Contents") {
                Ok(obj) => {
                    if let Ok(arr) = obj.as_array_mut() { arr.push(Object::Reference(cid)); }
                    else if let Ok(r) = obj.as_reference() { pd.set("Contents", Object::Array(vec![Object::Reference(r), Object::Reference(cid)])); }
                },
                Err(_) => { pd.set("Contents", Object::Reference(cid)); }
            }
        }
    }
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn extract_pages(pdf_bytes: &[u8], page_nums: Vec<u32>) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let del: Vec<u32> = doc.get_pages().keys().filter(|&pn| !page_nums.contains(pn)).cloned().collect();
    doc.delete_pages(&del);
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn remove_pages(pdf_bytes: &[u8], page_nums: Vec<u32>) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    doc.delete_pages(&page_nums);
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn reorder_pages(pdf_bytes: &[u8], page_order: Vec<u32>) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let pages = doc.get_pages();
    let mut kids = Vec::new();
    for p in &page_order {
        if let Some(&pid) = pages.get(p) { kids.push(Object::Reference(pid)); }
        else { return Err(JsValue::from_str(&format!("Page {} not found", p))); }
    }
    let count = kids.len() as i64;
    let root_id = doc.trailer.get(b"Root").and_then(|o| o.as_reference()).map_err(|_| JsValue::from_str("No Root"))?;
    let pages_id = doc.get_object(root_id).and_then(|o| o.as_dict()).and_then(|d| d.get(b"Pages")).and_then(|o| o.as_reference()).map_err(|_| JsValue::from_str("No Pages"))?;
    if let Ok(po) = doc.get_object_mut(pages_id) {
        if let Ok(pd) = po.as_dict_mut() {
            pd.set("Kids", Object::Array(kids));
            pd.set("Count", Object::Integer(count));
        }
    }
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn watermark_pdf(pdf_bytes: &[u8], text: &str) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mut fd = Dictionary::new();
    fd.set("Type", Object::Name(b"Font".to_vec()));
    fd.set("Subtype", Object::Name(b"Type1".to_vec()));
    fd.set("BaseFont", Object::Name(b"Helvetica".to_vec()));
    let fid = doc.add_object(fd);
    
    let pages = doc.get_pages();
    for (&pn, &pid) in &pages {
        let mb = doc.get_object(pid).and_then(|o| o.as_dict()).and_then(|d| d.get(b"MediaBox")).and_then(|o| o.as_array())
             .map(|a| a.iter().map(|o| obj_to_f64(o)).collect::<Vec<f64>>()).unwrap_or(vec![0.0, 0.0, 595.0, 842.0]);
        let w = mb.get(2).unwrap_or(&595.0) - mb.get(0).unwrap_or(&0.0);
        let h = mb.get(3).unwrap_or(&842.0) - mb.get(1).unwrap_or(&0.0);
        let op = format!("q BT /F1 48 Tf 0.707 0.707 -0.707 0.707 {} {} Tm ({}) Tj ET Q", w/2.0-100.0, h/2.0, text.replace("(","\\(").replace(")","\\)"));
        let sid = doc.add_object(Stream::new(Dictionary::new(), op.as_bytes().to_vec()));
        if let Ok(po) = doc.get_object_mut(pid) {
            if let Ok(pd) = po.as_dict_mut() {
                if !pd.has(b"Resources") { pd.set("Resources", Object::Dictionary(Dictionary::new())); }
                if let Ok(res) = pd.get_mut(b"Resources").and_then(|o| o.as_dict_mut()) {
                    if !res.has(b"Font") { res.set("Font", Object::Dictionary(Dictionary::new())); }
                    if let Ok(fonts) = res.get_mut(b"Font").and_then(|o| o.as_dict_mut()) { fonts.set("F1", Object::Reference(fid)); }
                }
                match pd.get_mut(b"Contents") {
                    Ok(obj) => {
                        if let Ok(arr) = obj.as_array_mut() { arr.push(Object::Reference(sid)); }
                        else if let Ok(r) = obj.as_reference() { pd.set("Contents", Object::Array(vec![Object::Reference(r), Object::Reference(sid)])); }
                    },
                    Err(_) => { pd.set("Contents", Object::Reference(sid)); }
                }
            }
        }
    }
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

fn obj_to_f64(obj: &Object) -> f64 { match *obj { Object::Real(f) => f as f64, Object::Integer(i) => i as f64, _ => 0.0 } }

#[wasm_bindgen]
pub fn add_page_numbers(pdf_bytes: &[u8], margin: f32, position: &str, style: &str) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mut fd = Dictionary::new();
    fd.set("Type", Object::Name(b"Font".to_vec()));
    fd.set("Subtype", Object::Name(b"Type1".to_vec()));
    fd.set("BaseFont", Object::Name(b"Helvetica".to_vec()));
    let fid = doc.add_object(fd);
    let pages = doc.get_pages();
    let total = pages.len();
    for (&pn, &pid) in &pages {
        let mb = doc.get_object(pid).and_then(|o| o.as_dict()).and_then(|d| d.get(b"MediaBox")).and_then(|o| o.as_array())
             .map(|a| a.iter().map(|o| obj_to_f64(o)).collect::<Vec<f64>>()).unwrap_or(vec![0.0, 0.0, 595.0, 842.0]);
        let w = mb.get(2).unwrap_or(&595.0) - mb.get(0).unwrap_or(&0.0);
        let h = mb.get(3).unwrap_or(&842.0) - mb.get(1).unwrap_or(&0.0);
        let text = match style {
            "Page 1" => format!("Page {}", pn),
            "1 of n" => format!("{} of {}", pn, total),
            "Page 1 of n" => format!("Page {} of {}", pn, total),
            _ => format!("{}", pn),
        };
        let tw = (text.len() as f64) * 6.0;
        let y = if position.starts_with("top") { h - (margin as f64) - 10.0 } else { (margin as f64) };
        let x = if position.ends_with("left") { (margin as f64) } else if position.ends_with("right") { w - (margin as f64) - tw } else { (w/2.0) - (tw/2.0) };
        let op = format!("q BT /F_PN 10 Tf 1 0 0 1 {} {} Tm ({}) Tj ET Q", x, y, text);
        let sid = doc.add_object(Stream::new(Dictionary::new(), op.as_bytes().to_vec()));
        if let Ok(po) = doc.get_object_mut(pid) {
            if let Ok(pd) = po.as_dict_mut() {
                if !pd.has(b"Resources") { pd.set("Resources", Object::Dictionary(Dictionary::new())); }
                if let Ok(res) = pd.get_mut(b"Resources").and_then(|o| o.as_dict_mut()) {
                    if !res.has(b"Font") { res.set("Font", Object::Dictionary(Dictionary::new())); }
                    if let Ok(fonts) = res.get_mut(b"Font").and_then(|o| o.as_dict_mut()) { fonts.set("F_PN", Object::Reference(fid)); }
                }
                match pd.get_mut(b"Contents") {
                    Ok(obj) => {
                        if let Ok(arr) = obj.as_array_mut() { arr.push(Object::Reference(sid)); }
                        else if let Ok(r) = obj.as_reference() { pd.set("Contents", Object::Array(vec![Object::Reference(r), Object::Reference(sid)])); }
                    },
                    Err(_) => { pd.set("Contents", Object::Reference(sid)); }
                }
            }
        }
    }
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn compress_pdf(pdf_bytes: &[u8], options: &str) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let (max_dim, quality) = match options { "strong" => (800, 40), "basic" | "ebook" => (1500, 75), "printer" => (2400, 90), "email" => (600, 30), _ => (1500, 75) };
    let mut ids = Vec::new();
    for (&id, obj) in &doc.objects { if let Ok(d) = obj.as_dict() { if d.get(b"Subtype").and_then(|o| o.as_name_str()).unwrap_or("") == "Image" { ids.push(id); } } }
    for id in ids {
        if let Ok(s) = doc.get_object_mut(id).and_then(|o| o.as_stream_mut()) {
            if let Ok(data) = s.decompressed_content() {
                if let Ok(img) = image::load_from_memory(&data) {
                    let w = img.width();
                    let h = img.height();
                    let p = if w > max_dim || h > max_dim { img.resize(max_dim, max_dim, image::imageops::FilterType::Lanczos3) } else { img };
                    let nw = p.width();
                    let nh = p.height();
                    let mut buf = Cursor::new(Vec::new());
                    if p.write_to(&mut buf, image::ImageOutputFormat::Jpeg(quality)).is_ok() {
                        let bytes = buf.into_inner();
                        if bytes.len() < data.len() {
                            s.content = bytes;
                            s.dict.set("Filter", Object::Name(b"DCTDecode".to_vec()));
                            s.dict.set("Width", Object::Integer(nw as i64));
                            s.dict.set("Height", Object::Integer(nh as i64));
                            s.dict.remove(b"Length"); s.dict.remove(b"DecodeParms"); s.dict.remove(b"BitsPerComponent");
                        }
                    }
                }
            }
        }
    }
    doc.compress();
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn bitmap_to_svg(bytes: &[u8]) -> Result<String> {
    let img = image::load_from_memory(bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let color_image = ColorImage { pixels: img.to_rgba8().into_raw(), width: img.width() as usize, height: img.height() as usize };
    let svg = convert(color_image, Config::default()).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(svg.to_string())
}

#[wasm_bindgen]
pub fn resize_image(bytes: &[u8], w: u32, h: u32) -> Result<Vec<u8>> {
    let img = image::load_from_memory(bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let resized = img.resize_exact(w, h, image::imageops::FilterType::Lanczos3);
    let mut out = Cursor::new(Vec::new());
    resized.write_to(&mut out, image::ImageOutputFormat::Png).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out.into_inner())
}

#[wasm_bindgen]
pub fn decrypt_pdf(bytes: &[u8], p: &str) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let _ = doc.decrypt(p.as_bytes());
    doc.trailer.remove(b"Encrypt");
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn encrypt_pdf(_bytes: &[u8], _p: &str) -> Result<Vec<u8>> { Err(JsValue::from_str("Not supported")) }

#[wasm_bindgen]
pub fn split_pdf(pdf_bytes: &[u8], start: u32, end: u32) -> Result<Vec<u8>> {
    let mut doc = Document::load_from(Cursor::new(pdf_bytes)).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mut del = Vec::new();
    for (pn, _) in doc.get_pages() { if pn < start || pn > end { del.push(pn); } }
    doc.delete_pages(&del);
    let mut out = Vec::new();
    doc.save_to(&mut out).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out)
}

#[wasm_bindgen]
pub fn convert_image(image_bytes: &[u8], format: &str) -> Result<Vec<u8>> {
    let img = image::load_from_memory(image_bytes).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let mut out = Cursor::new(Vec::new());
    let fmt = match format { "png" => image::ImageOutputFormat::Png, "jpeg" | "jpg" => image::ImageOutputFormat::Jpeg(85), "webp" => image::ImageOutputFormat::WebP, "bmp" => image::ImageOutputFormat::Bmp, _ => return Err(JsValue::from_str("Unsupported format")) };
    img.write_to(&mut out, fmt).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(out.into_inner())
}
