"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileCode, Copy, Check, Upload, Download } from 'lucide-react';
import { Buffer } from 'buffer';
import { useSearchParams } from 'next/navigation';

function Base64ConverterContent() {
    const searchParams = useSearchParams();
    const fileSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchParams.get('mode') === 'file' && fileSectionRef.current) {
            fileSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams]);

    // String State
    const [textInput, setTextInput] = useState('');
    const [base64Output, setBase64Output] = useState('');
    const [base64Input, setBase64Input] = useState('');
    const [textOutput, setTextOutput] = useState('');
    const [urlSafe, setUrlSafe] = useState(false);

    // File State
    const [file, setFile] = useState<File | null>(null);
    const [fileBase64, setFileBase64] = useState('');
    const [fileInputBase64, setFileInputBase64] = useState(''); // For base64 -> file
    const [downloadName, setDownloadName] = useState('download');
    const [downloadExt, setDownloadExt] = useState('');

    // String Logic
    useEffect(() => {
        try {
            let b64 = Buffer.from(textInput, 'utf-8').toString('base64');
            if (urlSafe) {
                b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            }
            setBase64Output(b64);
        } catch {
            setBase64Output('');
        }
    }, [textInput, urlSafe]);

    useEffect(() => {
        try {
            let b64 = base64Input.trim();
            if (urlSafe) {
                b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
                while (b64.length % 4) b64 += '=';
            }
            const txt = Buffer.from(b64, 'base64').toString('utf-8');
            setTextOutput(txt);
        } catch {
            setTextOutput('');
        }
    }, [base64Input, urlSafe]);

    // File Logic
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            const reader = new FileReader();
            reader.onload = () => {
                setFileBase64(reader.result as string);
            };
            reader.readAsDataURL(f);
        }
    };

    const handleDownload = () => {
        if (!fileInputBase64) return;
        try {
            // Check if it has data URI scheme
            let b64 = fileInputBase64.trim();
            // If it doesn't have scheme, try to add it or just treat as blob
            const link = document.createElement('a');
            link.href = b64.startsWith('data:') ? b64 : `data:application/octet-stream;base64,${b64}`;
            link.download = `${downloadName}${downloadExt ? (downloadExt.startsWith('.') ? downloadExt : `.${downloadExt}`) : ''}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
        }
    }


    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            if (!text) return;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={copy}
                disabled={!text}
                style={{
                    padding: '8px 16px',
                    background: !text ? '#ccc' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: !text ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.9rem'
                }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        );
    };

    return (
        <ToolLayout
            title="Base64 Converter"
            description="Encode/Decode strings and convert files to Base64."
            icon={FileCode}
        >
            {/* String Section */}
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: 15 }}>String Conversion</h2>
            <div style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                    type="checkbox"
                    id="urlSafe"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                />
                <label htmlFor="urlSafe" style={{ cursor: 'pointer', userSelect: 'none' }}>URL Safe (uses -_ instead of +/)</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginBottom: 40 }}>
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>Text to Base64</h3>
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type text to encode..."
                        rows={5}
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8 }}
                    />
                    <textarea
                        readOnly
                        value={base64Output}
                        placeholder="Base64 output..."
                        rows={5}
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9', fontFamily: 'monospace' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CopyButton text={base64Output} />
                    </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>Base64 to Text</h3>
                    <textarea
                        value={base64Input}
                        onChange={(e) => setBase64Input(e.target.value)}
                        placeholder="Paste Base64 to decode..."
                        rows={5}
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace' }}
                    />
                    <textarea
                        readOnly
                        value={textOutput}
                        placeholder="Text output..."
                        rows={5}
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CopyButton text={textOutput} />
                    </div>
                </div>
            </div>

            {/* File Section */}
            <h2 ref={fileSectionRef} style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 15, borderTop: '1px solid #eee', paddingTop: 20 }}>File Conversion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>File to Base64</h3>
                    <div style={{ border: '2px dashed #ddd', borderRadius: 8, padding: 30, textAlign: 'center', marginBottom: 10, cursor: 'pointer', position: 'relative' }}>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <Upload size={32} color="#aaa" style={{ marginBottom: 10 }} />
                        <p style={{ margin: 0, color: '#666' }}>{file ? file.name : 'Click or Drag file here'}</p>
                    </div>
                    <textarea
                        readOnly
                        value={fileBase64}
                        rows={5}
                        placeholder="Base64 string of file..."
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#f9f9f9', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CopyButton text={fileBase64} />
                    </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>Base64 to File</h3>
                    <textarea
                        value={fileInputBase64}
                        onChange={(e) => setFileInputBase64(e.target.value)}
                        rows={5}
                        placeholder="Paste Base64 string here (with data:image/png;base64,... header for best results)"
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                        <input
                            type="text"
                            value={downloadName}
                            onChange={e => setDownloadName(e.target.value)}
                            placeholder="Filename"
                            style={{ flex: 2, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                        <input
                            type="text"
                            value={downloadExt}
                            onChange={e => setDownloadExt(e.target.value)}
                            placeholder=".ext"
                            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={handleDownload}
                            disabled={!fileInputBase64}
                            style={{
                                padding: '8px 16px',
                                background: !fileInputBase64 ? '#ccc' : '#4CAF50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: !fileInputBase64 ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 5,
                                fontSize: '0.9rem'
                            }}
                        >
                            <Download size={16} />
                            Download File
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}

export default function Base64Converter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Base64ConverterContent />
        </Suspense>
    );
}
