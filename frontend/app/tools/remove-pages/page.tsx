"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function RemovePagesTool() {

    // Helper to parse "1, 2-5" string into array of numbers
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
        // Dynamic import Wasm
        const wasm = await import('../../../public/wasm/safeconvert_wasm');
        await wasm.default();

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const pagesToRemove = parsePageRanges(options.pages || "");

        if (pagesToRemove.length === 0) {
            throw new Error("Please specify pages to remove (e.g., 1, 3-5).");
        }

        // Call Wasm
        // Rust expects Vec<u32>
        const resultBytes = wasm.remove_pages(bytes, new Uint32Array(pagesToRemove));
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Remove Pages"
            description="Delete specific pages from your PDF instantly."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="trimmed.pdf"
            processingMode="client"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Pages to Remove</label>
                    <input
                        name="pages"
                        type="text"
                        placeholder="e.g. 1, 3-5, 8"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                        required
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 5 }}>
                        Enter page numbers or ranges separated by commas.
                    </p>
                </div>
            }
        />
    );
}
