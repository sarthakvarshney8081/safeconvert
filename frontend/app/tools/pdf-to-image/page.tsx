"use client";

import React, { useState } from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function PdfToImageTool() {
    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('format', options.format || 'png');

        const response = await fetch(`/api/convert/pdf-to-image?fmt=${options.format || 'png'}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Conversion failed");
        }
        return await response.blob();
    };

    return (
        <ToolInterface
            title="PDF to Image"
            description="Convert PDF pages into high-quality images (PNG/JPG)."
            accept=".pdf"
            apiEndpoint="/api/convert/pdf-to-image"
            onProcess={processFile}
            resultFileName="images.zip"
            processingMode="server"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Output Format</label>
                    <select name="format" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                        <option value="png">PNG (High Quality)</option>
                        <option value="jpeg">JPG (Smaller Size)</option>
                    </select>
                </div>
            }
        />
    );
}
