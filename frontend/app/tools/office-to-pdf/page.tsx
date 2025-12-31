"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function OfficeToPdfTool() {
    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await fetch('/api/office/to-pdf', {
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
            title="Office to PDF"
            description="Convert Word, Excel, and PowerPoint documents to professional PDFs."
            accept=".docx,.xlsx,.pptx,.doc,.xls,.ppt"
            apiEndpoint="/api/office/to-pdf"
            onProcess={processFile}
            resultFileName="converted.pdf"
            processingMode="server"
        />
    );
}
