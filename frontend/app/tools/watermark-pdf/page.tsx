"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function WatermarkPdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const text = options.watermarkText || "CONFIDENTIAL";

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // watermark_pdf(bytes, text)
            const resultBytes = wasmModule.watermark_pdf(uint8Array, text);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Watermark failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Watermark PDF (Client-Side Wasm)"
            description="Add text watermark to your PDF locally."
            accept=".pdf"
            apiEndpoint=""
            onProcess={processPdf}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Watermark Text</label>
                    <input
                        type="text"
                        name="watermarkText"
                        placeholder="e.g. DRAFT"
                        defaultValue="CONFIDENTIAL"
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>
            }
        />
    );
}
