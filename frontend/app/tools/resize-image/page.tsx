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

            return {
                blob: new Blob([resultBytes], { type: 'image/png' }),
                fileName: 'resized.png'
            };

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
                <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <input type="number" name="width" placeholder="Width" className="input" style={{ flex: 1, padding: 8 }} required />
                        <input type="number" name="height" placeholder="Height" className="input" style={{ flex: 1, padding: 8 }} required />
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {['1:1', '4:3', '16:9', '2:3'].map(ratio => (
                            <button
                                key={ratio}
                                type="button"
                                onClick={(e) => {
                                    // Logic to set width/height based on ratio would require state, 
                                    // but for now we can just fill hypothetical values or let user know
                                    // A full implementation requires state lifting or ref access to inputs.
                                    // For simplicity/MVP:
                                    const form = (e.target as HTMLElement).closest('form');
                                    if (form) {
                                        const wInput = form.querySelector('[name=width]') as HTMLInputElement;
                                        const hInput = form.querySelector('[name=height]') as HTMLInputElement;
                                        // Assume base width 1000 for calculation
                                        const [w, h] = ratio.split(':').map(Number);
                                        if (wInput && hInput) {
                                            wInput.value = "1000";
                                            hInput.value = Math.round(1000 * (h / w)).toString();
                                        }
                                    }
                                }}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    borderRadius: 4,
                                    border: '1px solid #ddd',
                                    background: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
            }
            onProcess={processImage}
        />
    );
}
