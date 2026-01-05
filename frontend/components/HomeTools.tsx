"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Terminal, ArrowRight } from 'lucide-react';
import ToolCard from '@/components/ui/ToolCard';
import { allTools } from '@/lib/toolsData';

export default function HomeTools() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';

    const getToolsByCategory = (cat: string) => allTools.filter(t =>
        t.category === cat &&
        (t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
    );

    const pdfTools = getToolsByCategory('PDF');
    const converterTools = getToolsByCategory('Converter');
    const imageTools = getToolsByCategory('Image');
    const videoTools = getToolsByCategory('Video');
    const itTools = getToolsByCategory('IT'); // Was 'IT' in page.tsx? Checking logic. Yes 'IT'.
    const advancedTools = getToolsByCategory('Advanced');

    return (
        <div className="container" style={{ padding: '10px 20px 60px' }}>

            {/* PDF Tools */}
            {pdfTools.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>PDF Tools</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {pdfTools.map((tool, i) => <ToolCard key={`pdf-${i}`} {...tool} />)}
                    </div>
                </div>
            )}

            {/* Converters */}
            {converterTools.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>Converters</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {converterTools.map((tool, i) => <ToolCard key={`conv-${i}`} {...tool} />)}
                    </div>
                </div>
            )}

            {/* Image & Video */}
            {(imageTools.length + videoTools.length) > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>Image & Video</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {[...imageTools, ...videoTools].map((tool, i) => <ToolCard key={`img-${i}`} {...tool} />)}
                    </div>
                </div>
            )}

            {/* IT & Developer Tools */}
            {itTools.length > 0 && (
                <div style={{ marginBottom: 60 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>IT & Developer Tools</h2>
                    <div className="grid grid-cols-4" style={{ gap: 20 }}>
                        {itTools.map((tool, i) => <ToolCard key={`it-${i}`} {...tool} />)}
                    </div>
                </div>
            )}

            {/* Two Main Cards (Moved to Bottom) */}
            {!query && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, width: '100%', marginTop: 80, paddingBottom: 60 }}>

                    {/* PDF & Image Card */}
                    <Link href="/tools" className="group" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: 40,
                            borderRadius: 24,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            textAlign: 'left',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{
                                width: 64, height: 64,
                                background: '#eff6ff',
                                borderRadius: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 24,
                                color: '#2563eb'
                            }}>
                                <FileText size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>PDF & Media Tools</h2>
                            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                                Merge, Compress, Edit, and Convert documents.
                                Powerful WebAssembly engine runs directly in your browser.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 600 }}>
                                Explore Tools <ArrowRight size={18} />
                            </div>
                        </div>
                    </Link>

                    {/* IT & Dev Card */}
                    <Link href="/it-tools" className="group" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: 40,
                            borderRadius: 24,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            textAlign: 'left',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = '#7c3aed';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div style={{
                                width: 64, height: 64,
                                background: '#f5f3ff',
                                borderRadius: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 24,
                                color: '#7c3aed'
                            }}>
                                <Terminal size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>IT & Dev Tools</h2>
                            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                                Regex, JSON, Base64, Hashing.
                                Essential utilities for developers. Client-side execution.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontWeight: 600 }}>
                                Launch Developer Hub <ArrowRight size={18} />
                            </div>
                        </div>
                    </Link>

                </div>
            )}
        </div>
    );
}
