"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function CompressImageTool() {
    const processImage = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        // Default quality 75 if not set
        const quality = parseInt(options.quality || "75");

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // compress_image(bytes, quality (0-100))
            const resultBytes = wasmModule.compress_image(uint8Array, quality);

            return new Blob([resultBytes], { type: 'image/jpeg' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Compression failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Compress Image"
            description="Reduce image size without losing quality."
            accept="image/*"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label>Quality:</label>
                    <input type="range" name="quality" min="1" max="100" defaultValue="75" style={{ flex: 1 }} />
                </div>
            }
            onProcess={processImage}
        />
    );
}
