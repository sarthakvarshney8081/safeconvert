"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ProtectPdfTool() {
    // Wasm Encryption is currently deferred/complex.
    // We will use the backend API (Python) for now, as it uses reliable pypdf/pikepdf encryption.
    // OR we can try Wasm, but `encrypt_pdf` returns an error currently.
    // 
    // To provide a working tool, we will point to the API endpoint for now, 
    // similar to how we handled "Image to PDF".

    const processPdf = async (files: File[], options: any) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('file', file)); // Backend expects 'file' for single
        formData.append('password', options.password || '');

        // Use Python Backend
        const response = await fetch('/api/security/protect', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Protection failed");
        }
        return await response.blob();
    };

    return (
        <ToolInterface
            title="Protect PDF"
            description="Encrypt your PDF with a password (Server-side)."
            accept=".pdf"
            apiEndpoint="/api/security/protect"
            onProcess={processPdf}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Set Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="New Password"
                        style={{ width: '100%', padding: 8 }}
                        required
                    />
                </div>
            }
        />
    );
}
