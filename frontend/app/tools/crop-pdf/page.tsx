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
    const [zoom, setZoom] = useState(1.0);
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
            const viewport = page.getViewport({ scale: 2.0 }); // High res
            setPdfDimensions({ w: page.getViewport({ scale: 1.0 }).width, h: page.getViewport({ scale: 1.0 }).height });

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

        const scaleFactor = 2.0;

        const x = completedCrop.x / scaleFactor;
        const width = completedCrop.width / scaleFactor;
        const height = completedCrop.height / scaleFactor;

        // PDF Y is from bottom.
        // y (top) = 0.
        // The crop.y is pixels from top.
        // PDF Y = (Total Height) - ((y / scale) + (height / scale)) ? No.
        // PDF Y = (Total Height) - ((y + height) / scale).

        const y = pdfDimensions.h - ((completedCrop.y + completedCrop.height) / scaleFactor);

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
        setZoom(prev => Math.min(prev + 0.2, 3.0));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    return (
        <ToolInterface
            title="Crop PDF"
            description="Visually crop your PDF. Apply to all pages or just one."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="cropped.pdf"
            processingMode="client"
            onFileSelect={handleFileSelect}
            optionsComponent={
                <div style={{ display: 'flex', gap: 20, alignItems: 'start', flexDirection: 'column-reverse' }}>
                    {/* Toolbar */}
                    {imgSrc && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 15,
                            padding: 15,
                            background: '#fff',
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            alignSelf: 'stretch',
                            zIndex: 10
                        }}>
                            {/* Page Nav */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button type="button" disabled={currPageIndex <= 1} onClick={() => changePage(-1)} style={{ padding: '5px 10px' }}>&lt;</button>
                                    <span>Page {currPageIndex} of {numPages}</span>
                                    <button type="button" disabled={currPageIndex >= numPages} onClick={() => changePage(1)} style={{ padding: '5px 10px' }}>&gt;</button>
                                </div>

                                {/* Zoom */}
                                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                    <button type="button" onClick={handleZoomOut} style={{ padding: '5px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 4 }}>−</button>
                                    <span style={{ fontSize: '0.9rem' }}>{Math.round(zoom * 100)}%</span>
                                    <button type="button" onClick={handleZoomIn} style={{ padding: '5px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 4 }}>+</button>
                                </div>
                            </div>

                            {/* Scope Selection */}
                            <div style={{ borderTop: '1px solid #eee', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontWeight: 500, color: '#333' }}>Crop Scope:</label>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} />
                                        All Pages
                                    </label>
                                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="radio" checked={scope === 'current'} onChange={() => setScope('current')} />
                                        Current Page Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {imgSrc ? (
                        <div
                            ref={containerRef}
                            style={{
                                border: '1px solid #333',
                                background: '#333',
                                padding: 40,
                                borderRadius: 8,
                                overflow: 'auto',
                                width: '100%',
                                maxHeight: '600px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start'
                            }}
                        >
                            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    style={{ maxWidth: 'none' }}
                                >
                                    <img src={imgSrc} style={{ maxWidth: 'none', display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} alt="PDF Preview" />
                                </ReactCrop>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: 60, textAlign: 'center', background: '#f8f9fa', borderRadius: 12, border: '2px dashed #e9ecef', color: '#adb5bd' }}>
                            <p style={{ marginBottom: 10, fontSize: '1.1rem', fontWeight: 500 }}>No PDF Selected</p>
                            <p style={{ fontSize: '0.9rem' }}>Upload a file to begin cropping</p>
                        </div>
                    )}

                    <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, fontSize: '0.9rem', color: '#0d47a1', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span>💡</span>
                        <span>Drag handles to select area. Use controls above to change pages or apply to one page only.</span>
                    </div>
                </div>
            }
        />
    );
}
