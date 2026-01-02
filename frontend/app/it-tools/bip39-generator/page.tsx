"use client";

import React, { useState, useEffect } from 'react';
import { KeyRound, Copy, RefreshCw, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

// Polyfill Buffer for the browser environment if necessary
if (typeof window !== 'undefined' && !window.Buffer) {
    (window as any).Buffer = Buffer;
}

export default function BIP39Generator() {
    const [entropy, setEntropy] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [seed, setSeed] = useState('');
    const [language, setLanguage] = useState('english');
    const [copiedMnemonic, setCopiedMnemonic] = useState(false);

    // Initial random generation
    useEffect(() => {
        generateNew();
    }, []);

    const generateNew = () => {
        // Generate 128 bits (16 bytes) of random entropy
        const entropyBytes = new Uint8Array(16);
        crypto.getRandomValues(entropyBytes);
        const entropyHex = Buffer.from(entropyBytes).toString('hex');
        setEntropy(entropyHex);
        updateFromEntropy(entropyHex);
    };

    const updateFromEntropy = (hex: string) => {
        try {
            if (!/^[0-9a-fA-F]*$/.test(hex)) return; // Validate hex
            // bip39 expects hex string
            const words = bip39.entropyToMnemonic(hex);
            setMnemonic(words);

            // Generate seed (async usually but synchronous version available or promise)
            // bip39.mnemonicToSeedSync is expensive on main thread but for single call ok
            const seedBuffer = bip39.mnemonicToSeedSync(words);
            setSeed(seedBuffer.toString('hex'));

        } catch (e) {
            // Invalid entropy length probably
            setMnemonic("Invalid entropy length (must be multiple of 32 bits)");
            setSeed("");
        }
    };

    // Handle entropy input change
    const handleEntropyChange = (val: string) => {
        setEntropy(val);
        // Debounce or just update? Update is fast enough for small strings
        updateFromEntropy(val);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMnemonic(true);
        setTimeout(() => setCopiedMnemonic(false), 2000);
    };

    return (
        <ToolLayout
            title="BIP39 Passphrase Generator"
            description="Generate valid BIP39 mnemonic phrases from random entropy. Useful for crypto wallets."
            icon={KeyRound}
        >
            <div style={{ display: 'grid', gap: '30px' }}>

                {/* Controls */}
                <div style={{ padding: '20px', background: '#f5f5f7', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <label style={{ fontWeight: 500 }}>Entropy (Hexadecimal)</label>
                        <button
                            onClick={generateNew}
                            className="btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', background: '#fff' }}
                        >
                            <RefreshCw size={14} /> Generate Random
                        </button>
                    </div>
                    <input
                        value={entropy}
                        onChange={(e) => handleEntropyChange(e.target.value)}
                        placeholder="Enter entropy hex..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                        }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                        128 bits = 32 hex chars (12 words). 256 bits = 64 hex chars (24 words).
                    </p>
                </div>

                {/* Output */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500, fontSize: '1.1rem' }}>Mnemonic Phrase</label>

                    <div style={{ position: 'relative' }}>
                        <div
                            style={{
                                padding: '20px',
                                background: '#e0f2f1',
                                borderRadius: '12px',
                                border: '1px solid #b2dfdb',
                                color: '#00695c',
                                fontSize: '1.2rem',
                                fontWeight: 500,
                                lineHeight: '1.6',
                                textAlign: 'center',
                                minHeight: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {mnemonic}
                        </div>
                        <button
                            onClick={() => handleCopy(mnemonic)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '0.85rem'
                            }}
                        >
                            {copiedMnemonic ? <Check size={16} color="green" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Seed Output */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Derived Seed (Hex)</label>
                    <textarea
                        readOnly
                        value={seed}
                        style={{
                            width: '100%',
                            height: '80px',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            background: '#fafafa',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            resize: 'none',
                            color: '#666'
                        }}
                    />
                </div>

            </div>
        </ToolLayout>
    );
}
