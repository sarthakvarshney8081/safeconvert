"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileKey, Lock, ShieldCheck, Download, Check, RefreshCw, FileText, Upload, Type, Pen, X, MousePointer2, ChevronLeft, ChevronRight, Loader2, Home, FileUp } from 'lucide-react';
import ToolInterface from '@/components/ToolInterface';
import dynamic from 'next/dynamic';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false }) as any;

type Step = 'upload' | 'config' | 'signature' | 'place' | 'success';

export default function DigitalSignatureTool() {
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [pfxFile, setPfxFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [reason, setReason] = useState("Digital Signature");
    const [location, setLocation] = useState("SafeConverts");

    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Visual Sign State
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [imgSrc, setImgSrc] = useState<string>('');
    const [currPageIndex, setCurrPageIndex] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfDimensions, setPdfDimensions] = useState({ w: 0, h: 0 });
    const [zoom, setZoom] = useState(100);
    const [baseScale, setBaseScale] = useState(1.0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Signature State
    const [activeTab, setActiveTab] = useState<string>('draw');
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [typedText, setTypedText] = useState<string>('');
    const sigPadRef = useRef<any>(null);
    const sigContainerRef = useRef<HTMLDivElement>(null);

    // Placement State
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    // Initial File Upload
    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        await loadPdf(selectedFile);
    };

    // Load PDF for Preview
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
            setStep('config'); // Next Step: PFX Config
        } catch (err) {
            console.error("Error loading PDF:", err);
            setError("Failed to load PDF preview.");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPage = async (pdf: any, pageNum: number) => {
        if (!pdf) return;
        try {
            const page = await pdf.getPage(pageNum);
            const points = page.getViewport({ scale: 1.0 });
            const viewport = page.getViewport({ scale: 2.0 });
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

            // Auto-fit
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 40;
                const newBaseScale = containerWidth / (points.width || 600);
                setBaseScale(newBaseScale);
                setZoom(100);
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
            // setCrop(undefined); // Keep crop for efficient multi-page signing
            // setCompletedCrop(undefined);
        }
    };

    // Signature Logic
    useEffect(() => {
        const resizeCanvas = () => {
            if (sigPadRef.current && sigContainerRef.current) {
                const canvas = sigPadRef.current.getCanvas();
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
                sigPadRef.current.clear();
            }
        };
        if (activeTab === 'draw') {
            window.addEventListener('resize', resizeCanvas);
            setTimeout(resizeCanvas, 50);
        }
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [activeTab]);

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

    // Proceed from Config to Signature
    const handleConfigSubmit = () => {
        if (!pfxFile || !password) {
            setError("Please provide PFX file and password.");
            return;
        }
        setError(null);
        setStep('signature');
    };

    // FINAL SIGNING (Visual + Crypto)
    const handleSign = async () => {
        if (!file || !pfxFile || !password || !signatureImage || !completedCrop) {
            setError("Missing information.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Prepare Data for Backend Overlay
            // Calculate Normalized Coordinates (0 to 1)
            // The displayed image width is: pdfDimensions.w * baseScale * (zoom/100)
            const displayWidth = pdfDimensions.w * baseScale * (zoom / 100);
            const displayHeight = pdfDimensions.h * baseScale * (zoom / 100);

            const coords = {
                x: completedCrop.x / displayWidth,
                y: completedCrop.y / displayHeight,
                w: completedCrop.width / displayWidth,
                h: completedCrop.height / displayHeight,
                page: currPageIndex
            };

            // Prepare Signature Image Blob
            const response = await fetch(signatureImage);
            const imageBlob = await response.blob();
            const imageFile = new File([imageBlob], "signature.png", { type: "image/png" });

            // 2. Server-Side Signing (Visual Overlay + PFX)
            const formData = new FormData();
            formData.append("file", file); // Send ORIGINAL PDF
            formData.append("pfx_file", pfxFile);
            formData.append("password", password);
            formData.append("reason", reason);
            formData.append("location", location);

            // New Visual Params
            formData.append("visual_image", imageFile);
            formData.append("visual_coords", JSON.stringify(coords));

            const res = await fetch("/api/security/sign", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Signing failed on server");
            }

            const finalBlob = await res.blob();
            const url = URL.createObjectURL(finalBlob);
            setResultUrl(url);
            setStep('success');
        } catch (err: any) {
            console.error("Signing Error:", err);
            setError(err.message || "An error occurred during signing.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPfxFile(null);
        setPassword("");
        setSignatureImage(null);
        setPdfDoc(null);
        setResultUrl(null);
        setStep('upload');
        setError(null);
    };

    return (
        <ToolInterface
            title="Digital Signature (Visual & Crypto)"
            description="Securely sign documents with a PFX certificate and visual signature placement."
            onFileSelect={handleFileSelect}
            accept=".pdf"
            isProcessing={isProcessing}
            hideSubmitButton={true}
            // @ts-ignore
            onProcess={async () => new Blob()}
        >
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Stepper */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: step === 'upload' ? 'bold' : 'normal', color: step === 'upload' ? 'var(--primary)' : '#888' }}>1. Upload</span>
                    <span>→</span>
                    <span style={{ fontWeight: step === 'config' ? 'bold' : 'normal', color: step === 'config' ? 'var(--primary)' : '#888' }}>2. Config</span>
                    <span>→</span>
                    <span style={{ fontWeight: step === 'signature' ? 'bold' : 'normal', color: step === 'signature' ? 'var(--primary)' : '#888' }}>3. Draw</span>
                    <span>→</span>
                    <span style={{ fontWeight: step === 'place' ? 'bold' : 'normal', color: step === 'place' ? 'var(--primary)' : '#888' }}>4. Place</span>
                </div>

                {/* Step 1: Upload (Handled by ToolInterface initial state usually, but explicitly here for reset) */}
                {step === 'upload' && !file && (
                    <div style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', background: '#fff', border: '2px dashed #eee' }}>
                        <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '15px' }} />
                        <h3>Start Digital Signing</h3>
                        <p style={{ color: '#666' }}>Upload a PDF to begin.</p>
                    </div>
                )}

                {/* Step 2: Config (PFX & Password) */}
                {step === 'config' && (
                    <div className="card" style={{ padding: '30px', animation: 'fadeIn 0.3s ease' }}>
                        <h3>Certificate Configuration</h3>
                        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                            {/* PFX Input */}
                            <div
                                style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: pfxFile ? '#f6ffed' : '#fafafa', borderColor: pfxFile ? '#52c41a' : '#ddd' }}
                                onClick={() => document.getElementById('pfx-upload')?.click()}
                            >
                                <input id="pfx-upload" type="file" accept=".pfx,.p12" style={{ display: 'none' }} onChange={e => setPfxFile(e.target.files?.[0] || null)} />
                                <FileKey size={24} style={{ color: pfxFile ? '#52c41a' : '#aaa', marginBottom: '10px' }} />
                                {pfxFile ? <p style={{ margin: 0, fontWeight: '600', color: '#52c41a' }}>{pfxFile.name}</p> : <p style={{ margin: 0, color: '#666' }}>Click to upload .pfx / .p12</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Type password..." style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input type="text" placeholder="Signer Name (e.g. John Doe)" value={location} onChange={e => setLocation(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                <input type="text" placeholder="Reason (e.g. Invoice)" value={reason} onChange={e => setReason(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>

                            {error && <div style={{ padding: '10px', background: '#fff1f0', color: '#cf1322', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}

                            <button className="btn btn-primary" onClick={handleConfigSubmit} style={{ padding: '12px' }}>Next: Preview Badge</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Digital Badge Preview */}
                {step === 'signature' && (
                    <div className="card" style={{ padding: '25px', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Signature Appearance</h3>
                            <button type="button" onClick={() => setStep('config')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p style={{ color: '#666' }}>This stamp will appear on your document.</p>
                        </div>

                        {/* Badge Generator Canvas */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                            <div
                                id="badge-preview"
                                style={{
                                    border: '2px solid #e0e0e0',
                                    background: '#fff',
                                    padding: '15px 25px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    minWidth: '300px'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', background: '#f6ffed', borderRadius: '50%', border: '2px solid #b7eb8f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52c41a' }}>
                                    <Check size={24} strokeWidth={3} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>Signature Valid</p>
                                    <p style={{ margin: '2px 0', fontSize: '0.8rem', color: '#555' }}>Digitally signed by <span style={{ fontWeight: '600' }}>{location || "User"}</span></p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Date: {new Date().toISOString().split('T')[0]}</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Reason: {reason}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hidden Canvas for Generation */}
                        <canvas ref={sigPadRef} style={{ display: 'none' }} />

                        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', fontSize: '0.85rem', color: '#666', border: '1px solid #eee' }}>
                            <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '5px', color: 'var(--primary)' }} />
                            This visual stamp will be cryptographically bound to the document using your PFX certificate.
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                // Render HTML Badge to Canvas/Image
                                // We simulate it by drawing to the hidden canvas manually to ensure high res
                                const canvas = document.createElement('canvas');
                                canvas.width = 1200; // High Res
                                canvas.height = 400;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                    // Background
                                    ctx.fillStyle = "white";
                                    ctx.fillRect(0, 0, 1200, 400);

                                    // Icon (Green Tick)
                                    ctx.font = "bold 150px Arial";
                                    ctx.fillStyle = "#52c41a";
                                    ctx.fillText("✔", 50, 250);

                                    // Text
                                    ctx.textAlign = "left";
                                    ctx.font = "bold 60px Arial";
                                    ctx.fillStyle = "#000";
                                    ctx.fillText("Signature Valid", 250, 120);

                                    ctx.font = "50px Arial";
                                    ctx.fillStyle = "#333";
                                    ctx.fillText(`Digitally signed by ${location || "User"}`, 250, 190);

                                    ctx.font = "40px Arial";
                                    ctx.fillStyle = "#666";
                                    ctx.fillText(`Date: ${new Date().toISOString().split('T')[0]}`, 250, 260);
                                    ctx.fillText(`Reason: ${reason}`, 250, 310);

                                    setSignatureImage(canvas.toDataURL('image/png'));
                                    setStep('place');
                                }
                            }}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem' }}
                        >
                            Confirm Stamp & Place
                        </button>
                    </div>
                )}

                {/* Step 4: Placement */}
                {step === 'place' && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="card" style={{ padding: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button type="button" onClick={() => setStep('signature')} className="btn btn-sm">Edit Sig</button>
                                <button type="button" onClick={() => changePage(-1)} disabled={currPageIndex <= 1} className="btn btn-sm">&lt;</button>
                                <span>{currPageIndex} / {numPages}</span>
                                <button type="button" onClick={() => changePage(1)} disabled={currPageIndex >= numPages} className="btn btn-sm">&gt;</button>
                            </div>
                            <button type="button" onClick={handleSign} disabled={!completedCrop || isProcessing} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16} style={{ marginRight: '5px' }} /> Sign Document</>}
                            </button>
                        </div>

                        {error && <div style={{ padding: '10px', background: '#fff1f0', color: '#cf1322', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

                        <div ref={containerRef} style={{ background: '#333', padding: '20px', borderRadius: '12px', overflow: 'auto', display: 'flex', justifyContent: 'center', minHeight: '400px' }}>
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                                <div style={{ position: 'relative' }}>
                                    <img src={imgSrc} style={{ width: (pdfDimensions.w * baseScale * (zoom / 100)) || '100%', display: 'block', boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }} />
                                    {completedCrop && signatureImage && (
                                        <div style={{ position: 'absolute', left: completedCrop.x, top: completedCrop.y, width: completedCrop.width, height: completedCrop.height, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={signatureImage} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                        </div>
                                    )}
                                </div>
                            </ReactCrop>
                        </div>
                        <p style={{ textAlign: 'center', color: '#666', marginTop: '10px', fontSize: '0.9rem' }}><MousePointer2 size={14} style={{ verticalAlign: 'middle' }} /> Drag to draw a box where you want your signature.</p>
                    </div>
                )}

                {/* Step 5: Success */}
                {step === 'success' && resultUrl && (
                    <div className="card" style={{ padding: '40px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ width: '70px', height: '70px', background: '#e8f5e9', borderRadius: '50%', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Check size={36} />
                        </div>
                        <h2>Signed & Protected!</h2>
                        <p style={{ color: '#666' }}>Your document has been visually signed and cryptographically locked.</p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                            <a href={resultUrl} download={`signed_${file?.name || 'doc.pdf'}`} className="btn btn-primary" style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                                <Download size={20} /> Download PDF
                            </a>
                            <button onClick={handleReset} className="btn" style={{ padding: '12px 30px' }}>New Document</button>
                        </div>
                    </div>
                )}

                {/* Security Disclaimer Modal (On Page Load) */}
                {showDisclaimer && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, animation: 'fadeIn 0.3s ease', backdropFilter: 'blur(3px)'
                    }}>
                        <div style={{
                            background: 'white', padding: '30px', borderRadius: '16px',
                            maxWidth: '500px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                            position: 'relative'
                        }}>
                            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#333' }}>
                                <ShieldCheck size={28} color="var(--primary)" fill="#e6f7ff" />
                                Security & Privacy Policy
                            </h3>
                            <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                We prioritize your data privacy. Please acknowledge how we handle your files:
                            </p>
                            <ul style={{ color: '#555', paddingLeft: '20px', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.8' }}>
                                <li><strong>Original File:</strong> Deleted immediately after processing.</li>
                                <li><strong>Digital Signature (PFX):</strong> Never stored; deleted immediately after use.</li>
                                <li><strong>Passwords:</strong> Processed in memory only; never saved.</li>
                                <li><strong>Signed Document:</strong> Deleted automatically within 10 minutes.</li>
                            </ul>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowDisclaimer(false)}
                                    className="btn btn-primary"
                                    style={{ padding: '12px 30px', borderRadius: '8px', fontSize: '1rem' }}
                                >
                                    I Understand & Agree
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </ToolInterface>
    );
}
