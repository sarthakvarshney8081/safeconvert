"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Trash2, Download, AlertTriangle, MousePointer2, Loader2, Info } from 'lucide-react';
import ToolInterface from '@/components/ToolInterface';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface RedactionRect {
    id: string;
    page: number;
    x: number; // Percent (0-1)
    y: number; // Percent (0-1)
    w: number; // Percent (0-1)
    h: number; // Percent (0-1)
}

export default function RedactPdfTool() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // PDF State
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [currPageIndex, setCurrPageIndex] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [imgSrc, setImgSrc] = useState<string>('');
    const [pdfDimensions, setPdfDimensions] = useState({ w: 0, h: 0 }); // Viewport dims

    // UI Layout
    const [baseScale, setBaseScale] = useState(1.0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Redaction State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [redactions, setRedactions] = useState<RedactionRect[]>([]);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setResultUrl(null);
        setRedactions([]);
        await loadPdf(selectedFile);
    };

    const loadPdf = async (f: File) => {
        setIsProcessing(true);
        try {
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }
            const arrayBuffer = await f.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(loadedPdf);
            setNumPages(loadedPdf.numPages);
            setCurrPageIndex(1);
            await renderPage(loadedPdf, 1);
        } catch (err) {
            console.error(err);
            setError("Failed to load PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPage = async (pdf: any, pageNum: number) => {
        if (!pdf) return;
        try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); // High res for display

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            setPdfDimensions({ w: viewport.width, h: viewport.height });
            setImgSrc(canvas.toDataURL('image/png'));

            // Fit to container
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 40;
                // viewport.width is scale 2.0. Display width needs to match CSS width.
                // We'll trust CSS 'width: 100%' and use container width as reference.
                // But ReactCrop needs exact pixel match context.
                // Strategy: Render image at 100% of container.
            }
        } catch (e) {
            console.error(e);
        }
    };

    const changePage = async (delta: number) => {
        if (!pdfDoc) return;
        const newPage = currPageIndex + delta;
        if (newPage >= 1 && newPage <= numPages) {
            setCurrPageIndex(newPage);
            setCrop(undefined);
            setCompletedCrop(undefined);
            await renderPage(pdfDoc, newPage);
        }
    };

    const addRedaction = () => {
        if (!completedCrop || !imgSrc) return;

        // Calculate Percentages based on THE RENDERED IMAGE DIMENSIONS
        // ReactCrop returns pixels relative to the IMAGE ELEMENT.
        // We need to access the image element to get its clientWidth/Height.
        const img = document.getElementById('preview-image') as HTMLImageElement;
        if (!img) return;

        const w = img.width;
        const h = img.height;

        const newRect: RedactionRect = {
            id: Math.random().toString(36).substr(2, 9),
            page: currPageIndex,
            x: completedCrop.x / w,
            y: completedCrop.y / h,
            w: completedCrop.width / w,
            h: completedCrop.height / h
        };

        setRedactions([...redactions, newRect]);
        setCrop(undefined);
        setCompletedCrop(undefined);
    };

    const removeRedaction = (id: string) => {
        setRedactions(redactions.filter(r => r.id !== id));
    };

    const handleApplyRedactions = async () => {
        if (!file || redactions.length === 0) return;

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("redactions", JSON.stringify(redactions));

            const res = await fetch("/api/redact/process", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Redaction failed");
            }

            const blob = await res.blob();
            setResultUrl(URL.createObjectURL(blob));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setRedactions([]);
        setResultUrl(null);
    };

    if (resultUrl) {
        return (
            <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Eraser size={40} />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Redaction Complete</h2>
                    <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '30px' }}>The selected area has been permanently removed/covered.</p>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <a href={resultUrl} download={`redacted_${file?.name || 'document.pdf'}`} className="btn btn-primary" style={{ display: 'flex', gap: '10px', alignItems: 'center', textDecoration: 'none', padding: '12px 24px', fontSize: '1.1rem' }}>
                            <Download size={20} /> Download PDF
                        </a>
                        <button type="button" onClick={handleReset} className="btn" style={{ background: '#f5f5f7', padding: '12px 24px', fontSize: '1.1rem' }}>
                            Redact Another
                        </button>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <a href="/" style={{ color: '#666', textDecoration: 'none' }}>Back to Home</a>
                </div>
            </div>
        );
    }

    return (
        <ToolInterface
            title="PDF Redaction Tool"
            description="Permanently remove sensitive information. Black out text and images securely."
            onFileSelect={handleFileSelect}
            accept=".pdf"
            isProcessing={isProcessing}
            // @ts-ignore
            onProcess={async () => { }} // Manual handling
            hideSubmitButton={true}
            maxWidth={file ? "100%" : "800px"}
        >
            {/* Editor */}
            {file && (
                <div className="container" style={{ maxWidth: 'none', margin: '0', padding: '0 20px' }}>

                    {error && (
                        <div className="alert-box" style={{ background: '#fff1f0', border: '1px solid #ffa39e', color: '#c02525', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div className="alert-box" style={{ background: '#fffbeb', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                        <AlertTriangle color="#faad14" />
                        <div>
                            <strong>Warning:</strong> Redaction is permanent. Once applied, the content is completely removed and cannot be recovered.
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Toolbar Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee', background: '#f9fafb' }}>
                                {/* Pagination */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => changePage(-1)}
                                        disabled={currPageIndex <= 1}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: currPageIndex <= 1 ? 'not-allowed' : 'pointer', opacity: currPageIndex <= 1 ? 0.5 : 1, borderRadius: '6px' }}
                                    >
                                        &lt;
                                    </button>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500, padding: '0 8px', minWidth: '80px', textAlign: 'center', userSelect: 'none' }}>
                                        Page {currPageIndex} of {numPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => changePage(1)}
                                        disabled={currPageIndex >= numPages}
                                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: currPageIndex >= numPages ? 'not-allowed' : 'pointer', opacity: currPageIndex >= numPages ? 0.5 : 1, borderRadius: '6px' }}
                                    >
                                        &gt;
                                    </button>
                                </div>

                                {/* Action Area */}
                                <div>
                                    {completedCrop ? (
                                        <button
                                            type="button"
                                            onClick={addRedaction}
                                            className="btn btn-primary"
                                            style={{ background: '#000', border: 'none', padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
                                        >
                                            <Eraser size={14} /> Add Redaction
                                        </button>
                                    ) : (
                                        <small className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <MousePointer2 size={14} /> Drag to select area
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div ref={containerRef} style={{ position: 'relative', background: '#333', minHeight: '600px', display: 'flex', justifyContent: 'center', padding: '40px', overflow: 'auto' }}>
                                {imgSrc && (
                                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} disabled={isProcessing}>
                                        <div style={{ position: 'relative' }}>
                                            <img id="preview-image" src={imgSrc} style={{ maxWidth: '100%', height: 'auto', display: 'block', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }} />
                                            {/* Render Existing Redactions for Current Page */}
                                            {redactions.filter(r => r.page === currPageIndex).map(r => (
                                                <div key={r.id} style={{
                                                    position: 'absolute',
                                                    left: `${r.x * 100}%`,
                                                    top: `${r.y * 100}%`,
                                                    width: `${r.w * 100}%`,
                                                    height: `${r.h * 100}%`,
                                                    background: 'black',
                                                    opacity: 0.8,
                                                    border: '1px solid red',
                                                    cursor: 'not-allowed'
                                                }} title="Redaction Pending" />
                                            ))}
                                        </div>
                                    </ReactCrop>
                                )}
                            </div>
                        </div>

                        {/* Right: Sidebar */}
                        <div className="card" style={{ padding: '20px', height: 'fit-content' }}>
                            <h4>Pending Redactions</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666' }}>{redactions.length} areas marked.</p>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', borderTop: '1px solid #eee' }}>
                                {redactions.length === 0 && <p style={{ fontStyle: 'italic', color: '#999', padding: '10px' }}>No areas marked yet.</p>}
                                {redactions.map((r, i) => (
                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                                        <span>Page {r.page} <small>(Zone {i + 1})</small></span>
                                        <button type="button" onClick={() => removeRedaction(r.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }} disabled={isProcessing}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button type="button" onClick={handleApplyRedactions} disabled={redactions.length === 0 || isProcessing} className="btn btn-primary" style={{ width: '100%', background: 'black', border: '1px solid #333' }}>
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><Eraser size={16} /> Apply & Burn</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </ToolInterface>
    );
}
