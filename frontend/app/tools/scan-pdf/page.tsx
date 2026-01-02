"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ScanPdfTool() {
    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        // Default to English for now. later we can add language selector to options
        formData.append('lang', options.lang || 'eng');

        const response = await fetch('/api/ocr/scan-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "OCR processing failed");
        }
        return await response.blob();
    };

    return (
        <ToolInterface
            title="Scan to PDF (OCR)"
            description="Convert scanned images or PDFs into searchable, selectable text documents."
            accept=".pdf,.png,.jpg,.jpeg"
            apiEndpoint="/api/ocr/scan-pdf"
            onProcess={processFile}
            resultFileName="searchable.pdf"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Document Language</label>
                    <select name="lang" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                        <option value="eng">English</option>
                        <option value="hin">Hindi</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="spa">Spanish</option>
                    </select>
                </div>
            }
            processingMode="server"
        />
    );
}
