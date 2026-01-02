"use client";

import React, { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';

function convertBase(value: string, fromBase: number, toBase: number): string {
    const range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
    const fromRange = range.slice(0, fromBase);
    const toRange = range.slice(0, toBase);

    // Simple validation
    if (value.split('').some(char => !fromRange.includes(char))) {
        return ""; // or throw error
    }

    let decValue = value
        .split('')
        .reverse()
        .reduce((carry: bigint, digit: string, index: number) => {
            return (carry += BigInt(fromRange.indexOf(digit)) * BigInt(fromBase) ** BigInt(index));
        }, BigInt(0));

    let newValue = '';

    if (decValue === BigInt(0)) return '0';

    while (decValue > 0) {
        newValue = toRange[Number(decValue % BigInt(toBase))] + newValue;
        decValue = (decValue - (decValue % BigInt(toBase))) / BigInt(toBase);
    }
    return newValue;
}

export default function IntegerBaseConverter() {
    const [input, setInput] = useState('42');
    const [inputBase, setInputBase] = useState(10);
    const [customBase, setCustomBase] = useState(42);

    // Helper to safely convert
    const safeConvert = (val: string, from: number, to: number) => {
        try {
            if (!val) return '';
            const res = convertBase(val, from, to);
            return res;
        } catch {
            return '';
        }
    };

    const error = useMemo(() => {
        if (!input) return null;
        const range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('').slice(0, inputBase);
        const invalidChar = input.split('').find(c => !range.includes(c));
        return invalidChar ? `Invalid digit "${invalidChar}" for base ${inputBase}.` : null;
    }, [input, inputBase]);


    const CopyInput = ({ label, value }: { label: string, value: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            if (!value) return;
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: '5px 10px', marginBottom: 10 }}>
                <div style={{ width: 150, textAlign: 'right', paddingRight: 15, fontWeight: 500, color: '#555' }}>
                    {label}
                </div>
                <input
                    type="text"
                    readOnly
                    value={value}
                    placeholder={`${label.split(' ')[0]} version will be here...`}
                    style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        padding: '10px',
                        fontFamily: 'monospace',
                        color: value ? '#333' : '#aaa'
                    }}
                />
                <button
                    onClick={copy}
                    disabled={!value}
                    style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: value ? 'pointer' : 'default',
                        color: copied ? '#4CAF50' : '#666',
                        opacity: value ? 1 : 0.5
                    }}
                    title="Copy"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
            </div>
        )
    }

    return (
        <ToolLayout
            title="Integer Base Converter"
            description="Convert numbers between different bases (binary, octal, decimal, hex, etc.)"
            icon={ArrowLeftRight}
        >
            <div style={{ display: 'grid', gap: 15, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#666' }}>Input Number</label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. 42"
                            style={{
                                width: '100%',
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ width: 120 }}>
                        <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem', color: '#666' }}>Input Base</label>
                        <input
                            type="number"
                            min={2}
                            max={64}
                            value={inputBase}
                            onChange={(e) => setInputBase(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ padding: '10px 15px', background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
                <CopyInput label="Binary (2)" value={safeConvert(input, inputBase, 2)} />
                <CopyInput label="Octal (8)" value={safeConvert(input, inputBase, 8)} />
                <CopyInput label="Decimal (10)" value={safeConvert(input, inputBase, 10)} />
                <CopyInput label="Hexadecimal (16)" value={safeConvert(input, inputBase, 16)} />
                <CopyInput label="Base64 (64)" value={safeConvert(input, inputBase, 64)} />

                <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: '5px 10px', marginBottom: 10 }}>
                    <div style={{ width: 150, textAlign: 'right', paddingRight: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                        <span style={{ fontSize: '0.9rem', color: '#555' }}>Base</span>
                        <input
                            type="number"
                            min={2}
                            max={64}
                            value={customBase}
                            onChange={(e) => setCustomBase(Number(e.target.value))}
                            style={{
                                width: 60,
                                padding: '4px 8px',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <input
                        type="text"
                        readOnly
                        value={safeConvert(input, inputBase, customBase)}
                        placeholder={`Base ${customBase} version will be here...`}
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            padding: '10px 10px 10px 15px', // adjusted padding
                            fontFamily: 'monospace',
                            color: safeConvert(input, inputBase, customBase) ? '#333' : '#aaa'
                        }}
                    />
                    {/* No copy button for custom base for simplicity, or add it if needed */}
                </div>
            </div>

        </ToolLayout>
    );
}
