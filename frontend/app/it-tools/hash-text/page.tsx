"use client";

import React, { useState, useEffect } from 'react';
import { FileDigit, Copy, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import CryptoJS from 'crypto-js';

export default function HashText() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState<string | null>(null);

    const algorithms = [
        { name: 'MD5', func: CryptoJS.MD5 },
        { name: 'SHA1', func: CryptoJS.SHA1 },
        { name: 'SHA256', func: CryptoJS.SHA256 },
        { name: 'SHA512', func: CryptoJS.SHA512 },
        { name: 'SHA224', func: CryptoJS.SHA224 },
        { name: 'SHA384', func: CryptoJS.SHA384 },
        { name: 'SHA3', func: CryptoJS.SHA3 },
        { name: 'RIPEMD160', func: CryptoJS.RIPEMD160 },
    ];

    useEffect(() => {
        const newHashes: Record<string, string> = {};
        algorithms.forEach(algo => {
            try {
                newHashes[algo.name] = algo.func(input).toString();
            } catch (e) {
                newHashes[algo.name] = 'Error';
            }
        });
        setHashes(newHashes);
    }, [input]);

    const handleCopy = (text: string, algoName: string) => {
        navigator.clipboard.writeText(text);
        setCopied(algoName);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="Hash Text"
            description="Calculate MD5, SHA1, SHA256, and other hashes from text."
            icon={FileDigit}
        >
            <div style={{ display: 'grid', gap: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>Plaintext Input</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type text to hash here..."
                        style={{
                            width: '100%',
                            height: '120px',
                            padding: '15px',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            resize: 'vertical',
                            fontSize: '1rem',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {algorithms.map(algo => (
                        <div key={algo.name} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#555' }}>{algo.name}</span>
                                <button
                                    onClick={() => handleCopy(hashes[algo.name], algo.name)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '0.8rem',
                                        color: copied === algo.name ? 'green' : '#666'
                                    }}
                                >
                                    {copied === algo.name ? <Check size={14} /> : <Copy size={14} />}
                                    {copied === algo.name ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <div style={{
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                fontSize: '0.9rem',
                                color: '#333'
                            }}>
                                {hashes[algo.name] || '...'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ToolLayout>
    );
}
