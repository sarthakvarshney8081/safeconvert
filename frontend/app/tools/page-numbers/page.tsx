"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function AddPageNumbersTool() {
    const processFile = async (files: File[], options: any) => {
        // Dynamic import Wasm
        // Dynamic import Wasm
        // @ts-ignore
        const wasm = await import(
            /* webpackIgnore: true */
            '/wasm/safeconvert_wasm.js'
        );
        await wasm.default();

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const position = options.position || "bottom";

        // Call Wasm
        const resultBytes = wasm.add_page_numbers(bytes, position);
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Add Page Numbers"
            description="Number your PDF pages instantly in the browser."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="numbered.pdf"
            processingMode="client"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Position</label>
                    <select name="position" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                        <option value="bottom">Bottom Center</option>
                        <option value="top">Top Center</option>
                    </select>
                </div>
            }
        />
    );
}
