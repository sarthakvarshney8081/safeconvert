"use client";

import React, { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Smartphone } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import forge from 'node-forge';

export default function RSAKeyGenerator() {
    const [bits, setBits] = useState(2048);
    const [publicKey, setPublicKey] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedPublic, setCopiedPublic] = useState(false);
    const [copiedPrivate, setCopiedPrivate] = useState(false);

    const generateKeys = async () => {
        setIsGenerating(true);
        setPublicKey('');
        setPrivateKey('');

        // Use setTimeout to allow UI to update to loading state
        setTimeout(() => {
            try {
                const keypair = forge.pki.rsa.generateKeyPair({ bits: bits, workers: 2 });
                const pubPem = forge.pki.publicKeyToPem(keypair.publicKey);
                const privPem = forge.pki.privateKeyToPem(keypair.privateKey);

                setPublicKey(pubPem);
                setPrivateKey(privPem);
            } catch (error) {
                console.error("RSA Gen Error", error);
            } finally {
                setIsGenerating(false);
            }
        }, 100);
    };

    const handleCopy = (text: string, isPublic: boolean) => {
        navigator.clipboard.writeText(text);
        if (isPublic) {
            setCopiedPublic(true);
            setTimeout(() => setCopiedPublic(false), 2000);
        } else {
            setCopiedPrivate(true);
            setTimeout(() => setCopiedPrivate(false), 2000);
        }
    };

    return (
        <ToolLayout
            title="RSA Key Pair Generator"
            description="Generate generic RSA public and private key pairs (PEM format)."
            icon={Key}
        >
            <div style={{ display: 'grid', gap: '30px' }}>

                {/* Controls */}
                <div style={{ padding: '20px', background: '#f5f5f7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Key Size (bits)</label>
                        <select
                            value={bits}
                            onChange={(e) => setBits(Number(e.target.value))}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' }}
                            disabled={isGenerating}
                        >
                            <option value="1024">1024 bit (Fast)</option>
                            <option value="2048">2048 bit (Standard)</option>
                            <option value="4096">4096 bit (Slow)</option>
                        </select>
                    </div>

                    <button
                        onClick={generateKeys}
                        disabled={isGenerating}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px', marginTop: '24px' }}
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Key size={20} />}
                        {isGenerating ? 'Generating...' : 'Generate Key Pair'}
                    </button>

                    {isGenerating && bits >= 4096 && (
                        <p style={{ color: '#e65100', fontSize: '0.9rem', marginTop: '24px' }}>
                            Generating 4096-bit keys may take a few seconds...
                        </p>
                    )}
                </div>

                {/* Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Public Key */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1976d2' }}>Public Key</h3>
                            <button
                                onClick={() => handleCopy(publicKey, true)}
                                disabled={!publicKey}
                                style={{
                                    opacity: publicKey ? 1 : 0.5,
                                    cursor: publicKey ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff'
                                }}
                            >
                                {copiedPublic ? <Check size={14} color="green" /> : <Copy size={14} />}
                                {copiedPublic ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={publicKey}
                            placeholder="-----BEGIN PUBLIC KEY-----..."
                            style={{
                                width: '100%',
                                height: '350px',
                                padding: '15px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                resize: 'none',
                                background: '#fafafa',
                                color: '#333'
                            }}
                        />
                    </div>

                    {/* Private Key */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#d32f2f' }}>Private Key</h3>
                            <button
                                onClick={() => handleCopy(privateKey, false)}
                                disabled={!privateKey}
                                style={{
                                    opacity: privateKey ? 1 : 0.5,
                                    cursor: privateKey ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff'
                                }}
                            >
                                {copiedPrivate ? <Check size={14} color="green" /> : <Copy size={14} />}
                                {copiedPrivate ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={privateKey}
                            placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                            style={{
                                width: '100%',
                                height: '350px',
                                padding: '15px',
                                borderRadius: '12px',
                                border: '1px solid #e0e0e0',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                resize: 'none',
                                background: '#fafafa',
                                color: '#333'
                            }}
                        />
                    </div>
                </div>

            </div>
        </ToolLayout>
    );
}
