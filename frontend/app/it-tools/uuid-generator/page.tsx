"use client";

import React, { useState, useEffect } from 'react';
import { Fingerprint, Copy, RefreshCw, Check } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { v1 as uuidv1, v4 as uuidv4, v3 as uuidv3, v5 as uuidv5, NIL as NIL_UUID } from 'uuid';

export default function UUIDGenerator() {
    const [version, setVersion] = useState<'v4' | 'v1' | 'v3' | 'v5' | 'NIL'>('v4');
    const [quantity, setQuantity] = useState(1);
    const [uuids, setUuids] = useState<string>('');
    const [copied, setCopied] = useState(false);

    // For v3 and v5
    const [namespace, setNamespace] = useState('6ba7b811-9dad-11d1-80b4-00c04fd430c8'); // URL namespace default
    const [name, setName] = useState('');

    const PREDEFINED_NAMESPACES = {
        DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
    };

    const generateUUIDs = () => {
        const generated: string[] = [];
        try {
            for (let i = 0; i < quantity; i++) {
                if (version === 'v4') generated.push(uuidv4());
                else if (version === 'v1') generated.push(uuidv1());
                else if (version === 'NIL') generated.push(NIL_UUID);
                else if (version === 'v3') {
                    if (namespace && name) generated.push(uuidv3(name, namespace));
                    else generated.push("Requires Name and Namespace");
                }
                else if (version === 'v5') {
                    if (namespace && name) generated.push(uuidv5(name, namespace));
                    else generated.push("Requires Name and Namespace");
                }
            }
            setUuids(generated.join('\n'));
        } catch (e) {
            setUuids("Error generating UUID: Invalid namespace");
        }
    };

    useEffect(() => {
        generateUUIDs();
    }, [version, quantity, namespace, name]);

    const handleCopy = () => {
        navigator.clipboard.writeText(uuids);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="UUID Generator"
            description="Generate universally unique identifiers (UUIDs)."
            icon={Fingerprint}
        >
            <div style={{ display: 'grid', gap: '20px' }}>

                {/* Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Version</label>
                        <select
                            className="w-full"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff' }}
                            value={version}
                            onChange={(e) => setVersion(e.target.value as any)}
                        >
                            <option value="v4">Version 4 (Random)</option>
                            <option value="v1">Version 1 (Timestamp)</option>
                            <option value="v3">Version 3 (MD5)</option>
                            <option value="v5">Version 5 (SHA-1)</option>
                            <option value="NIL">NIL (Empty)</option>
                        </select>
                    </div>

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

                {/* V3/V5 Options */}
                {(version === 'v3' || version === 'v5') && (
                    <div style={{ padding: '20px', background: '#f5f5f7', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Namespace & Name</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Namespace (UUID)</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        value={namespace}
                                        onChange={(e) => setNamespace(e.target.value)}
                                        placeholder="e.g. 6ba7b811-9dad-11d1-80b4-00c04fd430c8"
                                    />
                                    <select
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        onChange={(e) => setNamespace(e.target.value)}
                                        value={Object.values(PREDEFINED_NAMESPACES).includes(namespace) ? namespace : ''}
                                    >
                                        <option value="" disabled>Predefined</option>
                                        {Object.entries(PREDEFINED_NAMESPACES).map(([k, v]) => (
                                            <option key={k} value={v}>{k}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Name (String)</label>
                                <input
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name to hash..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Output Area */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: 500 }}>Generated UUIDs</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={generateUUIDs}
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
                        value={uuids}
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

            </div>
        </ToolLayout>
    );
}
