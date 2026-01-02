"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ProtectPdfTool() {
    const [showPassword, setShowPassword] = React.useState(false);

    const processPdf = async (files: File[], options: any) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('file', file));
        formData.append('password', options.password || '');

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
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="New Password"
                            style={{ width: '100%', padding: '8px 40px 8px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 5,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                color: '#666'
                            }}
                        >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>
                </div>
            }
        />
    );
}
