"use client";

import React, { useState } from 'react';
import FileDropzone from './ui/FileDropzone';
import { Loader2, Download, RefreshCw, XCircle } from 'lucide-react';
import styles from './ToolInterface.module.css';

interface ToolInterfaceProps {
    title: string;
    description: string;
    apiEndpoint: string;
    accept: string;
    multiple?: boolean;
    optionsComponent?: React.ReactNode;
    onProcess: (files: File[], options: any) => Promise<Blob>; // Returns downloaded blob
    resultFileName?: string;
}

export default function ToolInterface({
    title,
    description,
    accept,
    multiple = false,
    optionsComponent,
    onProcess,
    resultFileName = "result.pdf"
}: ToolInterfaceProps) {
    const [status, setStatus] = useState<'idle' | 'ready' | 'processing' | 'completed' | 'error'>('idle');
    const [files, setFiles] = useState<File[]>([]);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setStatus('ready');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setStatus('processing');
        setError(null);

        try {
            // Collect options from form if any
            const formData = new FormData(e.target as HTMLFormElement);
            const options = Object.fromEntries(formData.entries());

            const blob = await onProcess(files, options);
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
        <div className="container" style={{ maxWidth: 800, padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ marginBottom: 10 }}>{title}</h1>
                <p style={{ color: '#666' }}>{description}</p>
            </div>

            <div className="card" style={{ padding: 40 }}>
                {status === 'idle' || status === 'ready' ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 30 }}>
                            <FileDropzone
                                onFilesSelected={handleFilesSelected}
                                accept={accept}
                                multiple={multiple}
                            />
                        </div>

                        {status === 'ready' && (
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                {optionsComponent && (
                                    <div style={{ marginBottom: 30, padding: 20, background: '#f5f5f7', borderRadius: 8 }}>
                                        <h3 style={{ marginBottom: 15, fontSize: '1rem' }}>Options</h3>
                                        {optionsComponent}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                                    {title}
                                </button>
                            </div>
                        )}
                    </form>
                ) : status === 'processing' ? (
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
