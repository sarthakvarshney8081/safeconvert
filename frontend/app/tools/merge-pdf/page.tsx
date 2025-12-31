"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function MergePdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length < 2) throw new Error("Please select at least 2 files");

        const formData = new FormData();
        // Backend expects 'files' as a list of UploadFile
        files.forEach((file) => formData.append('files', file));

        // Use Backend API
        const response = await fetch('/api/pdf/merge', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Merge failed");
        }
        return await response.blob();
    };

    return (
        <ToolInterface
            title="Merge PDF"
            description="Combine multiple PDFs into one document."
            accept=".pdf"
            multiple={true}
            apiEndpoint="/api/pdf/merge"
            maxFiles={10}
            processingMode="server"
            onProcess={processPdf}
        />
    );
}
