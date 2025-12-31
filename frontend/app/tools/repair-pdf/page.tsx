"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function RepairPdfTool() {
    return (
        <ToolInterface
            title="Repair PDF"
            description="Recover corrupted or damaged PDF files."
            accept=".pdf"
            apiEndpoint="/api/repair-pdf"
            resultFileName="repaired.pdf"
        />
    );
}
