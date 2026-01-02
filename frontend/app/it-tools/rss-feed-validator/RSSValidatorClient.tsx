'use client';

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Rss, CheckCircle, XCircle, AlertTriangle, Globe, FileText, ChevronRight, Activity } from 'lucide-react';



export default function RSSFeedValidator() {
    const [inputMode, setInputMode] = useState<'url' | 'content'>('url');
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        if (inputMode === 'url') {
            formData.append('url', url);
        } else {
            formData.append('content', content);
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
            const res = await fetch(`${apiBase}/web/rss-validate`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to validate feed');
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while validating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolLayout
            title="RSS Feed Validator"
            description="Validate RSS and Atom feeds. Check syntax and compatibility with standard readers."
            icon={Rss}
        >
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Mode Switcher */}
                <div style={{ display: 'flex', marginBottom: '25px', background: '#f5f5f7', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setInputMode('url')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: inputMode === 'url' ? 'white' : 'transparent',
                            color: inputMode === 'url' ? 'var(--primary)' : '#666',
                            fontWeight: 600,
                            boxShadow: inputMode === 'url' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Globe size={16} /> Validate by URL
                    </button>
                    <button
                        onClick={() => setInputMode('content')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: inputMode === 'content' ? 'white' : 'transparent',
                            color: inputMode === 'content' ? 'var(--primary)' : '#666',
                            fontWeight: 600,
                            boxShadow: inputMode === 'content' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileText size={16} /> Direct Input
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {inputMode === 'url' ? (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Feed URL</label>
                            <div style={{ position: 'relative' }}>
                                <Rss size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com/feed.xml"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>XML Content</label>
                            <textarea
                                required
                                rows={10}
                                placeholder="<?xml version='1.0' encoding='UTF-8'?>..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    minHeight: '200px'
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '16px',
                            gap: '8px',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? <Activity className="animate-spin" /> : <><ChevronRight size={20} /> Check Feed</>}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '25px', padding: '15px', background: '#ffebee', borderRadius: '8px', border: '1px solid #ffcdd2', color: '#c62828', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <XCircle size={20} style={{ marginTop: '2px' }} />
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>Validation Error</strong>
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {result && (
                <div className="card" style={{ maxWidth: '800px', margin: '30px auto 0', padding: '0', overflow: 'hidden' }}>
                    <div style={{
                        padding: '25px',
                        background: result.valid ? 'linear-gradient(to right, #e8f5e9, #f1f8e9)' : 'linear-gradient(to right, #ffebee, #ffcdd2)',
                        borderBottom: result.valid ? '1px solid #c8e6c9' : '1px solid #ef9a9a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        {result.valid ? <CheckCircle size={32} color="#2e7d32" /> : <XCircle size={32} color="#c62828" />}
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', color: result.valid ? '#1b5e20' : '#b71c1c' }}>
                                {result.valid ? 'Feed is Valid' : 'Feed is Invalid'}
                            </h3>
                            <p style={{ margin: '5px 0 0', color: result.valid ? '#2e7d32' : '#c62828' }}>
                                {result.title || 'Untitled Feed'}
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '15px' }}>Statistics</h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Format</span>
                                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{result.version || 'Unknown'}</span>
                                </div>
                                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Items</span>
                                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{result.entries_count}</span>
                                </div>
                            </div>

                            {!result.valid && (result.version === 'Unknown' || result.entries_count === 0) && (
                                <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', color: '#1565c0', fontSize: '14px', lineHeight: 1.5 }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}><Info size={16} /> Note:</strong>
                                    If you are testing a <code>sitemap.xml</code>, please note that Sitemaps are NOT RSS feeds. They use a completely different protocol.
                                </div>
                            )}
                        </div>

                        <div>
                            {result.errors && result.errors.length > 0 ? (
                                <div>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#d32f2f', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertTriangle size={14} /> Critical Issues
                                    </h4>
                                    <div style={{ background: '#ffebee', borderRadius: '8px', padding: '15px' }}>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#b71c1c', fontSize: '14px' }}>
                                            {result.errors.map((err: string, i: number) => (
                                                <li key={i} style={{ marginBottom: '8px' }}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#2e7d32', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <ShieldCheck size={14} /> Status
                                    </h4>
                                    <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '15px', color: '#2e7d32', fontSize: '14px' }}>
                                        No critical errors found in this feed.
                                    </div>
                                </div>
                            )}

                            {result.description && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '10px' }}>Description</h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
                                        {result.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}

// Icons
function Info({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;
}
function ShieldCheck({ size }: { size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
}
