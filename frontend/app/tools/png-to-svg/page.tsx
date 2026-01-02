'use client';

import ToolInterface from '@/components/ToolInterface';
import { Image as ImageIcon } from 'lucide-react';

export default function PngToSvgTool() {
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

        // Call Wasm
        const svgString = wasm.bitmap_to_svg(bytes);

        // Return Blob
        return new Blob([svgString], { type: 'image/svg+xml' });
    };

    return (
        <ToolInterface
            title="PNG to SVG"
            description="Convert raster images to Vector SVG instantly in browser."
            accept="image/*"
            onProcess={processFile}
            resultFileName="vectorized.svg"
            processingMode="client"
            icon={ImageIcon}
        />
    );
}
