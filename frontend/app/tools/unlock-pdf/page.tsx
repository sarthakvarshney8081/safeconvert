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
            title="Unlock PDF (Client-Side Wasm)"
            description="Remove password from PDF locally. Files never leave your device."
            accept=".pdf"
            apiEndpoint=""
            onProcess={processPdf}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Enter Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="PDF Password"
                        style={{ width: '100%', padding: 8 }}
                        required
                    />
                </div>
            }
        />
    );
}
