"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ResizeImageTool() {
    const processImage = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const width = parseInt(options.width || "800");
        const height = parseInt(options.height || "600");

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const resultBytes = wasmModule.resize_image(uint8Array, width, height);

            return new Blob([resultBytes], { type: 'image/png' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Resize failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Resize Image"
            description="Change image dimensions."
            accept="image/*"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <div style={{ display: 'flex', gap: 10 }}>
                    <input type="number" name="width" placeholder="Width" className="input" style={{ flex: 1, padding: 8 }} required />
                    <input type="number" name="height" placeholder="Height" className="input" style={{ flex: 1, padding: 8 }} required />
                </div>
            }
            onProcess={processImage}
        />
    );
}
