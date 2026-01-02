"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Code, Copy, Check } from 'lucide-react';

export default function HtmlTools() {
    const [input, setInput] = useState('<div class="example">Hello & Welcome</div>');

    // Escape standard HTML entities
    const escapeHtml = (text: string) => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Unescape standard HTML entities
    const unescapeHtml = (text: string) => {
        return text
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&");
    };

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            if (!text) return;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={copy}
                disabled={!text}
                style={{
                    padding: '8px 16px',
                    background: !text ? '#ccc' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: !text ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.9rem'
                }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        );
    };

    return (
        <ToolLayout
            title="HTML Entity Tools"
            description="Escape or Unescape HTML entities (special characters)."
            icon={Code}
        >
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                {/* Input */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Input</h3>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter text..."
                        rows={10}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                </div>

                {/* Outputs */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Escaped */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <strong>Escaped (Safe for HTML)</strong>
                            <CopyButton text={escapeHtml(input)} />
                        </div>
                        <textarea
                            readOnly
                            value={escapeHtml(input)}
                            rows={4}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', background: '#f8f9fa', fontFamily: 'monospace' }}
                        />
                    </div>

                    {/* Unescaped */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <strong>Unescaped (Raw Characters)</strong>
                            <CopyButton text={unescapeHtml(input)} />
                        </div>
                        <textarea
                            readOnly
                            value={unescapeHtml(input)}
                            rows={4}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', background: '#f8f9fa', fontFamily: 'monospace' }}
                        />
                    </div>

                </div>
            </div>
        </ToolLayout>
    );
}
