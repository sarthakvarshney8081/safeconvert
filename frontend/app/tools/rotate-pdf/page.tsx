"use client";

import React, { useState, useEffect } from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function RotatePdfTool() {
    // We can't import Wasm statically because it's built in Docker.
    // We load it dynamically from the public folder.

    const processPdf = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file");
        const file = files[0];
        const angle = parseInt(options.angle || "0");

        try {
            // Dynamic import from public/wasm
            // Note: We use a fixed path consistent with Dockerfile output
            // webpackIgnore tells Next.js not to try bundling this at build time
            // @ts-ignore
            const wasmModule = await import(
                /* webpackIgnore: true */
                '/wasm/safeconvert_pdf_wasm.js'
            );

            await wasmModule.default(); // init() function is default export for 'web' target usually
            // but check wasm-pack output. usually `target web` has strict init.
            // Let's assume standard wasm-pack. 
            // Actually, usually it exports `default` as init function.

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const resultBytes = wasmModule.rotate_pdf(uint8Array, angle);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Client-side processing failed: ${e.message}. Ensuring you are running in Docker with Wasm built.`);
        }
    };

    return (
        <ToolInterface
            title="Rotate PDF (Client-Side Wasm)"
            description="Rotate PDF pages instantly in your browser. Private & Fast. (Powered by Rust)"
            accept=".pdf"
            apiEndpoint="" // Not used
            onProcess={processPdf}
            optionsComponent={
                <div>
                    <label style={{ display: 'block', marginBottom: 10 }}>Rotation Angle</label>
                    <select name="angle" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                        <option value="90">90 Degrees Clockwise</option>
                        <option value="180">180 Degrees</option>
                        <option value="270">270 Degrees Clockwise</option>
                    </select>
                </div>
            }
        />
    );
}
