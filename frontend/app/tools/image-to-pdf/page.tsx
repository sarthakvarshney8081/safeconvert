"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ImageToPdfTool() {
    // This is the original API-based tool for converting Images -> PDF
    const processFiles = async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('/api/convert/image-to-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error("Conversion failed");
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
