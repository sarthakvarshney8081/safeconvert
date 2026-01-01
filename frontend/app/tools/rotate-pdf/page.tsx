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
                '/wasm/safeconvert_wasm.js'
            );

            await wasmModule.default(); // init() function is default export for 'web' target usually
            // but check wasm-pack output. usually `target web` has strict init.
            // Let's assume standard wasm-pack. 
            // Actually, usually it exports `default` as init function.

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const resultBytes = wasmModule.rotate_pdf(uint8Array, angle, -1);

            return new Blob([resultBytes], { type: 'application/pdf' });

        } catch (e: any) {
            console.error("Wasm Error:", e);
            throw new Error(`Client-side processing failed: ${e.message}. Ensuring you are running in Docker with Wasm built.`);
        }
    };

    return (
        <ToolInterface
            title="Rotate PDF"
            description="Rotate PDF pages permanently."
            accept=".pdf"
            apiEndpoint=""
            processingMode="client"
            optionsComponent={
                <select name="angle" className="input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}>
                    <option value="90">90° Clockwise</option>
                    <option value="180">180°</option>
                    <option value="270">270° Clockwise</option>
                </select>
            }
            onProcess={processPdf}
        />
    );
}
