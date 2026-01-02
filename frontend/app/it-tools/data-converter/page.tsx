"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileCode, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { DataFormat, parseData, stringifyData } from './utils';
import { useSearchParams } from 'next/navigation';

function DataConverterContent() {
    const searchParams = useSearchParams();
    const [inputFormat, setInputFormat] = useState<DataFormat>('json');
    const [outputFormat, setOutputFormat] = useState<DataFormat>('yaml');
    const [inputContent, setInputContent] = useState('{\n  "key": "value",\n  "array": [1, 2, 3]\n}');
    const [outputContent, setOutputContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const from = searchParams.get('from') as DataFormat;
        const to = searchParams.get('to') as DataFormat;
        if (from) setInputFormat(from);
        if (to) setOutputFormat(to);
    }, [searchParams]);

    useEffect(() => {
        try {
            setError(null);
            if (!inputContent.trim()) {
                setOutputContent('');
                return;
            }
            const data = parseData(inputContent, inputFormat);
            const output = stringifyData(data, outputFormat);
            setOutputContent(output);
        } catch (e: any) {
            setError(e.message || 'Conversion failed');
            setOutputContent('');
        }

    }, [inputContent, inputFormat, outputFormat]);

    const formatOptions: { value: DataFormat, label: string }[] = [
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'toml', label: 'TOML' },
        { value: 'xml', label: 'XML' },
    ];

    const switchFormats = () => {
        const temp = inputFormat;
        setInputFormat(outputFormat);
        setOutputFormat(temp);
        setInputContent(outputContent);
    };

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
                    padding: '8px 16px',
                    background: !text ? '#ccc' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: !text ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.9rem'
                }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        );
    };

    return (
        <ToolLayout
            title="Data Format Converter"
            description="Convert data between JSON, YAML, TOML, and XML formats."
            icon={FileCode}
        >
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>

                {/* Input Column */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <select
                            value={inputFormat}
                            onChange={(e) => setInputFormat(e.target.value as DataFormat)}
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.95rem' }}
                        >
                            {formatOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={switchFormats} title="Swap Formats" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                            <ArrowRightLeft size={20} />
                        </button>
                    </div>

                    <textarea
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        placeholder={`Paste your ${inputFormat.toUpperCase()} here...`}
                        rows={15}
                        style={{
                            width: '100%',
                            padding: 10,
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                            flex: 1
                        }}
                    />
                    {error && (
                        <div style={{ marginTop: 10, color: '#f44336', fontSize: '0.9rem', padding: '8px', background: '#ffebee', borderRadius: 4 }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as DataFormat)}
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.95rem' }}
                        >
                            {formatOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <CopyButton text={outputContent} />
                    </div>

                    <textarea
                        readOnly
                        value={outputContent}
                        placeholder={`Resulting ${outputFormat.toUpperCase()}...`}
                        rows={15}
                        style={{
                            width: '100%',
                            padding: 10,
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                            background: '#fbfbfb',
                            flex: 1
                        }}
                    />
                </div>
            </div>
        </ToolLayout>
    );
}

export default function DataConverter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DataConverterContent />
        </Suspense>
    );
}
