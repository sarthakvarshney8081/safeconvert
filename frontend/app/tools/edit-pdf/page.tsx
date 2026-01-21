"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Type, Image as ImageIcon, PenTool, Download, FileUp, X, Trash2, ChevronLeft, ChevronRight, Loader2, RotateCw, Home, Move, FileType, Tv } from 'lucide-react';
import ToolInterface from '@/components/ToolInterface';
import AdvancedEditor from './AdvancedEditor';
import ContentSection from '@/components/ContentSection';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import Draggable from 'react-draggable';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false }) as any;

type ToolMode = 'none' | 'text' | 'image' | 'draw';

interface PdfElement {
    id: string;
    type: 'text' | 'image' | 'draw';
    x: number;
    y: number;
    width: number; // for text, this might be auto or fixed
    height: number;
    content: string; // text content or image dataURL
    pageIndex: number; // 0-based

    // Text specific
    fontSize?: number;
    color?: string;
    fontFamily?: string;
}

export default function EditPdfTool() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [imgSrc, setImgSrc] = useState<string>(''); // Current page image
    const [currPageIndex, setCurrPageIndex] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfDimensions, setPdfDimensions] = useState({ w: 0, h: 0 });
    const [scale, setScale] = useState(1.0); // Viewer scale
    const containerRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Editor State
    const [elements, setElements] = useState<PdfElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mode, setMode] = useState<ToolMode>('none');

    // Draw Modal State
    const [showDrawModal, setShowDrawModal] = useState(false);
    const sigPadRef = useRef<any>(null);

    // Load PDF
    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsProcessing(true);
        try {
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setCurrPageIndex(1);
            await renderPage(loadedPdf, 1);
        } catch (err) {
            console.error("Error loading PDF:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPage = async (pdf: any, pageNum: number) => {
        if (!pdf) return;
        try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); // High res render
            const points = page.getViewport({ scale: 1.0 }); // Original PDF points
            setPdfDimensions({ w: points.width, h: points.height });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            setImgSrc(canvas.toDataURL('image/png'));

            // Fit to container
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 40;
                const newScale = containerWidth / points.width;
                setScale(newScale > 1.5 ? 1.5 : newScale); // Cap scale
            }

        } catch (error) {
            console.error("Render error:", error);
        }
    };

    const changePage = async (delta: number) => {
        if (!pdfDoc) return;
        const newPage = currPageIndex + delta;
        if (newPage >= 1 && newPage <= numPages) {
            setCurrPageIndex(newPage);
            setSelectedId(null);
            await renderPage(pdfDoc, newPage);
        }
    };

    // --- Element Handlers ---

    const addText = () => {
        const id = uuidv4();
        const newEl: PdfElement = {
            id,
            type: 'text',
            x: 50,
            y: 50,
            width: 200,
            height: 30,
            content: "Double Click to Edit",
            pageIndex: currPageIndex - 1,
            fontSize: 16,
            color: '#000000'
        };
        setElements([...elements, newEl]);
        setSelectedId(id);
        setMode('none');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const id = uuidv4();
                    // Load image to get dimensions? For now, default size
                    const newEl: PdfElement = {
                        id,
                        type: 'image',
                        x: 50,
                        y: 50,
                        width: 150,
                        height: 150, // Square default, user should resize (TODO: Resize handles)
                        content: ev.target!.result as string,
                        pageIndex: currPageIndex - 1
                    };
                    setElements([...elements, newEl]);
                    setSelectedId(id);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const saveDrawing = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
            const id = uuidv4();
            const newEl: PdfElement = {
                id,
                type: 'draw',
                x: 50,
                y: 50,
                width: 200,
                height: 100, // Approximate
                content: dataUrl,
                pageIndex: currPageIndex - 1
            };
            setElements([...elements, newEl]);
            setSelectedId(id);
            setShowDrawModal(false);
        }
    };

    const deleteElement = (id: string) => {
        setElements(elements.filter(e => e.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateElement = (id: string, updates: Partial<PdfElement>) => {
        setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
    };

    // --- Save Logic ---

    const handleDownload = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            // @ts-ignore
            const wasm = await import(/* webpackIgnore: true */ '/wasm/safeconvert_wasm.js');
            await wasm.default();

            let pdfBytes = new Uint8Array(await file.arrayBuffer());

            // Sort elements by page to minimize context switching inside WASM if it mattered, 
            // but we just iterate and apply overlays.
            // Actually, we must apply them one by one. 
            // The WASM function takes: pdf_bytes, image_bytes, x, y, width, height, page_index
            // It returns NEW pdf bytes. So we must chain them.

            // To improve performance, we could group edits by page and do them? 
            // No, the WASM API is stateless regarding the document object in this function, 
            // it re-parses every time. (Inefficient but robust for MVP).

            for (const el of elements) {
                let imageBytes: Uint8Array;

                if (el.type === 'text') {
                    // Convert text to image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) continue;

                    // Estimate size
                    // We need a clearer mapping of text size to pixels.
                    // For now, let's create a high-res canvas for the text.
                    const fontSize = (el.fontSize || 16) * 2; // 2x for quality
                    const w = el.width * 2; // Approximation
                    const h = 50 * 2; // Should calculate real height

                    // Measure text
                    ctx.font = `${fontSize}px sans-serif`;
                    const metrics = ctx.measureText(el.content);
                    canvas.width = metrics.width + 20; // Padding
                    canvas.height = fontSize * 1.5;

                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.fillStyle = el.color || 'black';
                    ctx.textBaseline = 'top';
                    ctx.fillText(el.content, 0, 0);

                    const imgData = canvas.toDataURL('image/png');
                    // Fetch bytes
                    const res = await fetch(imgData);
                    imageBytes = new Uint8Array(await res.arrayBuffer());

                    // Update PDF
                    // Calculate PDF coordinates
                    // Our Viewer Scale is 'scale'. 
                    // PDF Dimensions are 'pdfDimensions'. 
                    // Element X/Y are in CSS pixels relative to the container.

                    // However, we need to pass PDF Point coordinates to WASM.
                    // The WASM function expects X, Y from Bottom-Left (standard PDF)? 
                    // Let's check `lib.rs`.
                    // `add_image_overlay`: 
                    // matrix: ... x, y (if 0 rotation).
                    // PDF coords are usually bottom-left.
                    // BUT my `sign-pdf` implementation did:
                    // const pdfY = pdfDimensions.h - ((completedCrop.y + completedCrop.height) / currentScale);
                    // This confirms Bottom-Left origin for Y. X is standard Left-to-Right.

                    // Wait, `pdfDimensions.h` is points? Yes.

                    // If element is at screen coords (ex, ey) inside the container.
                    // The container displays the PDF at `pdfDimensions.w * scale`.
                    // So `pdfX = ex / scale`.
                    // `pdfY = pdfDimensions.h - ((ey + eh) / scale)`.

                    // Width/Height: `pdfW = ew / scale`.

                    // For Text, we generated an image of size (canvas.width, canvas.height).
                    // We want it to appear at roughly the font size.
                    // If we made it 2x resolution, we should display it at 0.5x size in PDF points relative to its pixel size?
                    // Actually, simpler:
                    // We defined visually that the text is at `el.x, el.y`.
                    // We should just use `el.width`? No, text width is auto in my simple implementation?
                    // Let's rely on the visual bounding box.

                    // REVISIT: Text element width/height handling.
                    // For MVP, text is just an image overlay.
                    const validW = (metrics.width + 20) / 2; // scaled back down
                    const validH = (fontSize * 1.5) / 2;

                    const pdfX = el.x / scale;
                    const pdfY = pdfDimensions.h - ((el.y + validH) / scale);
                    const pdfW = validW / scale;
                    const pdfH = validH / scale;

                    pdfBytes = wasm.add_image_overlay(pdfBytes, imageBytes, pdfX, pdfY, pdfW, pdfH, el.pageIndex);

                } else {
                    // Image or Drawing
                    // These already have content as dataURL
                    const res = await fetch(el.content);
                    imageBytes = new Uint8Array(await res.arrayBuffer());

                    // Need to convert to standard format potentially? 
                    // The WASM uses `image` crate which supports PNG/JPEG.

                    const pdfX = el.x / scale;
                    const pdfY = pdfDimensions.h - ((el.y + el.height) / scale);
                    const pdfW = el.width / scale;
                    const pdfH = el.height / scale;

                    pdfBytes = wasm.add_image_overlay(pdfBytes, imageBytes, pdfX, pdfY, pdfW, pdfH, el.pageIndex);
                }
            }

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save PDF. See console.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Calculate display dimensions
    const displayW = pdfDimensions.w * scale;
    const displayH = pdfDimensions.h * scale;

    // Advanced Mode State
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState<string>('');
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const [editorZoom, setEditorZoom] = useState(1.0);
    const [fitToPage, setFitToPage] = useState(false); // If true, constrain width to an A4-ish ratio

    const toggleAdvancedMode = () => {
        setIsAdvancedMode(!isAdvancedMode);
        // Do not reset file; if file exists, the effect below will verify/convert it.
        setElements([]);
        // Do not reset HTML content immediately if we want to potentially cache it, 
        // but for now let's clear it to force re-conversion or fresh state for the new mode logic.
        // Actually, if we switch back and forth, we might want to re-fetch or keep state.
        // Let's clear HTML to trigger the "Convert" effect.
        setHtmlContent('');
    };

    // Auto-convert if entering Advanced Mode with a file
    useEffect(() => {
        if (isAdvancedMode && file && !htmlContent && !isProcessing) {
            handleAdvancedUpload(file);
        }
    }, [isAdvancedMode, file]);

    const handleAdvancedUpload = async (file: File) => {
        setFile(file);
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Call Backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/convert/pdf-to-html`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Conversion failed");
            const html = await res.text();
            setHtmlContent(html);
            // Default paragraph separator to 'p' to avoid <div> hell
            setTimeout(() => {
                if (contentEditableRef.current) {
                    document.execCommand('defaultParagraphSeparator', false, 'p');
                }
            }, 100);
        } catch (err) {
            console.error(err);
            alert("Failed to convert PDF to Editable HTML. Make sure the backend is running.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAdvancedSave = async () => {
        if (!contentEditableRef.current) return;
        setIsProcessing(true);
        try {
            const html = contentEditableRef.current.innerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const formData = new FormData();
            formData.append('file', blob, 'edited.html');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/convert/html-to-pdf`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Conversion failed");

            const pdfBlob = await res.blob();
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited_advanced_${file?.name || 'doc'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to save HTML to PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Refs for Draggable nodes to avoid findDOMNode warnings
    const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});

    // Ensure ref exists for an element
    const getRef = (id: string) => {
        if (!nodeRefs.current[id]) {
            nodeRefs.current[id] = React.createRef();
        }
        return nodeRefs.current[id] as React.RefObject<HTMLDivElement>;
    };

    const isReady = file && pdfDimensions.w > 0;



    if (isAdvancedMode) {
        return (
            <AdvancedEditor
                file={file}
                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                toggleAdvancedMode={toggleAdvancedMode}
                handleAdvancedSave={handleAdvancedSave}
                isProcessing={isProcessing}
                editorZoom={editorZoom}
                setEditorZoom={setEditorZoom}
                fitToPage={fitToPage}
                setFitToPage={setFitToPage}
                contentEditableRef={contentEditableRef}
            />
        );
    }

    return (
        <>
            <ToolInterface
                title="Edit PDF"
                description="Add text, images, and drawings to your PDF document."
                onFileSelect={isAdvancedMode ? handleAdvancedUpload : handleFileSelect}
                // @ts-ignore
                onProcess={async () => new Blob()}
                accept=".pdf"
                isProcessing={isProcessing}
                hideSubmitButton={true}
                initialStatus={file && isReady ? 'ready' : 'idle'}
                initialFiles={file ? [file] : []}
            >
                {/* STICKY TOOLBAR MODIFICATION: Toolbar is now inside the scrollable area or managed better */}
                {/* Actually, let's keep the mode switch OUTSIDE the sticky area so it's always accessible? 
                Or sticky too? Let's keep it static at top. */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={toggleAdvancedMode}
                        className="btn"
                        style={{
                            background: isAdvancedMode ? 'var(--primary)' : '#e0e0e0',
                            color: isAdvancedMode ? 'white' : 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        {isAdvancedMode ? "Switch to Overlay Mode" : <><span style={{ background: '#ff9800', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em', marginRight: '8px', verticalAlign: 'middle' }}>BETA</span> Switch to Advanced Text Editor</>}
                    </button>
                </div>

                <div className="container" style={{ maxWidth: isAdvancedMode ? '100%' : '1200px', padding: isAdvancedMode ? '0 20px' : '0 15px' }}>

                    {isAdvancedMode ? (
                        // ... Advanced Mode UI (Keep as is mostly) ...
                        <div className="card" style={{ padding: '20px' }}>
                            {!htmlContent && !isProcessing && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <FileType size={48} style={{ marginBottom: '10px' }} />
                                    <p>Upload a PDF to convert it to an editable format.</p>
                                    <p style={{ fontSize: '0.9em' }}>Note: Layout fidelity may vary. Useful for heavy text editing.</p>
                                </div>
                            )}

                            {htmlContent && (
                                <div>
                                    {/* Sticky Toolbar */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0', // Removed margin, now handled by container padding
                                        background: '#f8f9fa',
                                        padding: '10px 15px',
                                        borderBottom: '1px solid #ddd',
                                        borderRadius: '8px 8px 0 0',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 100,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {/* History */}
                                            <button type="button" onClick={() => document.execCommand('undo', false)} className="btn btn-sm" title="Undo">↩</button>
                                            <button type="button" onClick={() => document.execCommand('redo', false)} className="btn btn-sm" title="Redo">↪</button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* Headings */}
                                            <select
                                                onChange={(e) => document.execCommand('formatBlock', false, e.target.value)}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                defaultValue="p"
                                            >
                                                <option value="p">Normal</option>
                                                <option value="h1">Heading 1</option>
                                                <option value="h2">Heading 2</option>
                                                <option value="h3">Heading 3</option>
                                            </select>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* Basic Formatting */}
                                            <button type="button" onClick={() => document.execCommand('bold', false)} className="btn btn-sm" style={{ fontWeight: 'bold' }} title="Bold">B</button>
                                            <button type="button" onClick={() => document.execCommand('italic', false)} className="btn btn-sm" style={{ fontStyle: 'italic' }} title="Italic">I</button>
                                            <button type="button" onClick={() => document.execCommand('underline', false)} className="btn btn-sm" style={{ textDecoration: 'underline' }} title="Underline">U</button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* Lists */}
                                            <button type="button" onClick={() => document.execCommand('insertUnorderedList', false)} className="btn btn-sm" title="Bullet List">• List</button>
                                            <button type="button" onClick={() => document.execCommand('insertOrderedList', false)} className="btn btn-sm" title="Numbered List">1. List</button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* Alignment */}
                                            <button type="button" onClick={() => document.execCommand('justifyLeft', false)} className="btn btn-sm" title="Align Left">L</button>
                                            <button type="button" onClick={() => document.execCommand('justifyCenter', false)} className="btn btn-sm" title="Center">C</button>
                                            <button type="button" onClick={() => document.execCommand('justifyRight', false)} className="btn btn-sm" title="Align Right">R</button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* Math Insertion */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const formula = prompt("Enter standard formula text (e.g. E = mc^2):");
                                                    if (formula) {
                                                        // Wrap in a stylized span to indicate "Math"
                                                        const mathHtml = `<span style="font-family: 'Times New Roman', serif; font-style: italic; background: #f0f0f0; padding: 2px 4px; border-radius: 4px;">${formula}</span>&nbsp;`;
                                                        document.execCommand('insertHTML', false, mathHtml);
                                                    }
                                                }}
                                                className="btn btn-sm"
                                                title="Insert Math / Formula"
                                            >
                                                Σ Math
                                            </button>

                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                                            {/* View Controls */}
                                            <button type="button" onClick={() => setEditorZoom(z => Math.max(0.5, z - 0.1))} className="btn btn-sm" title="Zoom Out">-</button>
                                            <span style={{ fontSize: '0.8em', width: '40px', textAlign: 'center' }}>{Math.round(editorZoom * 100)}%</span>
                                            <button type="button" onClick={() => setEditorZoom(z => Math.min(2.0, z + 0.1))} className="btn btn-sm" title="Zoom In">+</button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                                            <button
                                                type="button"
                                                onClick={() => setFitToPage(!fitToPage)}
                                                className="btn btn-sm"
                                                style={{
                                                    background: !fitToPage ? '#e3f2fd' : 'transparent',
                                                    color: !fitToPage ? '#1565c0' : 'inherit',
                                                    border: !fitToPage ? '1px solid #1565c0' : '1px solid transparent'
                                                }}
                                                title={fitToPage ? "Switch to Full Width Mode" : "Switch to A4 Page Mode"}
                                            >
                                                {fitToPage ? <><FileType size={14} /> View: Page</> : <><Tv size={14} /> View: Full</>}
                                            </button>
                                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (contentEditableRef.current) {
                                                        // Insert Page Break
                                                        const breakHtml = '<div style="page-break-after: always; height: 50px; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #ffffff 10px, #ffffff 20px); border-bottom: 2px dashed #ccc; margin: 20px 0;" title="Page Break"></div><p><br></p>';
                                                        document.execCommand('insertHTML', false, breakHtml);
                                                    }
                                                }}
                                                className="btn btn-sm"
                                                title="Insert Page Break / Blank Page"
                                            >
                                                <FileUp size={14} /> +Page
                                            </button>
                                        </div>
                                        <button type="button" onClick={handleAdvancedSave} className="btn btn-primary" title="Export as PDF">
                                            {isProcessing ? <Loader2 className="animate-spin" /> : <Download size={18} />}
                                        </button>
                                    </div>
                                    {/* Editor Container handling Layout */}
                                    <div style={{
                                        background: '#e0e0e0', // Desk background
                                        padding: '40px',
                                        height: '800px',
                                        overflow: 'auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div
                                            ref={contentEditableRef}
                                            contentEditable={true}
                                            onKeyDown={(e) => {
                                                // Ensure Enter works (sometimes needed in React contentEditable)
                                                // document.execCommand('defaultParagraphSeparator', false, 'p'); is set on load
                                            }}
                                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                                            style={{
                                                minHeight: fitToPage ? '1122px' : 'calc(100vh - 200px)', // A4 height approx or Viewport
                                                width: fitToPage ? '800px' : '100%', // A4 width approx vs Full
                                                background: 'white',
                                                padding: fitToPage ? '80px' : '40px', // Page margin vs Screen margin
                                                boxShadow: fitToPage ? '0 4px 15px rgba(0,0,0,0.15)' : 'none', // No shadow in full mode for cleaner "web" feel? Or keep it? Let's keep it but subtle.
                                                outline: 'none',
                                                transform: fitToPage ? `scale(${editorZoom})` : 'none',
                                                transformOrigin: 'top center',
                                                transition: 'all 0.3s ease',
                                                marginBottom: '100px',
                                                fontSize: fitToPage ? '1rem' : '1.1rem',
                                                lineHeight: 1.6,
                                                maxWidth: fitToPage ? 'none' : '100%' // Ensure it doesn't overflow horizontally in full mode
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Standard Overlay Mode
                        <>
                            {/* ALWAYS Show Toolbar, but disable items if not ready */}
                            <div className="card" style={{ padding: '15px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={addText}
                                        disabled={!isReady}
                                        className="btn"
                                        style={{ background: isReady ? '#f5f5f7' : '#e0e0e0', gap: '5px', opacity: isReady ? 1 : 0.5 }}
                                    >
                                        <Type size={18} /> Text
                                    </button>
                                    <label
                                        className="btn"
                                        style={{
                                            background: isReady ? '#f5f5f7' : '#e0e0e0',
                                            gap: '5px',
                                            cursor: isReady ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            opacity: isReady ? 1 : 0.5
                                        }}
                                    >
                                        <ImageIcon size={18} /> Image
                                        <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={!isReady} />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowDrawModal(true)}
                                        disabled={!isReady}
                                        className="btn"
                                        style={{ background: isReady ? '#f5f5f7' : '#e0e0e0', gap: '5px', opacity: isReady ? 1 : 0.5 }}
                                    >
                                        <PenTool size={18} /> Draw
                                    </button>
                                </div>

                                {isReady && (
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button type="button" disabled={currPageIndex <= 1} onClick={() => changePage(-1)} className="btn btn-sm">&lt;</button>
                                        <span>Page {currPageIndex} of {numPages}</span>
                                        <button type="button" disabled={currPageIndex >= numPages} onClick={() => changePage(1)} className="btn btn-sm">&gt;</button>
                                    </div>
                                )}

                                {isReady && (
                                    <button onClick={handleDownload} className="btn btn-primary" style={{ gap: '5px' }}>
                                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Download size={18} /> Save & Download</>}
                                    </button>
                                )}
                            </div>

                            {/* Editor Canvas */}
                            <div
                                style={{
                                    background: '#1e1e1e',
                                    padding: '40px',
                                    borderRadius: '16px',
                                    minHeight: '600px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    overflow: 'auto',
                                    position: 'relative'
                                }}
                                ref={containerRef}
                            >
                                <div style={{ position: 'relative', width: displayW || 600, height: displayH || 800, background: 'white', boxShadow: '0 0 20px rgba(0,0,0,0.5)', display: file ? 'block' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {!file && (
                                        <div style={{ color: '#aaa', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Upload size={48} style={{ marginBottom: '10px' }} />
                                            <p>Upload a PDF to start editing (Overlay Mode)</p>
                                        </div>
                                    )}

                                    {/* PDF Render */}
                                    {imgSrc && (
                                        <img
                                            src={imgSrc}
                                            style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
                                        />
                                    )}

                                    {/* Elements Overlay */}
                                    {mounted && isReady && elements.filter(e => e.pageIndex === currPageIndex - 1).map(el => (
                                        <Draggable
                                            key={el.id}
                                            nodeRef={getRef(el.id)}
                                            position={{ x: el.x, y: el.y }}
                                            onStop={(e: any, data: any) => updateElement(el.id, { x: data.x, y: data.y })}
                                            bounds="parent"
                                        >
                                            <div
                                                ref={getRef(el.id) as React.RefObject<HTMLDivElement>}
                                                onClick={() => setSelectedId(el.id)}
                                                style={{
                                                    position: 'absolute',
                                                    cursor: 'move',
                                                    border: selectedId === el.id ? '2px solid var(--primary)' : '1px dashed transparent',
                                                    padding: '2px'
                                                }}
                                            >
                                                {selectedId === el.id && (
                                                    <div style={{ position: 'absolute', top: -30, right: 0, display: 'flex', gap: 5 }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                                            style={{ background: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}

                                                {el.type === 'text' ? (
                                                    <textarea
                                                        value={el.content}
                                                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            fontSize: `${el.fontSize}px`,
                                                            fontFamily: 'sans-serif',
                                                            resize: 'both',
                                                            overflow: 'hidden',
                                                            color: el.color,
                                                            width: el.width > 0 ? el.width : 'auto',
                                                            minWidth: '50px'
                                                        }}
                                                        onMouseUp={(e) => {
                                                            // Update width/height on resize
                                                            const target = e.target as HTMLTextAreaElement;
                                                            updateElement(el.id, { width: target.offsetWidth, height: target.offsetHeight });
                                                        }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={el.content}
                                                        style={{ width: el.width, height: el.height, pointerEvents: 'none' }}
                                                    // Simple resize handle implementation could go here
                                                    />
                                                )}
                                            </div>
                                        </Draggable>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Draw Modal (Only in Overlay Mode? Yes) */}
                    {!isAdvancedMode && showDrawModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="card" style={{ width: '600px', padding: '20px' }}>
                                <h3 style={{ marginBottom: '15px' }}>Draw Signature / Annotation</h3>
                                <div style={{ border: '1px solid #ddd', height: '300px', marginBottom: '15px', background: '#fff' }}>
                                    <SignatureCanvas
                                        ref={sigPadRef}
                                        canvasProps={{ width: 560, height: 300, className: 'sigCanvas' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" onClick={() => { sigPadRef.current?.clear(); }} className="btn" style={{ background: '#fff', border: '1px solid #ddd' }}>Clear</button>
                                    <button type="button" onClick={() => setShowDrawModal(false)} className="btn">Cancel</button>
                                    <button type="button" onClick={saveDrawing} className="btn btn-primary">Add to PDF</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
            </ToolInterface >

            <ContentSection
                title="Edit PDF Documents Online"
                features={[
                    {
                        title: "Add Text & Images",
                        description: "Easily insert new text or overlay images (like logos or signatures) onto your PDF pages."
                    },
                    {
                        title: "Draw & Sign",
                        description: "Use our drawing tool to create digital signatures or make freehand annotations directly on the document."
                    },
                    {
                        title: "Advanced Mode",
                        description: "Switch to our Advanced Editor to convert the PDF to editable HTML, allowing for deeper changes to the content."
                    }
                ]}
                steps={[
                    {
                        title: "Upload PDF",
                        description: "Select the PDF file you want to edit from your device."
                    },
                    {
                        title: "Choose Overlays",
                        description: "Use the toolbar to add Text, Images, or Drawings. Drag them to position them exactly where you want."
                    },
                    {
                        title: "Save & Download",
                        description: "Click 'Save & Download' to bake your changes into a new PDF file instantly."
                    }
                ]}
                faq={[
                    {
                        question: "Can I edit existing text in the PDF?",
                        answer: "In the default 'Overlay Mode', you can add new text on top. To edit existing text, try switching to 'Advanced/Beta Mode', which attempts to make the document fully editable."
                    },
                    {
                        question: "How do I sign a document?",
                        answer: "Click the 'Draw' button to open the signature pad. Draw your signature, then place and resize it anywhere on the page."
                    },
                    {
                        question: "Is it free?",
                        answer: "Yes, our PDF editor is free to use for basic editing tasks."
                    }
                ]}
            />
        </>
    );
}
