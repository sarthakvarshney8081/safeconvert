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
        const wasm = await import(/* webpackIgnore: true */ '/wasm/safeconvert_wasm.js');
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

            textContent={
                <div className="prose" style={{ maxWidth: '100%', color: '#333' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 20 }}>How to Remove Pages from PDF</h2>
                    <ol style={{ paddingLeft: 20, marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <li><strong>Upload your PDF:</strong> Drag and drop your file regarding the dropzone above.</li>
                        <li><strong>Select Pages:</strong> Enter the page numbers you want to delete (e.g. "1, 3-5").</li>
                        <li><strong>Remove:</strong> Click the "Remove Pages" button to process your file locally.</li>
                        <li><strong>Download:</strong> Save your new PDF with the specified pages removed.</li>
                    </ol>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 15, marginTop: 40 }}>Why use this tool?</h2>
                    <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                        Quickly delete unwanted pages from documents without uploading them to a server.
                        Your files remain private and secure on your device. Perfect for removing sensitive information,
                        blank pages, or irrelevant sections from reports and contracts.
                    </p>
                </div>
            }
        />
    );
}
