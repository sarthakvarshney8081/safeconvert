"use client";

import React, { useState } from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function OrganizePdfTool() {
    const [pageOrder, setPageOrder] = useState<string>("");

    const handleProcess = async (files: File[], options: any) => {
        const wasm = await import(/* webpackIgnore: true */ '/wasm/safeconvert_wasm.js');
        await wasm.default();

        if (files.length === 0) throw new Error("No file selected");
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfBytes = new Uint8Array(arrayBuffer);

        // Parse page order string "1,3,2" -> [1, 3, 2]
        // If empty, just return original? Or maybe reverse?
        // For now, let's implement a simple reverse if no order provided, 
        // OR better: Assume the user wants to just save it (maybe they used a UI that isn't here yet).
        // Let's make it a "Reverse PDF" for now if no input, or require input.

        let order: Uint32Array;
        if (pageOrder.trim()) {
            const parts = pageOrder.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            order = new Uint32Array(parts);
        } else {
            // Default: Reverse? Or just identity?
            // Let's throw error to prompt input
            throw new Error("Please enter page order (e.g., 1,3,2)");
        }

        const resultBytes = wasm.reorder_pages(pdfBytes, order);
        return new Blob([resultBytes as any], { type: 'application/pdf' });
    };

    return (
        <ToolInterface
            title="Organize PDF"
            description="Reorder pages in your PDF document."
            accept=".pdf"
            onProcess={handleProcess}
            resultFileName="organized.pdf"
            optionsComponent={
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Page Order (comma separated):</label>
                    <input
                        type="text"
                        placeholder="e.g. 1, 3, 2, 4"
                        value={pageOrder}
                        onChange={(e) => setPageOrder(e.target.value)}
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 5 }}>
                        Enter the page numbers in the desired order.
                    </p>
                </div>
            }
        />
    );
}
