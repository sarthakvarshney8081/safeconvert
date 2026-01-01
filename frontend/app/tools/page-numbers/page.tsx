"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function AddPageNumbersTool() {
    const processFile = async (files: File[], options: any) => {
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

        const position = options.position || "bottom-center";
        const style = options.style || "1 of n";
        const margin = 20.0; // Fixed margin for now

        // Call Wasm
        const resultBytes = wasm.add_page_numbers(bytes, margin, position, style);
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Add Page Numbers"
            description="Number your PDF pages instantly in the browser. Fully private."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="numbered.pdf"
            processingMode="client"
            optionsComponent={
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#555' }}>Position</label>
                        <select name="position" defaultValue="bottom-center" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', background: '#f9f9f9' }}>
                            <option value="top-left">Top Left</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-center">Bottom Center</option>
                            <option value="bottom-right">Bottom Right</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#555' }}>Style</label>
                        <select name="style" defaultValue="1 of n" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', background: '#f9f9f9' }}>
                            <option value="1">1</option>
                            <option value="Page 1">Page 1</option>
                            <option value="1 of n">1 of n</option>
                            <option value="Page 1 of n">Page 1 of n</option>
                        </select>
                    </div>
                </div>
            }
        />
    );
}
