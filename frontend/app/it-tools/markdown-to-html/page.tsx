"use client";

import React, { useState, useEffect } from 'react';
import { Code, Copy, Eye, FileCode } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { marked } from 'marked';

export default function MarkdownToHtml() {
    const [markdown, setMarkdown] = useState('# Hello World\n\nThis is **markdown** content.\n\n- Item 1\n- Item 2');
    const [html, setHtml] = useState('');
    const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const result = marked.parse(markdown);
        // marked.parse can return a Promise if async option is true, but default is string
        if (result instanceof Promise) {
            result.then(res => setHtml(res));
        } else {
            setHtml(result);
        }
    }, [markdown]);

    const handleCopy = () => {
        navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Markdown to HTML"
            description="Convert proper Markdown to raw HTML with live preview."
            icon={Code}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 h-[600px]">
                {/* Input */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Markdown Input</label>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        style={{
                            flex: 1,
                            width: '100%',
                            padding: '15px',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            fontFamily: 'monospace',
                            resize: 'none',
                            outline: 'none',
                            fontSize: '0.9rem',
                            lineHeight: '1.6'
                        }}
                        placeholder="Type your markdown here..."
                    />
                </div>

                {/* Output */}
                <div className="lg:mt-0" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '5px', background: '#f5f5f7', padding: '4px', borderRadius: '8px' }}>
                            <button
                                onClick={() => setActiveTab('preview')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: activeTab === 'preview' ? '#fff' : 'transparent',
                                    boxShadow: activeTab === 'preview' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Eye size={14} /> Preview
                            </button>
                            <button
                                onClick={() => setActiveTab('html')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: activeTab === 'html' ? '#fff' : 'transparent',
                                    boxShadow: activeTab === 'html' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FileCode size={14} /> Raw HTML
                            </button>
                        </div>

                        <button
                            onClick={handleCopy}
                            style={{
                                padding: '6px 12px',
                                background: copied ? '#e8f5e9' : '#f5f5f7',
                                color: copied ? '#2e7d32' : '#333',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            {copied ? 'Copied!' : 'Copy HTML'} <Copy size={14} />
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: activeTab === 'preview' ? '#fff' : '#1e1e1e',
                        color: activeTab === 'preview' ? 'inherit' : '#d4d4d4'
                    }}>
                        {activeTab === 'preview' ? (
                            <div
                                className="markdown-preview"
                                style={{ padding: '20px', overflowY: 'auto', height: '100%' }}
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ) : (
                            <textarea
                                readOnly
                                value={html}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    padding: '15px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#d4d4d4',
                                    fontFamily: 'monospace',
                                    resize: 'none',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
