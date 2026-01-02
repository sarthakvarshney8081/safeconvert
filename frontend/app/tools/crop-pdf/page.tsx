"use client";

import React, { useState, useEffect, useRef } from 'react';
import ToolInterface from '@/components/ToolInterface';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropPdfTool() {
    const [status, setStatus] = useState<any>(null); // To trigger rendering
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [pdfDimensions, setPdfDimensions] = useState({ w: 0, h: 0 }); // Original PDF Point size
    const [pdfDoc, setPdfDoc] = useState<any>(null); // Store loaded PDF document
    const [currPageIndex, setCurrPageIndex] = useState<number>(1); // 1-based index
    const [numPages, setNumPages] = useState<number>(0);
    const [scope, setScope] = useState<'all' | 'current'>('all');

    // Zoom State
    const [zoom, setZoom] = useState(100); // UI percentage (100 = Fit)
    const [baseScale, setBaseScale] = useState(1.0); // The scale that makes it fit (100%)
    const containerRef = useRef<HTMLDivElement>(null);

    // Fix worker source for Next.js
    useEffect(() => {
        const initPdfJs = async () => {
            const pdfjsLib = await import('pdfjs-dist');
            // Use local worker file to avoid CORS/404 issues
            // @ts-ignore
            if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }
        };
        initPdfJs();
    }, []);

    const renderPage = async (pdf: any, pageNum: number) => {
        if (!pdf) return;
        try {
            const page = await pdf.getPage(pageNum);
            const points = page.getViewport({ scale: 1.0 });
            const viewport = page.getViewport({ scale: 2.0 }); // High res
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

            // Auto-fit Logic: Calculate the baseScale that makes the PDF fit the container width
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 80;
                const newBaseScale = containerWidth / points.width;
                setBaseScale(newBaseScale);
                setZoom(100); // Reset to 100% (Fit)
            }
        } catch (error) {
            console.error("Error rendering page:", error);
        }
    };

    const handleFileSelect = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await import('pdfjs-dist');
            // @ts-ignore
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setCurrPageIndex(1);

            // Render first page
            await renderPage(pdf, 1);
        } catch (e) {
            console.error("File load error", e);
        }
    };

    const changePage = async (delta: number) => {
        if (!pdfDoc) return;
        const newPage = currPageIndex + delta;
        if (newPage >= 1 && newPage <= numPages) {
            setCurrPageIndex(newPage);
            await renderPage(pdfDoc, newPage);
        }
    };

    const processFile = async (files: File[]) => {
        if (!completedCrop) throw new Error("Please select a crop area");

        // Calculate PDF coordinates
        // Image displayed is scale 2x (or roughly) or fitted to container.
        // We rely on ReactCrop returning pixel values relative to the IMAGE displayed.
        // We need the natural dimensions of the image vs displayed to map back, 
        // OR better: ReactCrop gives % if we ask, or pixels.

        // Wait, `completedCrop` gives pixels relative to the image element?
        // Let's grab the image element reference to know scale.
        // Actually, if we use the canvas blob URL, the image is huge.
        // UX: The user asked for Zoom. `react-image-crop` supports it via wrapping.

        // Logic Re-check:
        // 1. Image is Rendered at 2x PDF Points (for sharpness).
        // 2. Crop returns Pixels on that 2x Image.
        // 3. We divide by 2 to get PDF Points.
        // 4. Invert Y because PDF is bottom-left origin.

        // Dynamic import Wasm
        // @ts-ignore
        const wasm = await import(
            /* webpackIgnore: true */
            '/wasm/safeconvert_wasm.js'
        );
        await wasm.default();

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Map Crop Pixels to PDF Point Coordinates
        // completedCrop.x / 2.0  (Since we rendered at scale 2.0)
        // height needs inversion relative to page height.

        // The rendered image width = viewport.width (which was PDF width * 2)
        // So scale factor is exactly 2.0

        const currentScale = baseScale * (zoom / 100);

        const x = completedCrop.x / currentScale;
        const width = completedCrop.width / currentScale;
        const height = completedCrop.height / currentScale;

        // PDF Y is from bottom.
        // y (top) = 0.
        // The crop.y is pixels from top.
        // PDF Y = (Total Height) - ((y / scale) + (height / scale)) ? No.
        // PDF Y = (Total Height) - ((y + height) / scale).

        const y = pdfDimensions.h - ((completedCrop.y + completedCrop.height) / currentScale);

        // Scope (-1 for all, or specific index 0-based)
        const pageLimit = scope === 'all' ? -1 : (currPageIndex - 1);

        try {
            const resultBytes = wasm.crop_pdf(bytes, x, y, width, height, pageLimit);
            return new Blob([resultBytes as any], { type: 'application/pdf' });
        } catch (e: any) {
            throw new Error("Crop failed: " + e);
        }
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 5, 300));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 5, 10));
    };

    // Calculate actual display width based on zoom
    const currentScale = baseScale * (zoom / 100);
    const displayWidth = pdfDimensions.w * currentScale;

    return (
        <ToolInterface
            title="Crop PDF"
            description="Visually crop your PDF. Apply to all pages or just one."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="cropped.pdf"
            processingMode="client"
            onFileSelect={handleFileSelect}
            optionsTitle="Crop your PDF here"
            optionsComponent={
                <div style={{ display: 'flex', gap: 20, alignItems: 'start', flexDirection: 'column' }}>
                    {/* Toolbar */}
                    {imgSrc && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            padding: '15px',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #eee',
                            alignSelf: 'stretch',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            {/* Page Nav */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button type="button" disabled={currPageIndex <= 1} onClick={() => changePage(-1)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>&larr;</button>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currPageIndex} / {numPages}</span>
                                    <button type="button" disabled={currPageIndex >= numPages} onClick={() => changePage(1)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>&rarr;</button>
                                </div>

                                { /* Zoom controls - Adjusted so that Auto-Fit = 100% */}
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button type="button" onClick={handleZoomOut} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>−</button>
                                    <span style={{ fontSize: '0.8rem', width: 38, textAlign: 'center', fontWeight: 500 }}>{zoom}%</span>
                                    <button type="button" onClick={handleZoomIn} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>+</button>
                                </div>
                            </div>

                            {/* Scope Selection */}
                            <div style={{ borderTop: '1px solid #eee', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontWeight: 600, color: '#333', fontSize: '0.85rem' }}>Apply crop to:</label>
                                <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                                        All Pages
                                    </label>
                                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="radio" checked={scope === 'current'} onChange={() => setScope('current')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                                        Current Page Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {imgSrc ? (
                        <div
                            ref={containerRef}
                            className="preview-container"
                            style={{
                                border: '1px solid #eee',
                                background: '#1a1a1b',
                                padding: '20px',
                                borderRadius: '12px',
                                overflow: 'auto',
                                width: '100%',
                                height: '500px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                userSelect: 'none',
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    style={{ maxWidth: 'none' }}
                                >
                                    <img
                                        src={imgSrc}
                                        style={{
                                            width: displayWidth || '100%',
                                            maxWidth: 'none',
                                            display: 'block',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                            borderRadius: '4px'
                                        }}
                                        alt="PDF Preview"
                                    />
                                </ReactCrop>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: 80, textAlign: 'center', background: '#fff', borderRadius: 20, border: '2px dashed #eee', color: '#999', width: '100%' }}>
                            <p style={{ marginBottom: 10, fontSize: '1.2rem', fontWeight: 600 }}>No PDF Loaded</p>
                            <p style={{ fontSize: '0.95rem' }}>Your PDF preview will appear here</p>
                        </div>
                    )}

                    <div style={{ background: '#e3f2fd', padding: '12px 15px', borderRadius: '10px', fontSize: '0.85rem', color: '#1565c0', display: 'flex', gap: 10, alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '1rem' }}>💡</span>
                        <span style={{ lineHeight: 1.4 }}><b>Pro Tip:</b> Drag handles on the image to select area. Zoom to adjust visibility.</span>
                    </div>
                </div>
            }
        />
    );
}
