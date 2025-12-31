"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function CropPdfTool() {
    const processFile = async (files: File[], options: any) => {
        // @ts-ignore
        // @ts-ignore
        const wasm = await import(
            /* webpackIgnore: true */
            '/wasm/safeconvert_wasm.js'
        );
        await wasm.default();

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const margin = parseFloat(options.margin || "0");

        if (margin <= 0) {
            throw new Error("Margin must be greater than 0");
        }

        // Call Wasm
        const resultBytes = wasm.crop_pdf(bytes, margin);
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Crop PDF"
            description="Trim white margins from all pages."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="cropped.pdf"
            processingMode="client"
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 5 }}>Margin to Crop (Points)</label>
                    <input
                        name="margin"
                        type="number"
                        placeholder="e.g. 20"
                        min="0"
                        defaultValue="20"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 5 }}>
                        1 inch ≈ 72 points. This trims from Top, Bottom, Left, and Right.
                    </p>
                </div>
            }
        />
    );
}
