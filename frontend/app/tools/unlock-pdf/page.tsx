"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function UnlockPdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const password = options.password || "";

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // decrypt_pdf(bytes, password)
            const resultBytes = wasmModule.decrypt_pdf(uint8Array, password);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Unlock failed: ${e.message || e}`);
        }
    };

    return (
        <ToolInterface
            title="Unlock PDF"
            description="Remove password protection from PDF."
            accept=".pdf"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input"
                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
                />
            }
            onProcess={processPdf}
        />
    );
}
