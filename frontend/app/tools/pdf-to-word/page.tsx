"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function PdfToWordTool() {
    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await fetch('/api/convert-from-pdf/to-word', {
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
            title="PDF to Word"
            description="Convert PDF documents to editable Word (DOCX) files with accurate formatting."
            accept=".pdf"
            apiEndpoint="/api/convert-from-pdf/to-word"
            onProcess={processFile}
            resultFileName="converted.docx"
            processingMode="server"
        />
    );
}
