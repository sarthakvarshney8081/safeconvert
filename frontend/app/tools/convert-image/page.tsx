"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function ConvertImageTool() {
    const processImage = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert("Only PNG, JPG, and WebP formats are allowed!");
            throw new Error("Invalid format");
        }
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

            return {
                blob: new Blob([resultBytes], { type: mimeType }),
                fileName: `converted.${targetFormat === 'jpeg' ? 'jpg' : targetFormat}`
            };

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Conversion failed: ${e.message}`);
        }
    };

    return (
        <ToolInterface
            title="Convert Image"
            description="Convert images between formats (PNG, JPG, WebP)."
            accept="image/*"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <select name="format" className="input" style={{ width: '100%', padding: 8 }}>
                    <option value="png">to PNG</option>
                    <option value="jpeg">to JPEG</option>
                    <option value="webp">to WebP</option>
                </select>
            }
            onProcess={processImage}
        />
    );
}
