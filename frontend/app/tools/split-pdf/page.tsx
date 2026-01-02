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
            title="Split PDF"
            description="Extract specific pages from your PDF."
            accept=".pdf"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Start Page</label>
                        <input
                            type="number"
                            name="start"
                            placeholder="1"
                            className="input"
                            min="1"
                            defaultValue="1"
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>End Page</label>
                        <input
                            type="number"
                            name="end"
                            placeholder="e.g. 5"
                            className="input"
                            min="1"
                            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                            required
                        />
                    </div>
                </div>
            }
            onProcess={processPdf}
        />
    );
}
