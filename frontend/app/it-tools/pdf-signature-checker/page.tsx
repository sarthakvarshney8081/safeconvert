"use client";

import React, { useState } from 'react';
import { FileSignature, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { getSignatures, Signature } from 'pdf-signature-reader';

export default function PdfSignatureChecker() {
    const [file, setFile] = useState<File | null>(null);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setLoading(true);
        setError('');
        setSignatures([]);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const foundSignatures = getSignatures(buffer);
            setSignatures(foundSignatures);
        } catch (err) {
            console.error(err);
            setError('Failed to parse PDF signatures. Ensure the file is a valid PDF.');
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
                                    <CheckCircle size={24} color={sig.signedData.length > 0 ? 'green' : 'orange'} />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Signature #{i + 1}</span>
                                </div>
                                <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Reason:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.reason || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Contact Info:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.contactInfo || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Location:</span>
                                        <span style={{ fontWeight: 500 }}>{sig.location || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Byte Range:</span>
                                        <span style={{ fontFamily: 'monospace' }}>[{sig.byteRange.join(', ')}]</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ width: '120px', color: '#666' }}>Type:</span>
                                        <span>{sig.type} | {sig.subFilter}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </ToolLayout>
    );
}
