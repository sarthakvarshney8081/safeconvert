"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { KeyRound, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function JwtParser() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!token.trim()) {
            setHeader('');
            setPayload('');
            setError('');
            setIsExpired(false);
            return;
        }

        try {
            // Header
            const decodedHeader = jwtDecode(token, { header: true });
            setHeader(JSON.stringify(decodedHeader, null, 2));

            // Payload
            const decodedPayload = jwtDecode(token);
            setPayload(JSON.stringify(decodedPayload, null, 2));
            setError('');

            // Expiration Check
            if (decodedPayload && (decodedPayload as any).exp) {
                const exp = (decodedPayload as any).exp * 1000;
                setIsExpired(Date.now() > exp);
            } else {
                setIsExpired(false);
            }

        } catch (e) {
            setError('Invalid JWT format');
            setHeader('');
            setPayload('');
        }
    }, [token]);

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
                    padding: '4px 8px',
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: !text ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.8rem'
                }}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        );
    };

    return (
        <ToolLayout
            title="JWT Parser"
            description="Decode and inspect JSON Web Tokens (JWT) without verification."
            icon={KeyRound}
        >
            <div style={{ marginBottom: 20 }}>
                <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste JWT here (eyJ...)"
                    rows={5}
                    style={{
                        width: '100%',
                        padding: 15,
                        borderRadius: 8,
                        border: error ? '1px solid #f44336' : '1px solid #ddd',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                    }}
                />
                {error && <div style={{ color: '#f44336', marginTop: 5, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertTriangle size={16} /> {error}
                </div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                {/* Header */}
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#e91e63' }}>HEADER</h3>
                        <CopyButton text={header} />
                    </div>
                    <pre style={{
                        background: '#f8f9fa',
                        padding: 15,
                        borderRadius: 8,
                        overflowX: 'auto',
                        fontSize: '0.85rem',
                        color: '#333',
                        minHeight: 100
                    }}>
                        {header || '// Header content'}
                    </pre>
                </div>

                {/* Payload */}
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#9c27b0' }}>PAYLOAD</h3>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {payload && (
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: isExpired ? '#ffebee' : '#e8f5e9',
                                    color: isExpired ? '#f44336' : '#4caf50',
                                    fontWeight: 600
                                }}>
                                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                </span>
                            )}
                            <CopyButton text={payload} />
                        </div>
                    </div>
                    <pre style={{
                        background: '#f8f9fa',
                        padding: 15,
                        borderRadius: 8,
                        overflowX: 'auto',
                        fontSize: '0.85rem',
                        color: '#333',
                        minHeight: 100
                    }}>
                        {payload || '// Payload content'}
                    </pre>
                </div>
            </div>

            <div style={{ marginTop: 20, fontSize: '0.85rem', color: '#666', background: '#e3f2fd', padding: 10, borderRadius: 6, display: 'flex', gap: 10 }}>
                <ShieldCheck size={20} color="#2196f3" />
                <div>
                    <strong>Security Note:</strong> Tokens are decoded client-side. The signature is NOT verified here. Do not paste sensitive production tokens on untrusted networks.
                </div>
            </div>
        </ToolLayout>
    );
}
