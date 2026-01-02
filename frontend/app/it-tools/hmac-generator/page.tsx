"use client";

import React, { useState, useEffect } from 'react';
import { Key, Copy, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import CryptoJS from 'crypto-js';

export default function HMACGenerator() {
    const [input, setInput] = useState('');
    const [secret, setSecret] = useState('');
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState<string | null>(null);

    const algorithms = [
        { name: 'MD5', func: CryptoJS.HmacMD5 },
        { name: 'SHA1', func: CryptoJS.HmacSHA1 },
        { name: 'SHA256', func: CryptoJS.HmacSHA256 },
        { name: 'SHA512', func: CryptoJS.HmacSHA512 },
        { name: 'SHA224', func: CryptoJS.HmacSHA224 },
        { name: 'SHA384', func: CryptoJS.HmacSHA384 },
        { name: 'SHA3', func: CryptoJS.HmacSHA3 },
        { name: 'RIPEMD160', func: CryptoJS.HmacRIPEMD160 },
    ];

    useEffect(() => {
        const newHashes: Record<string, string> = {};
        algorithms.forEach(algo => {
            try {
                newHashes[algo.name] = algo.func(input, secret).toString();
            } catch (e) {
                newHashes[algo.name] = 'Error';
            }
        });
        setHashes(newHashes);
    }, [input, secret]);

    const handleCopy = (text: string, algoName: string) => {
        navigator.clipboard.writeText(text);
        setCopied(algoName);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="HMAC Generator"
            description="Calculate Keyed-Hash Message Authentication Codes (HMAC) using a secret key."
            icon={Key}
        >
            <div style={{ display: 'grid', gap: '30px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                resize: 'none',
                                fontSize: '1rem',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>Secret Key</label>
                        <textarea
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Enter your secret key..."
                            style={{
                                width: '100%',
                                height: '120px',
                                padding: '15px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                resize: 'none',
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                background: '#fff3e0'
                            }}
                        />
                    </div>
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
