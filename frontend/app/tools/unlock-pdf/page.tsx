"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function UnlockPdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const password = options.password || "";

        if (!password.trim()) {
            // "Validation check if the not enter a password then one pop up is coming"
            // Since we are inside onProcess, throwing error will show popup in ToolInterface
            alert("Please enter the password!");
            throw new Error("Password is required to unlock the PDF.");
        }

        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('password', password);

        // Switch to Backend for reliability
        const response = await fetch('/api/security/unlock', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let msg = "Unlock failed";
            try {
                const json = JSON.parse(errorText);
                msg = json.detail || msg;
            } catch { }
            throw new Error(msg);
        }

        return await response.blob();
    };

    return (
        <ToolInterface
            title="Unlock PDF"
            description="Remove password protection from PDF."
            accept=".pdf"
            apiEndpoint="/api/security/unlock" // Used as fallback if onProcess wasn't defined, but we define onProcess
            processingMode="server"
            onProcess={processPdf}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter Password"
                        className="input"
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                    />
                </div>
            }
        />
    );
}
