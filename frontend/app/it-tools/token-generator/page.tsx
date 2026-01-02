"use client";

import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, Settings2 } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

export default function TokenGenerator() {
    const [token, setToken] = useState('');
    const [length, setLength] = useState(64);
    const [uppercase, setUppercase] = useState(true);
    const [lowercase, setLowercase] = useState(true);
    const [numbers, setNumbers] = useState(true);
    const [symbols, setSymbols] = useState(false);
    const [copied, setCopied] = useState(false);

    const CHARSETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const generateToken = () => {
        let chars = '';
        if (uppercase) chars += CHARSETS.uppercase;
        if (lowercase) chars += CHARSETS.lowercase;
        if (numbers) chars += CHARSETS.numbers;
        if (symbols) chars += CHARSETS.symbols;

        if (!chars) {
            setToken("Please select at least one character type");
            return;
        }

        let result = '';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            result += chars.charAt(randomValues[i] % chars.length);
        }
        setToken(result);
    };

    useEffect(() => {
        generateToken();
    }, [length, uppercase, lowercase, numbers, symbols]);

    const handleCopy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Token Generator"
            description="Generate secure random strings, secrets, and API keys."
            icon={Key}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration */}
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px' }}>
                        <Settings2 size={20} className="text-secondary" /> Configuration
                    </h2>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                            Length: <span style={{ color: 'var(--primary)' }}>{length}</span> characters
                        </label>
                        <input
                            type="range"
                            min="8"
                            max="256"
                            value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={uppercase}
                                onChange={(e) => setUppercase(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span>Uppercase (A-Z)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={lowercase}
                                onChange={(e) => setLowercase(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span>Lowercase (a-z)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={numbers}
                                onChange={(e) => setNumbers(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span>Numbers (0-9)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={symbols}
                                onChange={(e) => setSymbols(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span>Symbols (!@#$)</span>
                        </label>
                    </div>
                </div>

                {/* Output */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Generated Token</h2>
                        <button
                            onClick={generateToken}
                            title="Regenerate"
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                border: '1px solid #e0e0e0',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={token}
                            readOnly
                            style={{
                                width: '100%',
                                height: '200px',
                                padding: '15px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                resize: 'none',
                                background: '#fafafa',
                                wordBreak: 'break-all',
                                lineHeight: '1.6',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleCopy}
                            style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '15px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background: copied ? '#e8f5e9' : 'var(--primary)',
                                color: copied ? '#2e7d32' : '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
