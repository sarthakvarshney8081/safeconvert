"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Type, Pen, Download, FileUp, X, Check, MousePointer2, ChevronLeft, ChevronRight, Loader2, RotateCw, Home } from 'lucide-react';
import ToolInterface from '@/components/ToolInterface';
import dynamic from 'next/dynamic';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false }) as any;

type Step = 'upload' | 'signature' | 'place' | 'success';

export default function SignPdfTool() {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [imgSrc, setImgSrc] = useState<string>('');
    const [currPageIndex, setCurrPageIndex] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfDimensions, setPdfDimensions] = useState({ w: 0, h: 0 });
    const [zoom, setZoom] = useState(100); // UI percentage (100 = Fit)
    const [baseScale, setBaseScale] = useState(1.0); // The scale that makes it fit (100%)
    const containerRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Signature State
    const [activeTab, setActiveTab] = useState<string>('draw');
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [typedText, setTypedText] = useState<string>('');
    const sigPadRef = useRef<any>(null);
    const sigContainerRef = useRef<HTMLDivElement>(null);

    // Sync canvas resolution with display size to fix offset issues
    useEffect(() => {
        const resizeCanvas = () => {
            if (sigPadRef.current && sigContainerRef.current) {
                const canvas = sigPadRef.current.getCanvas();
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
                sigPadRef.current.clear(); // Clear to reset internal state
            }
        };

        if (activeTab === 'draw') {
            window.addEventListener('resize', resizeCanvas);
            // Small delay to ensure DOM is ready
            setTimeout(resizeCanvas, 50);
        }
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [activeTab]);

    // Placement State (Crop)
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    // Load PDF and Render first page on select
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
            setStep('signature');
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
            const points = page.getViewport({ scale: 1.0 });
            const viewport = page.getViewport({ scale: 2.0 }); // High quality render
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
                const containerWidth = containerRef.current.clientWidth - 120; // 60px padding * 2
                const newBaseScale = containerWidth / (points.width || 600);
                setBaseScale(newBaseScale);
                setZoom(100); // Reset to 100% (Fit)
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
            await renderPage(pdfDoc, newPage);
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    };

    // Signature creation logic
    const saveDrawnSignature = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            setSignatureImage(sigPadRef.current.getTrimmedCanvas().toDataURL('image/png'));
        }
    };

    const updateTypedSignature = (text: string) => {
        setTypedText(text);
        if (!text) { setSignatureImage(null); return; }
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "italic 72px cursive";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 300, 75);
            setSignatureImage(canvas.toDataURL('image/png'));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) setSignatureImage(event.target.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Final Apply
    const applySignature = async () => {
        if (!file || !signatureImage || !completedCrop) return;
        setIsProcessing(true);
        try {
            // @ts-ignore
            const wasm = await import(/* webpackIgnore: true */ '/wasm/safeconvert_wasm.js');
            await wasm.default();

            const pdfBytes = new Uint8Array(await file.arrayBuffer());

            // Flatten to opaque white background for Wasm processing (standardizes input)
            const img = new Image();
            img.src = signatureImage;
            await new Promise((res) => img.onload = res);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.drawImage(img, 0, 0);
            }
            const jpegUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
            const imgBytes = new Uint8Array(await (await fetch(jpegUrl)).arrayBuffer());

            // COORDINATE MAPPING (Current Scale)
            const currentScale = baseScale * (zoom / 100);
            const pdfX = completedCrop.x / currentScale;
            const pdfW = completedCrop.width / currentScale;
            const pdfH = completedCrop.height / currentScale;
            // PDF Y is bottom-up
            const pdfY = pdfDimensions.h - ((completedCrop.y + completedCrop.height) / currentScale);

            const processedPdf = wasm.add_image_overlay(pdfBytes, imgBytes, pdfX, pdfY, pdfW, pdfH, currPageIndex - 1);
            const blob = new Blob([processedPdf], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `signed_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

            setStep('success');
        } catch (err) {
            console.error("Signing failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPdfDoc(null);
        setImgSrc('');
        setSignatureImage(null);
        setStep('upload');
    };

    return (
        <ToolInterface
            title="Sign PDF"
            description="Professional PDF signing. Create your signature once and place it anywhere."
            onFileSelect={handleFileSelect}
            // @ts-ignore
            onProcess={async () => new Blob()} // Handled internally
            accept=".pdf"
            isProcessing={isProcessing}
            hideSubmitButton={true}
        >
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Custom Stepper - Responsive */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 'upload' ? 'var(--primary)' : '#e0e0e0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>1</div>
                        <span className="hide-mobile" style={{ fontSize: '0.9rem', fontWeight: step === 'upload' ? '600' : '400', color: step === 'upload' ? 'var(--primary)' : '#666' }}>Upload</span>
                    </div>
                    <div style={{ width: '20px', height: '2px', background: '#e0e0e0', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 'signature' ? 'var(--primary)' : '#e0e0e0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>2</div>
                        <span className="hide-mobile" style={{ fontSize: '0.9rem', fontWeight: step === 'signature' ? '600' : '400', color: step === 'signature' ? 'var(--primary)' : '#666' }}>Signature</span>
                    </div>
                    <div style={{ width: '20px', height: '2px', background: '#e0e0e0', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 'place' ? 'var(--primary)' : '#e0e0e0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>3</div>
                        <span className="hide-mobile" style={{ fontSize: '0.9rem', fontWeight: step === 'place' ? '600' : '400', color: step === 'place' ? 'var(--primary)' : '#666' }}>Place</span>
                    </div>
                </div>

                {/* Step 2: Create Signature */}
                {step === 'signature' && (
                    <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2>Create Your Signature</h2>
                            <button type="button" onClick={() => setStep('upload')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', background: '#f5f5f7', padding: '5px', borderRadius: '12px', marginBottom: '25px', gap: '5px' }}>
                            {['draw', 'type', 'upload'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => { setActiveTab(tab); setSignatureImage(null); }}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: activeTab === tab ? '#fff' : 'transparent',
                                        boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                                        color: activeTab === tab ? 'var(--primary)' : '#666',
                                        borderRadius: '8px',
                                        textTransform: 'capitalize',
                                        fontSize: '0.75rem',
                                        padding: '8px 4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        minWidth: 0,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {tab === 'draw' && <Pen size={16} />}
                                        {tab === 'type' && <Type size={16} />}
                                        {tab === 'upload' && <Upload size={16} />}
                                    </span>
                                    <span style={{ fontSize: '0.75rem' }}>{tab}</span>
                                </button>
                            ))}
                        </div>

                        <div style={{ height: '250px', border: '2px dashed #e0e0e0', borderRadius: '16px', background: '#fafafa', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                            {activeTab === 'draw' && (
                                <div ref={sigContainerRef} style={{ height: '100%', cursor: 'crosshair', position: 'relative' }}>
                                    <SignatureCanvas ref={sigPadRef} canvasProps={{ style: { width: '100%', height: '100%' } }} onEnd={saveDrawnSignature} />
                                    <button type="button" onClick={() => { sigPadRef.current?.clear(); setSignatureImage(null); }} style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '0.8rem', color: 'var(--error)', border: 'none', background: 'none', fontWeight: '600', cursor: 'pointer', zIndex: 10 }}>Clear</button>
                                </div>
                            )}
                            {activeTab === 'type' && (
                                <div style={{ padding: '40px' }}>
                                    <input
                                        className="w-full"
                                        style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #e0e0e0', padding: '15px', fontSize: '3rem', fontFamily: 'cursive', textAlign: 'center', outline: 'none' }}
                                        placeholder="Type your name..."
                                        value={typedText}
                                        onChange={e => updateTypedSignature(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                        autoFocus
                                    />
                                </div>
                            )}
                            {activeTab === 'upload' && (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <FileUp size={48} style={{ color: '#ccc', marginBottom: '15px' }} />
                                    <p style={{ color: '#666', marginBottom: '20px' }}>Upload a transparent PNG signature for best results</p>
                                    <div style={{ position: 'relative' }}>
                                        <button type="button" className="btn btn-primary" style={{ padding: '10px 30px' }}>Select Image</button>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                    </div>
                                    {signatureImage && <p style={{ color: '#2e7d32', fontSize: '0.9rem', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><Check size={16} /> Image Loaded</p>}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => setStep('upload')} className="btn" style={{ flex: 1, background: '#f5f5f7', minWidth: '120px' }}>Back</button>
                            <button
                                type="button"
                                disabled={!signatureImage}
                                onClick={() => setStep('place')}
                                className="btn btn-primary"
                                style={{ flex: 2, fontSize: '1rem', minWidth: '200px' }}
                            >
                                Use This Signature <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Place & Sign */}
                {step === 'place' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {/* Control Bar */}
                        <div className="card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => setStep('signature')} className="btn btn-sm" style={{ background: 'none', padding: '5px', color: '#666', fontSize: '0.85rem' }}><ChevronLeft size={16} /> Edit Sig</button>
                                <div className="hide-mobile" style={{ height: '24px', width: '1px', background: '#eee' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button type="button" disabled={currPageIndex <= 1} onClick={() => changePage(-1)} className="btn btn-sm" style={{ background: '#f5f5f7', padding: '4px 10px' }}>&lt;</button>
                                    <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{currPageIndex} / {numPages}</span>
                                    <button type="button" disabled={currPageIndex >= numPages} onClick={() => changePage(1)} className="btn btn-sm" style={{ background: '#f5f5f7', padding: '4px 10px' }}>&gt;</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#666' }}>Zoom:</span>
                                    <input type="range" min="10" max="250" step="5" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: '80px' }} />
                                    <span style={{ fontSize: '0.8rem', color: '#aaa', width: '35px' }}>{zoom}%</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={applySignature}
                                    disabled={!completedCrop || isProcessing}
                                    className="btn btn-primary"
                                    style={{ padding: '10px 20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(98,0,238,0.15)', fontSize: '0.9rem' }}
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Download size={18} style={{ marginRight: '8px' }} /> Download</>}
                                </button>
                            </div>
                        </div>

                        {/* Interactive PDF Map */}
                        <div
                            ref={containerRef}
                            className="preview-container"
                            style={{
                                background: '#1a1a1a',
                                borderRadius: '16px',
                                padding: '20px',
                                height: '500px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                overflow: 'auto',
                                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
                                position: 'relative'
                            }}>
                            <div>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    style={{ maxWidth: 'none' }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={imgSrc}
                                            style={{
                                                width: (pdfDimensions.w * baseScale * (zoom / 100)) || '100%',
                                                maxWidth: 'none',
                                                display: 'block',
                                                boxShadow: '0 10px 50px rgba(0,0,0,0.8)'
                                            }}
                                            alt="PDF Preview"
                                        />

                                        {/* Crop Tool Overlay */}
                                        {completedCrop && (
                                            <div style={{
                                                position: 'absolute',
                                                left: completedCrop.x,
                                                top: completedCrop.y,
                                                width: completedCrop.width,
                                                height: completedCrop.height,
                                                pointerEvents: 'none',
                                                zIndex: 10,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                // background: 'rgba(59,130,246,0.1)',
                                                // border: '2px solid rgba(59,130,246,0.5)'
                                            }}>
                                                <img src={signatureImage!} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                            </div>
                                        )}
                                    </div>
                                </ReactCrop>
                            </div>

                            {/* Info Overlay */}
                            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '40px', fontSize: '0.85rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <MousePointer2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Drag a rectangle on the document to place your signature
                            </div>
                        </div>
                    </div>
                )}

                {/* Initial State: Empty / Upload */}
                {step === 'upload' && !file && (
                    <div style={{ textAlign: 'center', padding: '100px 40px', background: '#fff', borderRadius: '32px', border: '3px dashed #f0f0f0' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f5f5f7', color: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <FileUp size={40} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Ready to Sign?</h2>
                        <p style={{ color: '#666' }}>Upload your PDF document to begin the professional signing workflow.</p>
                    </div>
                )}

                {/* Step 4: Success View */}
                {step === 'success' && (
                    <div className="card" style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.3s ease', marginTop: '20px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                            <Check size={40} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>PDF Signed Successfully!</h2>
                        <p style={{ color: '#666', marginBottom: '40px' }}>Your document has been processed and downloaded.</p>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={handleReset} className="btn" style={{ background: '#f5f5f7', padding: '12px 30px' }}>
                                <RotateCw size={18} style={{ marginRight: '8px' }} />
                                Sign Another PDF
                            </button>
                            <Link href="/" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                                <Home size={18} style={{ marginRight: '8px' }} />
                                Go to Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </ToolInterface>
    );
}
