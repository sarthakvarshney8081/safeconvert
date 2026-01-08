"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileCode, Copy, Check, ArrowRightLeft } from 'lucide-react';
import TOML from '@iarna/toml';

export default function JsonToTomlConverter() {
    const [jsonInput, setJsonInput] = useState('{\n  "title": "TOML Example",\n  "owner": {\n    "name": "Tom Preston-Werner",\n    "dob": "1979-05-27T07:32:00Z"\n  },\n  "database": {\n    "enabled": true,\n    "ports": [ 8000, 8001, 8002 ],\n    "data": [ ["delta", "phi"], [3.14] ]\n  }\n}');
    const [tomlOutput, setTomlOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            setError(null);
            if (!jsonInput.trim()) {
                setTomlOutput('');
                return;
            }
            const data = JSON.parse(jsonInput);
            const output = TOML.stringify(data);
            setTomlOutput(output);
        } catch (e: any) {
            setError(e.message || 'Conversion failed');
            setTomlOutput('');
        }
    }, [jsonInput]);

    const handleCopy = () => {
        if (!tomlOutput) return;
        navigator.clipboard.writeText(tomlOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="JSON to TOML Converter"
            description="Convert your JSON data to TOML format for configuration files."
            icon={FileCode}
        >
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
                {/* Input Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JSON Input</span>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        style={{
                            width: '100%',
                            height: '400px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            background: '#fff',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    />
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '8px',
                            color: '#991b1b',
                            fontSize: '0.85rem'
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOML Output</span>
                        <button
                            onClick={handleCopy}
                            disabled={!tomlOutput}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                background: copied ? '#22c55e' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: tomlOutput ? 'pointer' : 'default',
                                opacity: tomlOutput ? 1 : 0.5,
                                transition: 'background 0.2s'
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <textarea
                        readOnly
                        value={tomlOutput}
                        placeholder="TOML output will appear here..."
                        style={{
                            width: '100%',
                            height: '400px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            background: '#f8fafc',
                            color: '#1e293b'
                        }}
                    />
                </div>
            </div>

            <div style={{
                marginTop: 32,
                padding: '24px',
                background: '#eff6ff',
                borderRadius: '16px',
                border: '1px solid #dbeafe',
                color: '#1e40af'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>What is TOML?</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    TOML (Tom's Obvious, Minimal Language) is a configuration file format that is easy to read due to obvious semantics.
                    It's designed to map unambiguously to a hash table and is widely used in ecosystems like Rust (Cargo), Go, and Python (pyproject.toml).
                </p>
            </div>
        </ToolLayout>
    );
}
