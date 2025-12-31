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
                <div style={{ padding: 10 }}>
                    <label style={{ display: 'block', marginBottom: 10 }}>Quality: 75%</label>
                    <input type="range" name="quality" min="1" max="100" defaultValue="75" style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: 5 }}>
                        <span>Smaller File</span>
                        <span>Better Quality</span>
                    </div>
                </div>
            }
            onProcess={processImage}
            resultFileName="compressed-image.jpg"
        />
    );
}
