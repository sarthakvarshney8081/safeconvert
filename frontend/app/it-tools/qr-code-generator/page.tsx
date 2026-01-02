"use client";

import React, { useState, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';

function QrCodeContent() {
    const [qrText, setQrText] = useState('https://example.com');
    const [qrSize, setQrSize] = useState(256);

    return (
        <ToolLayout
            title="QR Code Generator"
            description="Create QR codes for text and URLs."
            icon={QrCode}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>QR Code Generator</h3>
                <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Enter text or URL..."
                    style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        fontSize: '1rem'
                    }}
                />
                <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #ddd' }}>
                        <QRCodeSVG value={qrText || ' '} size={qrSize} />
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
