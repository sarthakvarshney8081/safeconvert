"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function PdfToPdfATool() {
    return (
        <ToolInterface
            title="PDF to PDF/A"
            description="Convert PDF to PDF/A for long-term archiving."
            accept=".pdf"
            apiEndpoint="/api/pdf-to-pdfa"
            resultFileName="archived.pdf"
        />
    );
}
