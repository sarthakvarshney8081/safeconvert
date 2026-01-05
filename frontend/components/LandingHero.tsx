"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, Terminal, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { allTools } from '@/lib/toolsData';

export default function LandingHero() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length > 1) {
            const filtered = allTools.filter((t: any) =>
                t.title.toLowerCase().includes(q.toLowerCase()) ||
                t.description.toLowerCase().includes(q.toLowerCase())
            );
            setResults(filtered.slice(0, 5)); // Limit to 5
        } else {
            setResults([]);
        }
    };

    return (
        <div style={{ padding: '140px 20px 60px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>

            {/* Background Decor (Gradients) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', zIndex: -1, background: 'radial-gradient(circle at 50% 10%, #f0f9ff 0%, #fff 100%)' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
            </div>

            {/* Hero Content */}
            <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: 60, animation: 'fadeIn 0.8s ease' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderRadius: 20, fontSize: '0.9rem', marginBottom: 20, fontWeight: 500 }}>
                    <Globe size={16} />
                    <span>Global Privacy-First Platform</span>
                </div>

                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    SafeConverts
                </h1>

                <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
                    Premium PDF and Image tools. 100% Privacy-Focused.
                    <br />
                    No sign-up required.
                </p>
            </div>

            {/* Unified Search Bar */}
            <div style={{ width: '100%', maxWidth: 500, position: 'relative', marginBottom: 60, zIndex: 20 }}>
                <input
                    type="text"
                    placeholder="Search tools (e.g. Merge, JSON, Regex)..."
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={(e) => {
                        setIsFocused(true);
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                        setTimeout(() => setIsFocused(false), 200);
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.borderColor = '#e2e8f0';
                    }}
                    style={{
                        width: '100%',
                        padding: '20px 24px 20px 55px',
                        fontSize: '1.1rem',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        outline: 'none',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                />
                <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={24} />

                {/* Dropdown */}
                {isFocused && searchQuery.length > 1 && results.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderRadius: 16,
                        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
                        padding: 10,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        {results.map((tool, i) => (
                            <Link href={tool.href} key={i} style={{ textDecoration: 'none' }} onClick={() => setSearchQuery('')}>
                                <div style={{
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    transition: 'background 0.1s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ color: tool.color || '#666' }}>
                                        <tool.icon size={20} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{tool.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tool.description}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Cards Moved to Bottom of Page */}

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: 40, marginTop: 80, opacity: 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.9rem' }}>
                    <ShieldCheck size={20} />
                    <span>Secure & Private</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.9rem' }}>
                    <Zap size={20} />
                    <span>Lightning Fast</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.9rem' }}>
                    <Globe size={20} />
                    <span>Browser-Based</span>
                </div>
            </div>
        </div>
    );
}
