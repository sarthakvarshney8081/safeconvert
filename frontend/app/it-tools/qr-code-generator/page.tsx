"use client";

import React, { useState, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { QrCode, Image as ImageIcon, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

function QrCodeContent() {
    const [qrText, setQrText] = useState('https://example.com');
    const [qrSize, setQrSize] = useState(256);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadAsImage = async () => {
        const element = document.getElementById('qr-export-template');
        if (!element) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true });
            const link = document.createElement('a');
            const fileName = qrText.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || 'qr_code';
            link.download = `${fileName}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating image:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadAsPdf = async () => {
        const element = document.getElementById('qr-export-template');
        if (!element) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true });
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [width, height] });
            const fileName = qrText.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || 'qr_code';

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
            pdf.save(`${fileName}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <ToolLayout
            title="QR Code Generator"
            description="Create custom QR codes for text, URLs, and more. Download as high-quality PNG or PDF."
            icon={QrCode}
        >
            <div className="card" style={{ padding: 30 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'center', alignItems: 'flex-start' }}>

                    {/* Input Section */}
                    <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Content (URL or Text)</label>
                            <textarea
                                value={qrText}
                                onChange={(e) => setQrText(e.target.value)}
                                placeholder="Enter text or URL to generate QR..."
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 12,
                                    border: '1px solid #e0e0e0',
                                    fontSize: '1rem',
                                    minHeight: 100,
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ fontWeight: 500, color: '#555' }}>Download Options</label>
                            <div style={{ display: 'flex', gap: 15 }}>
                                <button
                                    onClick={downloadAsImage}
                                    disabled={!qrText || isDownloading}
                                    className="btn btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12 }}
                                >
                                    <ImageIcon size={20} />
                                    <span>{isDownloading ? 'Processing...' : 'PNG Image'}</span>
                                </button>
                                <button
                                    onClick={downloadAsPdf}
                                    disabled={!qrText || isDownloading}
                                    className="btn"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12, background: '#f1f5f9', color: '#334155' }}
                                >
                                    <FileText size={20} />
                                    <span>{isDownloading ? 'Processing...' : 'PDF Document'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div style={{
                        background: '#fff',
                        padding: 30,
                        borderRadius: 24,
                        border: '1px solid #f0f0f0',
                        textAlign: 'center',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <QRCodeSVG value={qrText || ' '} size={220} />
                        <div style={{ marginTop: 20, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666', fontSize: '0.9rem' }}>
                            {qrText || 'Your Content'}
                        </div>
                    </div>
                </div>

                {/* Hidden Export Template */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div id="qr-export-template" style={{
                        width: '400px',
                        padding: '50px 40px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'sans-serif',
                        textAlign: 'center'
                    }}>
                        {/* Header/Logo */}
                        <div style={{ marginBottom: 40, opacity: 0.8 }}>
                            <img src="/logo.svg" alt="" style={{ height: 35, width: 'auto' }} />
                        </div>

                        {/* QR Card */}
                        <div style={{
                            background: '#ffffff',
                            padding: '30px',
                            borderRadius: '24px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
                            marginBottom: 40,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <QRCodeSVG value={qrText || ' '} size={240} level="H" includeMargin={true} />
                        </div>

                        {/* Content Text */}
                        <div style={{ marginBottom: 40, maxWidth: '100%', wordBreak: 'break-word' }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: 600, marginBottom: 10 }}>Scannable Content</div>
                            <div style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>
                                {qrText}
                            </div>
                        </div>

                        {/* CTA / Footer */}
                        <div style={{
                            padding: '15px 30px',
                            background: '#f8fafc',
                            borderRadius: '100px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                                Scan with your camera
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}

export default function QrCodeGenerator() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QrCodeContent />
        </Suspense>
    );
}
