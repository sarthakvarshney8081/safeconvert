"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function MergePdfTool() {
    const processPdf = async (files: File[], options: any) => {
        if (files.length < 2) throw new Error("Please select at least 2 files");

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            // Convert all files to Uint8Arrays
            const buffers = await Promise.all(
                files.map(async (f) => new Uint8Array(await f.arrayBuffer()))
            );

            // Call Wasm merge
            // merge_pdfs(array_of_arrays)
            const resultBytes = wasmModule.merge_pdfs(buffers);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Merge Error:", e);
            throw new Error(`Merge failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Merge PDF (Client-Side Wasm)"
            description="Combine multiple PDFs into one document locally."
            accept=".pdf"
            apiEndpoint=""
            maxFiles={10}
            onProcess={processPdf}
        />
    );
}
