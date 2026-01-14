"use client";

import React, { useState } from 'react';
import { WorkflowStep } from './CustomWorkflowBuilder';
import { Loader2, Download, ArrowRight, CheckCircle2, FileText, AlertCircle, RefreshCw, Home } from 'lucide-react';
import JSZip from 'jszip';
import Link from 'next/link';

interface InteractiveWorkflowProps {
    steps: WorkflowStep[];
    initialFiles: File[];
    onReset: () => void;
}

type StepStatus = 'pending' | 'processing' | 'completed' | 'error';

export default function InteractiveWorkflow({ steps, initialFiles, onReset }: InteractiveWorkflowProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentFiles, setCurrentFiles] = useState<File[]>(initialFiles);
    const [status, setStatus] = useState<StepStatus>('pending');
    const [error, setError] = useState<string | null>(null);

    // Step configuration state
    const [compressLevel, setCompressLevel] = useState<string>('ebook'); // PDF
    const [protectPassword, setProtectPassword] = useState<string>(''); // PDF
    const [imgQuality, setImgQuality] = useState<number>(80); // Image
    const [resizeWidth, setResizeWidth] = useState<number>(0);
    const [resizeHeight, setResizeHeight] = useState<number>(0);
    const [targetFormat, setTargetFormat] = useState<string>('png');
    const [cropX, setCropX] = useState<number>(0);
    const [cropY, setCropY] = useState<number>(0);
    const [cropW, setCropW] = useState<number>(100);
    const [cropH, setCropH] = useState<number>(100);

    // Rotate & Organize State
    const [rotateAngle, setRotateAngle] = useState<number>(90);
    const [pageOrder, setPageOrder] = useState<string>("");

    // Protect & Split State
    const [ownerPassword, setOwnerPassword] = useState<string>('');
    const [permissions, setPermissions] = useState<string[]>([]);
    const [splitMode, setSplitMode] = useState<string>('all');
    const [splitRanges, setSplitRanges] = useState<string>('');

    // OCR State
    const [ocrLanguage, setOcrLanguage] = useState<string>('eng');


    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length;
    const progress = Math.round((currentStepIndex / steps.length) * 100);

    const processStep = async () => {
        if (!currentStep) return;

        setStatus('processing');
        setError(null);

        try {
            const formData = new FormData();

            currentFiles.forEach((file) => {
                formData.append('files', file);
            });

            // Construct params based on step type
            const stepParams: Record<string, any> = { ...(currentStep.params || {}) };

            if (currentStep.type === 'compress') stepParams.level = compressLevel;
            if (currentStep.type === 'protect') {
                stepParams.password = protectPassword;
                stepParams.owner_password = ownerPassword;
                stepParams.permissions = permissions;
            }
            if (currentStep.type === 'split') {
                stepParams.mode = splitMode;
                stepParams.ranges = splitRanges;
            }
            if (currentStep.type === 'compress_img') stepParams.quality = imgQuality;
            if (currentStep.type === 'resize') {
                stepParams.width = resizeWidth;
                stepParams.height = resizeHeight;
            }
            if (currentStep.type === 'convert_format') stepParams.format = targetFormat;
            if (currentStep.type === 'crop') {
                stepParams.x = cropX;
                stepParams.y = cropY;
                stepParams.width = cropW;
                stepParams.height = cropH;
            }
            if (currentStep.type === 'ocr_pdf' || currentStep.type === 'extract_text') {
                stepParams.lang = ocrLanguage;
            }
            if (currentStep.type === 'rotate') {
                stepParams.angle = rotateAngle;
            }
            if (currentStep.type === 'organize') {
                stepParams.page_order = pageOrder;
            }

            const stepDef = {
                type: currentStep.type,
                params: stepParams
            };

            formData.append('workflow_json', JSON.stringify([stepDef]));

            const response = await fetch('/api/workflow/run', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ detail: "Processing failed" }));
                throw new Error(err.detail || "Step execution failed");
            }

            const blob = await response.blob();
            let nextFiles: File[] = [];

            if (blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed' || currentStep.type === 'split') {
                try {
                    const zip = await JSZip.loadAsync(blob);
                    const filePromises: Promise<File>[] = [];

                    zip.forEach((relativePath, zipEntry) => {
                        if (!zipEntry.dir) {
                            // Determine type based on extension
                            let type = 'application/octet-stream';
                            if (relativePath.endsWith('.pdf')) type = 'application/pdf';
                            if (relativePath.endsWith('.png')) type = 'image/png';
                            if (relativePath.endsWith('.jpg') || relativePath.endsWith('.jpeg')) type = 'image/jpeg';
                            if (relativePath.endsWith('.txt')) type = 'text/plain';

                            filePromises.push(
                                zipEntry.async('blob').then(b => new File([b], zipEntry.name, { type }))
                            );
                        }
                    });

                    nextFiles = await Promise.all(filePromises);
                } catch (e) {
                    console.warn("Failed to unzip result, keeping as single file", e);
                    nextFiles = [new File([blob], "result.zip", { type: blob.type })];
                }
            } else {
                let ext = 'bin';
                if (blob.type.includes('pdf')) ext = 'pdf';
                if (blob.type.includes('image/png')) ext = 'png';
                if (blob.type.includes('image/jpeg')) ext = 'jpg';
                if (blob.type.includes('zip')) ext = 'zip';
                if (blob.type.includes('text/plain')) ext = 'txt';

                // If the user did a format conversion, try to respect that extension if possible, 
                // but the blob type is the source of truth.

                const filename = `step_${currentStep.type}_result.${ext}`;
                nextFiles = [new File([blob], filename, { type: blob.type })];
            }

            setCurrentFiles(nextFiles);
            setCurrentStepIndex(prev => prev + 1);
            setStatus('pending');

        } catch (e: any) {
            console.error(e);
            setError(e.message);
            setStatus('error');
        }
    };

    // Render Logic
    if (isLastStep) {
        // Completion View (Same as before)
        return (
            <div className="card" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#e6fffa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle2 size={40} color="#059669" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Workflow Completed!</h2>
                <p style={{ color: '#666', marginBottom: 32 }}>All steps have been executed successfully.</p>

                <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 8, marginBottom: 32, textAlign: 'left' }}>
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
                        <FileText size={18} />
                        Generated Files ({currentFiles.length})
                    </h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {currentFiles.map((file, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                                <span style={{ fontSize: '0.9rem', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>{(file.size / 1024).toFixed(1)} KB</span>
                                <a
                                    href={URL.createObjectURL(file)}
                                    download={file.name}
                                    style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                    <Download size={14} /> Download
                                </a>
                            </div>
                        ))}
                    </div>
                    {currentFiles.length > 1 && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: 8 }}>Download all files as ZIP?</p>
                            <button
                                onClick={async () => {
                                    const zip = new JSZip();
                                    currentFiles.forEach(f => zip.file(f.name, f));
                                    const content = await zip.generateAsync({ type: "blob" });
                                    const url = URL.createObjectURL(content);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = "workflow_result_all.zip";
                                    a.click();
                                }}
                                className="btn"
                                style={{ border: '1px solid #ccc', background: 'white' }}
                            >
                                Download All (ZIP)
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <button onClick={onReset} className="btn" style={{ background: '#f5f5f7', color: '#333' }}>
                        <RefreshCw size={18} style={{ marginRight: 8 }} /> Start New
                    </button>
                    <Link href="/" className="btn" style={{ background: '#f5f5f7', color: '#333' }}>
                        <Home size={18} style={{ marginRight: 8 }} /> Home
                    </Link>
                </div>
            </div>
        );
    }

    // Active Step View
    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Progress Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
                    <span>Step {currentStepIndex + 1} of {steps.length}</span>
                    <span>{progress}%</span>
                </div>
                <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                        style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s ease' }}
                    />
                </div>
            </div>

            {/* Step Card */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                    <div style={{ width: 48, height: 48, background: '#f0f0ff', color: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <currentStep.icon size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{currentStep.label}</h2>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Configure this step</p>
                    </div>
                </div>

                {/* Input Files Preview */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} /> Input Files ({currentFiles.length})
                    </div>
                    <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, maxHeight: 120, overflowY: 'auto', fontSize: '0.9rem', color: '#555', border: '1px solid #eee' }}>
                        {currentFiles.map((f, i) => (
                            <div key={i} style={{ marginBottom: 4 }}>{f.name}</div>
                        ))}
                    </div>
                </div>

                {/* Step Specific UI */}
                <div style={{ marginBottom: 32 }}>

                    {/* PDF Compress */}
                    {currentStep.type === 'compress' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Compression Level</label>
                            <select
                                value={compressLevel}
                                onChange={(e) => setCompressLevel(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                            >
                                <option value="screen">Screen (72 dpi)</option>
                                <option value="ebook">eBook (150 dpi)</option>
                                <option value="printer">Printer (300 dpi)</option>
                                <option value="prepress">Prepress (High Quality)</option>
                            </select>
                        </div>
                    )}

                    {/* PDF Protect */}
                    {currentStep.type === 'protect' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Encryption Password (User)</label>
                            <input
                                type="password"
                                placeholder="Enter password to open"
                                value={protectPassword}
                                onChange={(e) => setProtectPassword(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 16 }}
                            />

                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Owner Password (Optional)</label>
                            <input
                                type="password"
                                placeholder="Password to change permissions"
                                value={ownerPassword}
                                onChange={(e) => setOwnerPassword(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 16 }}
                            />

                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Permissions</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['print', 'copy', 'modify'].map(p => (
                                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="checkbox"
                                            checked={permissions.includes(p)}
                                            onChange={(e) => {
                                                if (e.target.checked) setPermissions([...permissions, p]);
                                                else setPermissions(permissions.filter(x => x !== p));
                                            }}
                                        />
                                        Allow {p.charAt(0).toUpperCase() + p.slice(1)}ing
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image Compress */}
                    {currentStep.type === 'compress_img' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Image Quality ({imgQuality}%)
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={imgQuality}
                                onChange={(e) => setImgQuality(parseInt(e.target.value))}
                                style={{ width: '100%', marginBottom: 8 }}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Lower quality reduces file size significantly.</p>
                        </div>
                    )}

                    {/* Image Resize */}
                    {currentStep.type === 'resize' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Width (px)</label>
                                <input
                                    type="number"
                                    placeholder="Auto"
                                    value={resizeWidth || ''}
                                    onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Height (px)</label>
                                <input
                                    type="number"
                                    placeholder="Auto"
                                    value={resizeHeight || ''}
                                    onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                                />
                            </div>
                            <p style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: '#666' }}>Leave one 0/Empty to maintain aspect ratio.</p>
                        </div>
                    )}

                    {/* Image Convert Format */}
                    {currentStep.type === 'convert_format' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Target Format</label>
                            <select
                                value={targetFormat}
                                onChange={(e) => setTargetFormat(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                            >
                                <option value="png">PNG</option>
                                <option value="jpg">JPEG</option>
                                <option value="webp">WebP</option>
                                <option value="bmp">BMP</option>
                            </select>
                        </div>
                    )}

                    {/* Image Crop */}
                    {currentStep.type === 'crop' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>X (px)</label>
                                <input type="number" value={cropX} onChange={(e) => setCropX(parseInt(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Y (px)</label>
                                <input type="number" value={cropY} onChange={(e) => setCropY(parseInt(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Width (px)</label>
                                <input type="number" value={cropW} onChange={(e) => setCropW(parseInt(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Height (px)</label>
                                <input type="number" value={cropH} onChange={(e) => setCropH(parseInt(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }} />
                            </div>
                        </div>
                    )}

                    {/* Rotate PDF */}
                    {currentStep.type === 'rotate' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 12, fontWeight: 500 }}>Rotation Angle</label>
                            <div style={{ display: 'flex', gap: 16 }}>
                                {[90, 180, 270].map((angle) => (
                                    <label key={angle} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '12px 16px', background: rotateAngle === angle ? '#eff6ff' : '#f9fafb', borderRadius: 8, border: rotateAngle === angle ? '1px solid #3b82f6' : '1px solid #e5e7eb' }}>
                                        <input
                                            type="radio"
                                            name="rotateAngle"
                                            value={angle}
                                            checked={rotateAngle === angle}
                                            onChange={() => setRotateAngle(angle)}
                                        />
                                        {angle}°
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Organize PDF */}
                    {currentStep.type === 'organize' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Page Order</label>
                            <input
                                type="text"
                                placeholder="e.g. 1, 3, 5-10"
                                value={pageOrder}
                                onChange={(e) => setPageOrder(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', marginBottom: 8 }}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                Enter page numbers/ranges to keep and reorder (e.g. "2, 1, 4-6"). Leave empty to keep original order.
                            </p>
                        </div>
                    )}

                    {/* OCR Languages */}
                    {(currentStep.type === 'ocr_pdf' || currentStep.type === 'extract_text') && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Content Language</label>
                            <select
                                value={ocrLanguage}
                                onChange={(e) => setOcrLanguage(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                            >
                                <option value="eng">English</option>
                                <option value="spa">Spanish</option>
                                <option value="fra">French</option>
                                <option value="deu">German</option>
                                <option value="ita">Italian</option>
                                <option value="por">Portuguese</option>
                                <option value="rus">Russian</option>
                                <option value="chi_sim">Chinese (Simplified)</option>
                                <option value="jpn">Japanese</option>
                                <option value="hin">Hindi</option>
                            </select>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 8 }}>
                                {currentStep.type === 'ocr_pdf' ? 'Makes text selectable while preserving layout.' : 'Extracts all text into a plain text file.'}
                            </p>
                        </div>
                    )}


                    {/* Split PDF */}
                    {currentStep.type === 'split' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 12, fontWeight: 500 }}>Split Mode</label>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="radio" name="splitMode" value="all" checked={splitMode === 'all'} onChange={() => setSplitMode('all')} />
                                    Burst (Split every page)
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="radio" name="splitMode" value="ranges" checked={splitMode === 'ranges'} onChange={() => setSplitMode('ranges')} />
                                    By Range
                                </label>
                            </div>

                            {splitMode === 'ranges' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ranges</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1-5, 6-10"
                                        value={splitRanges}
                                        onChange={(e) => setSplitRanges(e.target.value)}
                                        style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>
                                        Creates one file per range.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Blocks for Auto-Steps */}
                    {['merge', 'split', 'rotate', 'repair', 'organize', 'to_pdf', 'convert_image_to_pdf', 'convert_pdf_to_image', 'enhance_image'].includes(currentStep.type) && (
                        <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, color: '#0369a1', fontSize: '0.9rem', border: '1px solid #bae6fd' }}>
                            {currentStep.type === 'merge' ? "All input files will be merged into a single document." :
                                currentStep.type === 'split' && splitMode === 'all' ? "Input file(s) will be split into individual pages." :
                                    currentStep.type === 'enhance_image' ? "Auto-adjusts contrast and sharpness for better readability." :
                                        "This operation will be applied automatically with default settings."}
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ marginBottom: 24, padding: 12, background: '#fef2f2', color: '#991b1b', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={processStep}
                        disabled={status === 'processing'}
                        className="btn btn-primary"
                        style={{ paddingLeft: 32, paddingRight: 32 }}
                    >
                        {status === 'processing' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" style={{ marginRight: 8 }} /> Processing...
                            </>
                        ) : (
                            <>
                                Next Step <ArrowRight size={18} style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
