"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Link, Copy, Check, ArrowRightLeft } from 'lucide-react';

export default function UrlParser() {
    const [urlInput, setUrlInput] = useState('https://example.com/path?query=123');
    const [parsed, setParsed] = useState<any>(null);
    const [encoded, setEncoded] = useState('');
    const [decoded, setDecoded] = useState('');

    // Parser Logic
    useEffect(() => {
        try {
            if (!urlInput.trim()) {
                setParsed(null);
                return;
            }
            const u = new URL(urlInput);
            const params: Record<string, string> = {};
            u.searchParams.forEach((val, key) => {
                params[key] = val;
            });

            setParsed({
                protocol: u.protocol,
                host: u.host,
                hostname: u.hostname,
                port: u.port,
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
                params
            });
        } catch {
            setParsed(null);
        }
    }, [urlInput]);

    // Encoder/Decoder Logic
    const [codecInput, setCodecInput] = useState('Hello World 123!');

    useEffect(() => {
        try {
            setEncoded(encodeURIComponent(codecInput));
            setDecoded(decodeURIComponent(codecInput));
        } catch {
            // ignore
        }
    }, [codecInput]);


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
                    padding: '2px 6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#2196F3'
                }}
                title="Copy"
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        );
    };

    return (
        <ToolLayout
            title="URL Tools"
            description="Parse URLs into components and Encode/Decode URI strings."
            icon={Link}
        >
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 30 }}>

                {/* Visual Parser */}
                <div className="card" style={{ padding: 20 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: 15 }}>URL Parser</h2>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 20 }}
                    />

                    {parsed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div className="parsed-row">
                                <strong>Protocol:</strong> <code>{parsed.protocol}</code>
                            </div>
                            <div className="parsed-row">
                                <strong>Host:</strong> <code>{parsed.host}</code>
                            </div>
                            <div className="parsed-row">
                                <strong>Path:</strong> <code>{parsed.pathname}</code>
                            </div>
                            {Object.keys(parsed.params).length > 0 && (
                                <div style={{ marginTop: 10 }}>
                                    <strong>Query Params:</strong>
                                    <div style={{ background: '#f8f9fa', borderRadius: 6, padding: 10, marginTop: 5 }}>
                                        {Object.entries(parsed.params).map(([k, v]: any) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 4 }}>
                                                <span style={{ color: '#666' }}>{k}:</span>
                                                <span style={{ fontFamily: 'monospace' }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#999', fontStyle: 'italic' }}>Enter a valid URL to parse</div>
                    )}
                </div>

                {/* Encoder / Decoder */}
                <div className="card" style={{ padding: 20 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: 0, marginBottom: 15 }}>Encoder / Decoder</h2>
                    <textarea
                        value={codecInput}
                        onChange={(e) => setCodecInput(e.target.value)}
                        placeholder="Text to processing..."
                        rows={3}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 20 }}
                    />

                    <div style={{ marginBottom: 15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 5 }}>
                            <span>Encoded (URL Safe)</span>
                            <CopyButton text={encoded} />
                        </div>
                        <div style={{ background: '#f0f4f8', padding: 10, borderRadius: 6, wordBreak: 'break-all', fontSize: '0.9rem', color: '#333' }}>
                            {encoded || '...'}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 5 }}>
                            <span>Decoded</span>
                            <CopyButton text={decoded} />
                        </div>
                        <div style={{ background: '#f0f4f8', padding: 10, borderRadius: 6, wordBreak: 'break-all', fontSize: '0.9rem', color: '#333' }}>
                            {decoded || '...'}
                        </div>
                    </div>
                </div>

            </div>
            <style jsx>{`
                .parsed-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                code {
                    background: #eee;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }
            `}</style>
        </ToolLayout>
    );
}
