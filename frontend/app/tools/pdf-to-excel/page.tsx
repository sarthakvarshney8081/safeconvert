"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function PdfToExcelTool() {
    return (
        <ToolInterface
            title="PDF to Excel"
            description="Convert PDF tables to Excel spreadsheets."
            accept=".pdf"
            apiEndpoint="/api/convert/pdf-to-excel"
            resultFileName="spreadsheet.xlsx"
        />
    );
}
