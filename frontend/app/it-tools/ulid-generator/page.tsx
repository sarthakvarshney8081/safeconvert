"use client";

import React, { useState, useEffect } from 'react';
import { ArrowDownAZ, Copy, Check, RefreshCw } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ulid } from 'ulid';

export default function ULIDGenerator() {
    const [quantity, setQuantity] = useState(1);
    const [ulids, setUlids] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const generateULIDs = () => {
        const generated: string[] = [];
        for (let i = 0; i < quantity; i++) {
            generated.push(ulid());
        }
        setUlids(generated.join('\n'));
    };

    useEffect(() => {
        generateULIDs();
    }, [quantity]);

    const handleCopy = () => {
        navigator.clipboard.writeText(ulids);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="ULID Generator"
            description="Generate Universally Unique Lexicographically Sortable Identifiers."
            icon={ArrowDownAZ}
        >
            <div style={{ display: 'grid', gap: '20px' }}>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Quantity</label>
                        <input
                            type="number"
                            min="1"
                            max="1000"
                            className="w-full"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Output Area */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: 500 }}>Generated ULIDs</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={generateULIDs}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <button
                                onClick={handleCopy}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', background: copied ? '#e8f5e9' : 'var(--primary)', color: copied ? '#2e7d32' : '#fff', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={ulids}
                        readOnly
                        style={{
                            width: '100%',
                            height: '300px',
                            padding: '15px',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            resize: 'none',
                            background: '#fafafa',
                            lineHeight: '1.6'
                        }}
                    />
                </div>

                <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', fontSize: '0.9rem', color: '#0d47a1' }}>
                    <strong>What is ULID?</strong> <br />
                    ULID (Universally Unique Lexicographically Sortable Identifier) is a 128-bit compatible identifier that is sortable (monotonic) and URL safe. It combines a 48-bit timestamp with 80 bits of random data.
                </div>
            </div>
        </ToolLayout>
    );
}
