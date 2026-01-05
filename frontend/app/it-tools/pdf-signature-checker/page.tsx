"use client";

import React, { useState } from 'react';
import { FileSignature, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

export default function PdfSignatureChecker() {
    const [file, setFile] = useState<File | null>(null);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState<string>('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setLoading(true);
        setError('');
        setSignatures([]);
        setDebugInfo('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Call Backend API
            const res = await fetch('/api/pdf/verify-signature', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                let errMsg = `Server Error: ${res.status}`;
                try {
                    const json = JSON.parse(text);
                    errMsg = json.detail || errMsg;
                } catch (e) { }
                throw new Error(errMsg);
            }

            const data = await res.json();
            console.log("Backend Result:", data);
            setDebugInfo(JSON.stringify(data, null, 2));

            setSignatures(data.signatures || []);

        } catch (err) {
            console.error(err);
            setError(`Failed to verify: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolLayout
            title="PDF Signature Checker"
            description="Extract and verify digital signatures embedded in PDF files."
            icon={FileSignature}
        >
            <div style={{ display: 'grid', gap: '30px' }}>

                {/* Upload */}
                <div style={{ padding: '40px', border: '2px dashed #ddd', borderRadius: '12px', textAlign: 'center', background: '#fafafa' }}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Upload size={48} color="#999" style={{ marginBottom: '15px' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 500, color: '#555' }}>
                            {file ? file.name : 'Click to select PDF file'}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#999', marginTop: '5px' }}>
                            {file ? 'Change file' : 'or drag and drop here'}
                        </span>
                    </label>
                </div>

                {/* Results */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Processing file signatures...
                    </div>
                )}

                {error && (
                    <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <XCircle size={20} /> {error}
                    </div>
                )}

                {!loading && !error && file && signatures.length === 0 && (
                    <div style={{ padding: '20px', background: '#fff3e0', color: '#e65100', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={20} /> No digital signatures found in this document.
                    </div>
                )}

                {!loading && signatures.length > 0 && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <h3 style={{ margin: 0 }}>Found {signatures.length} Signature{signatures.length !== 1 ? 's' : ''}</h3>

                        {signatures.map((sig, i) => (
                            <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <CheckCircle size={24} color={sig.valid ? 'green' : 'orange'} />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Signature #{i + 1}</span>
                                </div>
                                <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Signer:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.signer || 'Unknown'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Timestamp:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.timestamp || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Integrity:</span>
                                        <span style={{ fontWeight: 500, color: sig.valid ? 'green' : 'red' }}>
                                            {sig.valid ? 'Valid' : 'Invalid'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Trust:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.trust ? 'Trusted' : 'Untrusted (Self-Signed?)'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Field:</span>
                                        <span style={{ fontFamily: 'monospace' }}>{sig.field}</span>
                                    </div>
                                    {sig.error && (
                                        <div style={{ display: 'flex', color: 'red' }}>
                                            <span style={{ width: '120px' }}>Error:</span>
                                            <span>{sig.error}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Debug Output */}
            {debugInfo && (
                <div style={{ marginTop: 20, padding: 20, background: '#eee', borderRadius: 8, overflow: 'auto' }}>
                    <strong>Raw Debug Output:</strong>
                    <pre style={{ fontSize: '0.8rem' }}>{debugInfo}</pre>
                </div>
            )}
        </ToolLayout>
    );
}
