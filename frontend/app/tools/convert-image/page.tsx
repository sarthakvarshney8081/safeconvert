"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ConvertImageTool() {
    const processImage = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const targetFormat = options.format || 'png';

        try {
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_wasm.js'
            );
            await wasmModule.default();

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const resultBytes = wasmModule.convert_image(uint8Array, targetFormat);

            let mimeType = 'image/jpeg';
            if (targetFormat === 'png') mimeType = 'image/png';
            if (targetFormat === 'webp') mimeType = 'image/webp';
            if (targetFormat === 'bmp') mimeType = 'image/bmp';
            if (targetFormat === 'ico') mimeType = 'image/x-icon';

            return new Blob([resultBytes], { type: mimeType });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Conversion failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Convert Image (Client-Side Wasm)"
            description="Convert image formats locally (PNG, JPG, WebP)."
            accept="image/*"
            apiEndpoint=""
            onProcess={processImage}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 10 }}>Target Format</label>
                    <select name="format" style={{ width: '100%', padding: 8 }}>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="webp">WebP</option>
                        <option value="bmp">BMP</option>
                        <option value="ico">ICO</option>
                    </select>
                </div>
            }
        />
    );
}
