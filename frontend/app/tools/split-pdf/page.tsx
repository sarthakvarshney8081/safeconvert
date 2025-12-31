"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function SplitPdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const start = parseInt(options.start || "1");
        const end = parseInt(options.end || "1");

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // split_pdf(bytes, start, end)
            const resultBytes = wasmModule.split_pdf(uint8Array, start, end);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Split failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Split PDF (Client-Side Wasm)"
            description="Extract pages from PDF locally. No upload."
            accept=".pdf"
            apiEndpoint=""
            onProcess={processPdf}
            optionsComponent={
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Start Page</label>
                        <input type="number" name="start" min="1" defaultValue="1" style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>End Page</label>
                        <input type="number" name="end" min="1" defaultValue="1" style={{ width: '100%', padding: 8 }} />
                    </div>
                </div>
            }
        />
    );
}
