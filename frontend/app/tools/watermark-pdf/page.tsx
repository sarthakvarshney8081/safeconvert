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
            title="Watermark PDF"
            description="Add text watermark to your PDF."
            accept=".pdf"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <input
                    type="text"
                    name="text"
                    placeholder="Watermark Text (e.g. CONFIDENTIAL)"
                    className="input"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                />
            }
            onProcess={processPdf}
        />
    );
}
