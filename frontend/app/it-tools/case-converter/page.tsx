"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Type, Copy, Check } from 'lucide-react';
import * as changeCase from 'change-case';

export default function CaseConverter() {
    const [input, setInput] = useState('lorem ipsum dolor sit amet');

    const baseConfig = {
        // Simple strip regex similar to original
        // stripRegexp: /[^A-Za-zÀ-ÖØ-öø-ÿ]+/gi 
    };

    const formats = [
        { label: 'Lowercase', value: input.toLowerCase() },
        { label: 'Uppercase', value: input.toUpperCase() },
        { label: 'Camelcase', value: changeCase.camelCase(input) },
        { label: 'Capitalcase', value: changeCase.capitalCase(input) },
        { label: 'Constantcase', value: changeCase.constantCase(input) },
        { label: 'Dotcase', value: changeCase.dotCase(input) },
        { label: 'Headercase', value: changeCase.trainCase(input) },
        { label: 'No Case', value: changeCase.noCase(input) },
        { label: 'Paramcase', value: changeCase.kebabCase(input) },
        { label: 'Pascalcase', value: changeCase.pascalCase(input) },
        { label: 'Pathcase', value: changeCase.pathCase(input) },
        { label: 'Sentencecase', value: changeCase.sentenceCase(input) },
        { label: 'Snakecase', value: changeCase.snakeCase(input) },
        {
            label: 'Mockingcase',
            value: input.split('').map((char, index) => (index % 2 === 0 ? char.toUpperCase() : char.toLowerCase())).join('')
        },
    ];

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
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: !text ? 'default' : 'pointer',
                    color: copied ? '#4CAF50' : '#666',
                    opacity: !text ? 0.3 : 1
                }}
                title="Copy"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
        );
    };

    return (
        <ToolLayout
            title="Case Converter"
            description="Change string case (camelCase, snake_case, etc.)"
            icon={Type}
        >
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 10, fontWeight: 500, color: '#444' }}>Your string:</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your string here..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
                {formats.map((f) => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: '5px 15px' }}>
                        <div style={{ width: 150, textAlign: 'right', paddingRight: 20, fontWeight: 500, color: '#555' }}>
                            {f.label}:
                        </div>
                        <input
                            type="text"
                            readOnly
                            value={f.value}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                padding: '10px 0',
                                color: '#333',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <CopyButton text={f.value} />
                    </div>
                ))}
            </div>
        </ToolLayout>
    );
}
