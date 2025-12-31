"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ExtractPagesTool() {

    const parsePageRanges = (input: string): number[] => {
        const pages: Set<number> = new Set();
        const parts = input.split(',');
        parts.forEach(part => {
            const range = part.trim().split('-');
            if (range.length === 2) {
                const start = parseInt(range[0]);
                const end = parseInt(range[1]);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) pages.add(i);
                }
            } else {
                const p = parseInt(part);
                if (!isNaN(p)) pages.add(p);
            }
        });
        return Array.from(pages).sort((a, b) => a - b);
    };

    const processFile = async (files: File[], options: any) => {
        const wasm = await import('../../../public/wasm/safeconvert_wasm');
        await wasm.default();

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const pagesToExtract = parsePageRanges(options.pages || "");

        if (pagesToExtract.length === 0) {
            throw new Error("Please specify pages to extract.");
        }

        const resultBytes = wasm.extract_pages(bytes, new Uint32Array(pagesToExtract));
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Extract Pages"
            description="Save only selected pages as a new PDF."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="extracted.pdf"
            processingMode="client"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Pages to Keep</label>
                    <input
                        name="pages"
                        type="text"
                        placeholder="e.g. 1, 3-5"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                        required
                    />
                </div>
            }
        />
    );
}
