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
        const wasm = await import(/* webpackIgnore: true */ '/wasm/safeconvert_wasm.js');
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
            textContent={
                <div className="prose" style={{ maxWidth: '100%', color: '#333' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 20 }}>How to Extract Pages from PDF</h2>
                    <ol style={{ paddingLeft: 20, marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <li><strong>Upload PDF:</strong> Select or drag & drop the PDF file you want to split.</li>
                        <li><strong>Choose Pages:</strong> Enter the page numbers you want to <strong>keep</strong> (e.g. "1-5, 8").</li>
                        <li><strong>Extract:</strong> Click the button to generate a new PDF containing only these pages.</li>
                        <li><strong>Download:</strong> Instantly download your new smaller file.</li>
                    </ol>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 15, marginTop: 40 }}>Privacy First</h2>
                    <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
                        This tool runs purely in your browser using WebAssembly. Your documents are never sent to any server,
                        ensuring 100% privacy for your sensitive data.
                    </p>
                </div>
            }
        />
    );
}
