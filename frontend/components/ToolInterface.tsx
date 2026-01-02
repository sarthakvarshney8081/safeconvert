"use client";

import React, { useState } from 'react';
import FileDropzone from './ui/FileDropzone';
import { Loader2, Download, RefreshCw, XCircle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './ToolInterface.module.css';

interface ToolInterfaceProps {
    title: string;
    description: string;
    apiEndpoint?: string;
    accept: string;
    multiple?: boolean;
    maxFiles?: number;
    processingMode?: 'client' | 'server';
    optionsComponent?: React.ReactNode;
    optionsTitle?: string;
    onProcess?: (files: File[], options: any) => Promise<Blob>; // Now optional
    onFileSelect?: (file: File) => Promise<void> | void; // Callback when file is chosen
    resultFileName?: string;
    icon?: any;
    extraOptions?: {
        name: string;
        label: string;
        type: 'select' | 'text' | 'number';
        defaultValue?: string;
        options?: { label: string; value: string }[];
    }[];
    children?: React.ReactNode;
    isProcessing?: boolean;
    hideSubmitButton?: boolean;
}

export default function ToolInterface({
    title,
    description,
    accept,
    multiple = false,
    maxFiles,
    processingMode = 'server',
    optionsComponent,
    optionsTitle,
    apiEndpoint,
    onProcess,
    onFileSelect,
    resultFileName = "result.pdf",
    icon: Icon,
    extraOptions,
    children,
    isProcessing = false,
    hideSubmitButton = false
}: ToolInterfaceProps) {
    const [status, setStatus] = useState<'idle' | 'ready' | 'processing' | 'completed' | 'error'>('idle');
    const [files, setFiles] = useState<File[]>([]);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ... (handlers) ...

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setStatus('ready');
        setError(null);
        if (onFileSelect && selectedFiles.length > 0) {
            onFileSelect(selectedFiles[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setStatus('processing');
        setError(null);

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const options = Object.fromEntries(formData.entries());

            let blob: Blob;

            if (onProcess) {
                blob = await onProcess(files, options);
            } else if (apiEndpoint) {
                const apiFormData = new FormData();
                // Handle multiple files if multiple=true
                if (multiple) {
                    files.forEach(f => apiFormData.append('files', f)); // Changed to 'files' for multiple
                } else {
                    apiFormData.append('file', files[0]);
                }

                Object.entries(options).forEach(([k, v]) => {
                    apiFormData.append(k, v as string);
                });

                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    body: apiFormData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Server error");
                }
                blob = await response.blob();
            } else {
                throw new Error("Tool configuration error: No processor defined.");
            }

            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setStatus('completed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during processing.");
            setStatus('error');
        }
    };

    const handleReset = () => {
        setFiles([]);
        setResultUrl(null);
        setStatus('idle');
        setError(null);
    };

    return (
        <div className="container" style={{ maxWidth: 800, padding: '20px 20px 40px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                    <ArrowLeft size={16} />
                    Back to Tools
                </Link>
            </div>
            {/* ... Header ... */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                    {Icon && <Icon size={40} className="text-primary" />}
                    <h1 style={{ margin: 0 }}>{title}</h1>
                    {/* ... Badges ... */}
                    {processingMode === 'client' ? (
                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: 12, background: '#e3f2fd', color: '#1565c0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>⚡ Browser</span>
                    ) : (
                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: 12, background: '#f5f5f5', color: '#616161', display: 'inline-flex', alignItems: 'center', gap: 4 }}>☁️ Server</span>
                    )}
                </div>
                <p style={{ color: '#666' }}>{description}</p>
            </div>

            <div className="card">
                {status === 'idle' || status === 'ready' ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 30 }}>
                            <FileDropzone
                                onFilesSelected={handleFilesSelected}
                                accept={accept}
                                multiple={multiple}
                                maxFiles={maxFiles}
                            />
                        </div>

                        {/* Custom Children Content (e.g. Editors) */}
                        {children && status !== 'idle' && (
                            <div style={{ marginBottom: 30, animation: 'fadeIn 0.3s ease' }}>
                                {children}
                            </div>
                        )}

                        {status === 'ready' && (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                {/* Dynamic Extra Options */}
                                {extraOptions && (
                                    <div style={{ marginBottom: 30, padding: 20, background: '#f5f5f7', borderRadius: 8 }}>
                                        <h3 style={{ marginBottom: 15, fontSize: '1rem' }}>Options</h3>
                                        <div style={{ display: 'grid', gap: 15 }}>
                                            {extraOptions.map((opt) => (
                                                <div key={opt.name}>
                                                    <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: '0.9rem' }}>{opt.label}</label>
                                                    {opt.type === 'select' ? (
                                                        <select
                                                            name={opt.name}
                                                            defaultValue={opt.defaultValue}
                                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff' }}
                                                        >
                                                            {opt.options?.map(o => (
                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={opt.type}
                                                            name={opt.name}
                                                            defaultValue={opt.defaultValue}
                                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {optionsComponent && (
                                    <div style={{ marginBottom: 30, padding: 20, background: '#f5f5f7', borderRadius: 8 }}>
                                        <h3 style={{ marginBottom: 15, fontSize: '1rem' }}>{optionsTitle || "More Options"}</h3>
                                        {optionsComponent}
                                    </div>
                                )}

                                {!hideSubmitButton && (
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                                        {title}
                                    </button>
                                )}
                            </div>
                        )}

                        {(status === 'idle' || status === 'ready') && (
                            <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 20 }}>
                                <Link href="/" style={{ color: '#666', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <ArrowLeft size={16} />
                                    Back to Home
                                </Link>
                            </div>
                        )}
                    </form>
                ) : status === 'processing' || isProcessing ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Loader2 size={48} className={styles.spin} style={{ color: 'var(--primary)', marginBottom: 20 }} />
                        <h3>Processing your files...</h3>
                        <p style={{ color: '#666' }}>Please wait, do not close this window.</p>
                    </div>
                ) : status === 'completed' && resultUrl ? (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <div style={{ width: 80, height: 80, background: '#e8f5e9', color: '#2e7d32', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Download size={40} />
                        </div>
                        <h2 style={{ marginBottom: 10 }}>Task Completed!</h2>
                        <p style={{ color: '#666', marginBottom: 30 }}>Your files have been processed successfully.</p>

                        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                            <a href={resultUrl} download={resultFileName} className="btn btn-primary">
                                Download File
                            </a>
                            <button onClick={handleReset} className="btn" style={{ background: '#f5f5f7' }}>
                                <RefreshCw size={18} style={{ marginRight: 8 }} />
                                Start Over
                            </button>
                            <Link href="/" className="btn" style={{ background: '#f5f5f7' }}>
                                <Home size={18} style={{ marginRight: 8 }} />
                                Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <div style={{ color: 'var(--error)', marginBottom: 20 }}>
                            <XCircle size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h3>Something went wrong</h3>
                        <p style={{ color: '#666', marginBottom: 30 }}>{error}</p>
                        <button onClick={handleReset} className="btn" style={{ background: '#f5f5f7' }}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
