"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ToolCard from '@/components/ui/ToolCard';
import {
    FileStack,
    Scissors,
    RotateCw,
    Image as ImageIcon,
    FileType,
    Shield,
    Unlock,
    Scan,
    Minimize2,
    Video,
    Hash,
    PenTool
} from 'lucide-react';

interface Tool {
    title: string;
    description: string;
    icon: any;
    href: string;
    color?: string;
    badge?: string;
}

export default function HomeTools() {
    const pdfTools = [
        { title: 'Merge PDF', description: 'Combine multiple PDFs into one.', icon: FileStack, href: '/tools/merge-pdf', color: '#FF5252' },
        { title: 'Split PDF', description: 'Separate PDF pages.', icon: Scissors, href: '/tools/split-pdf', color: '#FF4081' },
        { title: 'Remove Pages', description: 'Delete unwanted pages.', icon: Minimize2, href: '/tools/remove-pages', color: '#ef4444' },
        { title: 'Extract Pages', description: 'Save specific pages.', icon: FileType, href: '/tools/extract-pages', color: '#8b5cf6' },
        { title: 'Organize PDF', description: 'Reorder and manage pages.', icon: FileStack, href: '/tools/organize-pdf', color: '#f59e0b' },
        { title: 'Compress PDF', description: 'Reduce file size.', icon: Minimize2, href: '/tools/compress-pdf', color: '#10b981' },
        { title: 'Repair PDF', description: 'Recover broken PDFs.', icon: Shield, href: '/tools/repair-pdf', color: '#6366f1' },
        { title: 'Rotate PDF', description: 'Rotate pages permanently.', icon: RotateCw, href: '/tools/rotate-pdf', color: '#7C4DFF' },
        { title: 'Watermark', description: 'Add text overlay.', icon: FileType, href: '/tools/watermark-pdf', color: '#ec4899' },
        { title: 'Protect PDF', description: 'Encrypt with password.', icon: Shield, href: '/tools/protect-pdf', color: '#3D5AFE' },
        { title: 'Unlock PDF', description: 'Remove password.', icon: Unlock, href: '/tools/unlock-pdf', color: '#F44336' },
    ];

    const converterTools = [
        { title: 'Image to PDF', description: 'JPG/PNG to PDF.', icon: ImageIcon, href: '/tools/image-to-pdf', color: '#00B0FF' },
        { title: 'Office to PDF', description: 'Word/Excel to PDF.', icon: FileType, href: '/tools/office-to-pdf', color: '#FFC107' },
        { title: 'Scan to PDF', description: 'OCR images to text.', icon: Scan, href: '/tools/scan-pdf', color: '#607D8B' },
        { title: 'PDF to Image', description: 'Save as high-res JPG.', icon: ImageIcon, href: '/tools/pdf-to-image', color: '#00E676' },
        { title: 'PDF to Word', description: 'Convert to DOCX.', icon: FileType, href: '/tools/pdf-to-word', color: '#3b82f6' },
        { title: 'PDF to Excel', description: 'Convert to XLSX.', icon: FileType, href: '/tools/pdf-to-excel', color: '#22c55e' },
        { title: 'PDF to PPT', description: 'Convert to PowerPoint.', icon: FileType, href: '/tools/pdf-to-ppt', color: '#f97316' },
    ];

    const imageTools = [
        { title: 'Compress Image', description: 'Reduce image size.', icon: Minimize2, href: '/tools/compress-image', color: '#448AFF' },
        { title: 'Resize Image', description: 'Change dimensions.', icon: Minimize2, href: '/tools/resize-image', color: '#795548' },
        { title: 'Convert Image', description: 'Change format.', icon: ImageIcon, href: '/tools/convert-image', color: '#009688' },
        { title: 'PNG to SVG', description: 'Vectorize images.', icon: Scan, href: '/tools/png-to-svg', color: '#FF5722' },
    ];

    const advancedTools = [
        { title: 'Add Page Numbers', description: 'Insert page numbers.', icon: Hash, href: '/tools/page-numbers' },
        { title: 'Sign PDF', description: 'Add digital signatures.', icon: PenTool, href: '/tools/sign-pdf', badge: 'Edit & Security' },
        { title: 'Crop PDF', description: 'Trim margins.', icon: Scissors, href: '/tools/crop-pdf', color: '#8BC34A' },
    ];

    const videoTools = [
        { title: 'Video to GIF', description: 'Convert MP4 to GIF.', icon: Video, href: '/tools/video-to-gif', color: '#E91E63' },
        { title: 'GIF Maker', description: 'Images to GIF.', icon: ImageIcon, href: '/tools/gif-maker', color: '#9C27B0' },
    ];

    const [searchQuery, setSearchQuery] = useState('');

    const filterTools = (tools: Tool[]) => {
        if (!searchQuery) return tools;
        const lowerQuery = searchQuery.toLowerCase();
        return tools.filter(tool =>
            tool.title.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery)
        );
    };

    const filteredPdf = filterTools(pdfTools);
    const filteredConverter = filterTools(converterTools);
    const filteredImage = filterTools(imageTools);
    const filteredAdvanced = filterTools(advancedTools);
    const filteredVideo = filterTools(videoTools);

    const hasResults = filteredPdf.length > 0 || filteredConverter.length > 0 || filteredImage.length > 0 || filteredAdvanced.length > 0 || filteredVideo.length > 0;

    return (
        <div>
            {/* Search Bar */}
            <div style={{ maxWidth: 600, margin: '0 auto 60px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search for tools (e.g. 'Merge', 'Compress', 'PDF to Word')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 20px 16px 50px',
                        fontSize: '1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '30px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        outline: 'none',
                        transition: 'box-shadow 0.2s, border-color 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.1)';
                        e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                        e.target.style.borderColor = '#e2e8f0';
                    }}
                />
            </div>

            {!hasResults && (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    <p>No tools found matching "{searchQuery}". Try a different term.</p>
                </div>
            )}

            {filteredPdf.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>PDF Tools</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {filteredPdf.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                </div>
            )}

            {filteredConverter.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>Converters</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {filteredConverter.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                </div>
            )}

            {filteredImage.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>Image Tools</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {filteredImage.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                </div>
            )}

            {filteredAdvanced.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>Advanced Tools (Local & Private)</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {filteredAdvanced.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                </div>
            )}

            {filteredVideo.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>GIF & Video Tools</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {filteredVideo.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
