"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ImageToPdfTool() {
    // This is the original API-based tool for converting Images -> PDF
    const processFiles = async (files: File[]) => {
        if (files.length === 0) throw new Error("No files selected");

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                alert(`File ${file.name} is not a supported image format (PNG, JPG, WebP).`);
                throw new Error("Invalid format");
            }
        }

        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('/api/convert/image-to-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let msg = "Conversion failed";
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
            title="Image to PDF"
            description="Convert JPG, PNG, or other images to PDF format."
            accept="image/*"
            apiEndpoint="/api/convert/image-to-pdf"
            onProcess={processFiles}
        />
    );
}
