"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import ToolCard from '@/components/ui/ToolCard';
import { allTools } from '@/lib/toolsData';

export default function ToolsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const pdfTools = allTools.filter(t => t.category === 'PDF');
    const converterTools = allTools.filter(t => t.category === 'Converter');
    const imageTools = allTools.filter(t => t.category === 'Image');
    const videoTools = allTools.filter(t => t.category === 'Video');
    const advancedTools = allTools.filter(t => t.category === 'Advanced');

    // Filter logic
    const filterTools = (tools: any[]) => {
        if (!searchTerm) return tools;
        const q = searchTerm.toLowerCase();
        return tools.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        );
    };

    const sections = [
        { title: 'PDF Tools', tools: filterTools(pdfTools) },
        { title: 'Converters', tools: filterTools(converterTools) },
        { title: 'Image Tools', tools: filterTools(imageTools) },
        { title: 'Video & GIF', tools: filterTools(videoTools) },
        { title: 'Advanced Tools', tools: filterTools(advancedTools) },
    ];

    const hasResults = sections.some(s => s.tools.length > 0);

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
                <Link href="/" style={{
                    position: 'absolute', left: 0, top: 0,
                    display: 'flex', alignItems: 'center', gap: 8,
                    textDecoration: 'none', color: '#666', fontWeight: 500,
                    fontSize: '0.9rem'
                }}>
                    <ArrowLeft size={16} /> Back
                </Link>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    PDF & Image Tools
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, margin: '0 auto 30px' }}>
                    Secure, private, and local-first document processing tools.
                    <br />
                    No server uploads. 100% Client-side.
                </p>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
                    <input
                        type="text"
                        placeholder="Search tools (e.g. 'Merge', 'Compress')..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px 50px',
                            fontSize: '1.1rem',
                            borderRadius: '50px',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            outline: 'none'
                        }}
                    />
                    <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                        <Search size={20} />
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div style={{ display: 'grid', gap: '60px' }}>
                {sections.map((section, idx) => {
                    if (section.tools.length === 0) return null;
                    return (
                        <div key={idx}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>
                                {section.title}
                            </h2>
                            <div className="grid grid-cols-4" style={{ gap: 20 }}>
                                {section.tools.map((tool, i) => (
                                    <ToolCard key={i} {...tool} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {!hasResults && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <p>No tools found matching "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
}
