"use client";

import React, { use } from 'react';
import ToolInterface from '@/components/ToolInterface';
import { notFound } from 'next/navigation';

// Tool Configuration
const TOOLS_CONFIG: any = {
    'merge-pdf': {
        title: 'Merge PDF',
        description: 'Combine multiple PDF files into one.',
        accept: '.pdf',
        multiple: true,
        resultFileName: 'merged.pdf',
        apiEndpoint: '/pdf/merge'
    },
    'split-pdf': {
        title: 'Split PDF',
        description: 'Separate PDF pages or extract a range.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'split.pdf',
        apiEndpoint: '/pdf/split',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Page Range (e.g. 1-5, 8, all)</label>
                <input
                    name="pages"
                    type="text"
                    defaultValue="all"
                    placeholder="all"
                    className="form-input"
                    style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
            </div>
        )
    },
    'rotate-pdf': {
        title: 'Rotate PDF',
        description: 'Rotate PDF pages.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'rotated.pdf',
        apiEndpoint: '/pdf/rotate',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Rotation Angle</label>
                <select name="angle" style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}>
                    <option value="90">90 Degrees Clockwise</option>
                    <option value="180">180 Degrees</option>
                    <option value="270">270 Degrees Clockwise</option>
                </select>
            </div>
        )
    },
    'compress-image': {
        title: 'Compress Image',
        description: 'Optimize images to reduce file size.',
        accept: 'image/*',
        multiple: false,
        resultFileName: 'compressed.jpg',
        apiEndpoint: '/images/compress',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Quality (1-100)</label>
                <input name="quality" type="range" min="10" max="100" defaultValue="60" style={{ width: '100%' }} />
            </div>
        )
    },
    'image-to-pdf': {
        title: 'Image to PDF',
        description: 'Convert images to a single PDF document.',
        accept: 'image/*',
        multiple: true,
        resultFileName: 'images.pdf',
        apiEndpoint: '/convert/image-to-pdf'
    },
    'pdf-to-image': {
        title: 'PDF to Image',
        description: 'Convert PDF pages to image files.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'images.zip', // or png
        apiEndpoint: '/convert/pdf-to-image',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Format</label>
                <select name="fmt" style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                </select>
            </div>
        )
    },
    'office-to-pdf': {
        title: 'Office to PDF',
        description: 'Convert Word, Excel, PowerPoint to PDF.',
        accept: '.docx,.xlsx,.pptx,.doc,.xls,.ppt',
        multiple: false,
        resultFileName: 'converted.pdf',
        apiEndpoint: '/convert/office-to-pdf'
    },
    'protect-pdf': {
        title: 'Protect PDF',
        description: 'Add a password to your PDF.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'protected.pdf',
        apiEndpoint: '/security/protect',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
            </div>
        )
    },
    'unlock-pdf': {
        title: 'Unlock PDF',
        description: 'Remove password from a PDF.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'unlocked.pdf',
        apiEndpoint: '/security/unlock',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Current Password</label>
                <input
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}
                />
            </div>
        )
    },
    'scan-pdf': {
        title: 'Scan to PDF (OCR)',
        description: 'Make a scanned PDF searchable.',
        accept: '.pdf',
        multiple: false,
        resultFileName: 'searchable.pdf',
        apiEndpoint: '/ocr/scan-to-pdf',
        optionsComponent: (
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Language</label>
                <select name="lang" style={{ width: '100%', padding: '10px', borderRadius: 4, border: '1px solid #ddd' }}>
                    <option value="eng">English</option>
                    <option value="deu">German</option>
                    <option value="fra">French</option>
                    <option value="spa">Spanish</option>
                </select>
            </div>
        )
    }
};

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
    // Unwrapping params Promise (Next.js 15+ change, just to be safe with 14 app router types in strict mode)
    // Actually Next 14 params are not promises usually, but let's handle it if strict. 
    // Wait, in standard 14, params is object. In 15 it's promise.
    // The 'use' hook is for promises. 
    // Let's assume standard Next 14 props handling.
    // "params: { tool: string }"

    // Correction: params is just an object.
    const { tool } = use(params);

    const config = TOOLS_CONFIG[tool];

    if (!config) {
        notFound();
    }

    const handleProcess = async (files: File[], options: any) => {
        const formData = new FormData();
        files.forEach(f => formData.append('file', f)); // Backend expects 'file' or 'files'
        // Update: Backend expects 'files' list for bulk, 'file' for single. 
        // My backend is consistent for bulk ('files') on merge/image-to-pdf? 
        // Merge: 'files'. Split: 'file'. 
        // I need to adjust logic based on 'multiple'.

        // Fix logic:
        if (config.multiple) {
            // Clear previous 'file' appends if any (from loop above - oh wait FormData accumulates)
            // Actually: 
            formData.delete('file');
            files.forEach(f => formData.append('files', f));
        } else {
            formData.delete('file');
            formData.append('file', files[0]);
        }

        // Append options
        Object.keys(options).forEach(key => {
            formData.append(key, options[key]);
        });

        // Default to relative /api path which works with Next.js Rewrites (both local and prod)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}${config.apiEndpoint}`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(errorData.detail || 'Processing failed');
        }

        return await res.blob();
    };

    return (
        <ToolInterface
            {...config}
            onProcess={handleProcess}
        />
    );
}
