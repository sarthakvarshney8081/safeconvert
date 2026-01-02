"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Copy, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import CryptoJS from 'crypto-js';

export default function EncryptionTool() {
    // Encrypt State
    const [encryptInput, setEncryptInput] = useState('Lorem ipsum dolor sit amet');
    const [encryptSecret, setEncryptSecret] = useState('my secret key');
    const [encryptAlgo, setEncryptAlgo] = useState('AES');
    const [encryptOutput, setEncryptOutput] = useState('');
    const [encryptCopied, setEncryptCopied] = useState(false);

    // Decrypt State
    const [decryptInput, setDecryptInput] = useState('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
    const [decryptSecret, setDecryptSecret] = useState('my secret key');
    const [decryptAlgo, setDecryptAlgo] = useState('AES');
    const [decryptOutput, setDecryptOutput] = useState('');
    const [decryptError, setDecryptError] = useState('');

    const algos = {
        'AES': CryptoJS.AES,
        'TripleDES': CryptoJS.TripleDES,
        'Rabbit': CryptoJS.Rabbit,
        'RC4': CryptoJS.RC4,
    };

    // Encrypt Effect
    useEffect(() => {
        try {
            if (!encryptInput || !encryptSecret) {
                setEncryptOutput('');
                return;
            }
            const encrypted = algos[encryptAlgo as keyof typeof algos].encrypt(encryptInput, encryptSecret).toString();
            setEncryptOutput(encrypted);
        } catch (e) {
            setEncryptOutput('Error encrypting');
        }
    }, [encryptInput, encryptSecret, encryptAlgo]);

    // Decrypt Effect
    useEffect(() => {
        try {
            setDecryptError('');
            if (!decryptInput || !decryptSecret) {
                setDecryptOutput('');
                return;
            }
            const bytes = algos[decryptAlgo as keyof typeof algos].decrypt(decryptInput, decryptSecret);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                // If decryption produces empty string but no error threw, it might be wrong key/algo
                // causing non-utf8 bytes.
                if (decryptInput.length > 0) setDecryptError('Unable to decrypt (wrong key or algorithm?)');
                setDecryptOutput('');
            } else {
                setDecryptOutput(decrypted);
            }
        } catch (e) {
            setDecryptError('Unable to decrypt: Invalid input format');
            setDecryptOutput('');
        }
    }, [decryptInput, decryptSecret, decryptAlgo]);

    const copyToClipboard = (text: string, isEncrypt: boolean) => {
        navigator.clipboard.writeText(text);
        if (isEncrypt) {
            setEncryptCopied(true);
            setTimeout(() => setEncryptCopied(false), 2000);
        } else {
            // Decrypt copy logic if needed, simplify for now
        }
    };

    return (
        <ToolLayout
            title="Encrypt / Decrypt Text"
            description="Encrypt and decrypt text using AES, TripleDES, Rabbit, and RC4."
            icon={Lock}
        >
            <div className="grid grid-cols-1 gap-12">

                {/* Encrypt Section */}
                <div className="card" style={{ padding: '0', border: 'none', boxShadow: 'none' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', color: 'var(--primary)' }}>
                        <Lock size={20} /> Encrypt
                    </h2>

                    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }} className="md:grid-cols-2">
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Plaintext</label>
                                <textarea
                                    value={encryptInput}
                                    onChange={(e) => setEncryptInput(e.target.value)}
                                    placeholder="Text to encrypt..."
                                    style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Secret Key</label>
                                    <input
                                        type="text"
                                        value={encryptSecret}
                                        onChange={(e) => setEncryptSecret(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Algorithm</label>
                                    <select
                                        value={encryptAlgo}
                                        onChange={(e) => setEncryptAlgo(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                                    >
                                        {Object.keys(algos).map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontWeight: 500 }}>Encrypted Output</label>
                                <button
                                    onClick={() => copyToClipboard(encryptOutput, true)}
                                    disabled={!encryptOutput}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: encryptOutput ? 'pointer' : 'default', color: encryptCopied ? 'green' : '#666' }}
                                >
                                    {encryptCopied ? <Check size={14} /> : <Copy size={14} />} {encryptCopied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={encryptOutput}
                                style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f7', fontFamily: 'monospace', color: '#333' }}
                            />
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px dashed #ddd' }} />

                {/* Decrypt Section */}
                <div className="card" style={{ padding: '0', border: 'none', boxShadow: 'none' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', marginBottom: '20px', color: '#e91e63' }}>
                        <Unlock size={20} /> Decrypt
                    </h2>

                    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }} className="md:grid-cols-2">
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Encrypted Text</label>
                                <textarea
                                    value={decryptInput}
                                    onChange={(e) => setDecryptInput(e.target.value)}
                                    placeholder="Text to decrypt..."
                                    style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', fontFamily: 'monospace' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Secret Key</label>
                                    <input
                                        type="text"
                                        value={decryptSecret}
                                        onChange={(e) => setDecryptSecret(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Algorithm</label>
                                    <select
                                        value={decryptAlgo}
                                        onChange={(e) => setDecryptAlgo(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                                    >
                                        {Object.keys(algos).map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            {decryptError ? (
                                <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginTop: '10px' }}>
                                    {decryptError}
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Decrypted Plaintext</label>
                                    <textarea
                                        readOnly
                                        value={decryptOutput}
                                        style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#e8f5e9', color: '#2e7d32' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </ToolLayout>
    );
}
