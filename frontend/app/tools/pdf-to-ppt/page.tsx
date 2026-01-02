"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function PdfToPptTool() {
    return (
        <ToolInterface
            title="PDF to PPT"
            description="Convert PDF slides to PowerPoint."
            accept=".pdf"
            apiEndpoint="/api/convert-from-pdf/to-ppt"
            resultFileName="presentation.pptx"
        />
    );
}
