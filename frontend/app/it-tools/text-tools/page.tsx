"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Type, Check, Copy } from 'lucide-react';
import { textToNato, textToBinary, binaryToText, textToUnicode, unicodeToText } from './utils';
import { useSearchParams } from 'next/navigation';

function TextToolsContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'nato' | 'binary' | 'unicode'>('nato');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'binary' || tab === 'unicode' || tab === 'nato') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // State for NATO
    const [natoInput, setNatoInput] = useState('Hello World');

    // State for Binary
    const [binaryTextInput, setBinaryTextInput] = useState('Hello');
    const [binaryInput, setBinaryInput] = useState('');

    // State for Unicode
    const [unicodeTextInput, setUnicodeTextInput] = useState('Hello');
    const [unicodeInput, setUnicodeInput] = useState('');

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
            title="Text Converters"
            description="Convert text to NATO Alphabet, ASCII Binary, or Unicode."
            icon={Type}
        >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('nato')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'nato' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'nato' ? 600 : 400,
                        color: activeTab === 'nato' ? 'var(--primary)' : '#666'
                    }}
                >
                    NATO Alphabet
                </button>
                <button
                    onClick={() => setActiveTab('binary')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'binary' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'binary' ? 600 : 400,
                        color: activeTab === 'binary' ? 'var(--primary)' : '#666'
                    }}
                >
                    ASCII Binary
                </button>
                <button
                    onClick={() => setActiveTab('unicode')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'unicode' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'unicode' ? 600 : 400,
                        color: activeTab === 'unicode' ? 'var(--primary)' : '#666'
                    }}
                >
                    Unicode
                </button>
            </div>

            {/* NATO Tab */}
            {activeTab === 'nato' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Text to NATO</h3>
                    <textarea
                        value={natoInput}
                        onChange={(e) => setNatoInput(e.target.value)}
                        placeholder="Enter text..."
                        rows={3}
                        style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8 }}
                    />
                    <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8, margin: '10px 0', fontFamily: 'monospace' }}>
                        {textToNato(natoInput)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CopyButton text={textToNato(natoInput)} />
                    </div>
                </div>
            )}

            {/* Binary Tab */}
            {activeTab === 'binary' && (
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Text to Binary</h3>
                        <textarea
                            value={binaryTextInput}
                            onChange={(e) => setBinaryTextInput(e.target.value)}
                            placeholder="Enter text..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8 }}
                        />
                        <textarea
                            readOnly
                            value={textToBinary(binaryTextInput)}
                            placeholder="Binary output..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#fbfbfb', fontFamily: 'monospace' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <CopyButton text={textToBinary(binaryTextInput)} />
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Binary to Text</h3>
                        <textarea
                            value={binaryInput}
                            onChange={(e) => setBinaryInput(e.target.value)}
                            placeholder="Enter binary (01001000...)"
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace' }}
                        />
                        <textarea
                            readOnly
                            value={binaryToText(binaryInput)}
                            placeholder="Text output..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#fbfbfb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <CopyButton text={binaryToText(binaryInput)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Unicode Tab */}
            {activeTab === 'unicode' && (
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Text to Unicode</h3>
                        <textarea
                            value={unicodeTextInput}
                            onChange={(e) => setUnicodeTextInput(e.target.value)}
                            placeholder="Enter text..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8 }}
                        />
                        <textarea
                            readOnly
                            value={textToUnicode(unicodeTextInput)}
                            placeholder="Unicode output..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#fbfbfb', fontFamily: 'monospace' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <CopyButton text={textToUnicode(unicodeTextInput)} />
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Unicode to Text</h3>
                        <textarea
                            value={unicodeInput}
                            onChange={(e) => setUnicodeInput(e.target.value)}
                            placeholder="Enter unicode (&#72;...)"
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, fontFamily: 'monospace' }}
                        />
                        <textarea
                            readOnly
                            value={unicodeToText(unicodeInput)}
                            placeholder="Text output..."
                            rows={4}
                            style={{ width: '100%', padding: 10, margin: '10px 0', border: '1px solid #ddd', borderRadius: 8, background: '#fbfbfb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <CopyButton text={unicodeToText(unicodeInput)} />
                        </div>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}

export default function TextTools() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TextToolsContent />
        </Suspense>
    );
}
