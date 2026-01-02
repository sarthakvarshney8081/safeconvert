"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ArrowLeftRight, FileText, Mail, Link as LinkIcon, Download } from 'lucide-react';
import Papa from 'papaparse';
import slugify from 'slugify';

export default function ConverterUtils() {
    const [activeTab, setActiveTab] = useState<'csv' | 'slug' | 'email'>('csv');

    // CSV/JSON State
    const [csvInput, setCsvInput] = useState('[\n  {"name": "Alice", "age": 25},\n  {"name": "Bob", "age": 30}\n]');
    const [csvResult, setCsvResult] = useState('');
    const [csvMode, setCsvMode] = useState<'json2csv' | 'csv2json'>('json2csv');

    // Slug State
    const [slugInput, setSlugInput] = useState('Hello World! This is a Title.');
    const [slugResult, setSlugResult] = useState('');

    // Email State
    const [emailInput, setEmailInput] = useState('  John.Doe+sub@Example.com  ');
    const [emailResult, setEmailResult] = useState('');

    // Effects
    React.useEffect(() => {
        if (activeTab === 'csv') {
            try {
                if (!csvInput.trim()) { setCsvResult(''); return; }
                if (csvMode === 'json2csv') {
                    const json = JSON.parse(csvInput);
                    const csv = Papa.unparse(json);
                    setCsvResult(csv);
                } else {
                    const json = Papa.parse(csvInput, { header: true });
                    setCsvResult(JSON.stringify(json.data, null, 2));
                }
            } catch (e) {
                setCsvResult('Error: Invalid Input');
            }
        }
    }, [csvInput, activeTab, csvMode]);

    React.useEffect(() => {
        if (activeTab === 'slug') {
            setSlugResult(slugify(slugInput, { lower: true, strict: true }));
        }
    }, [slugInput, activeTab]);

    React.useEffect(() => {
        if (activeTab === 'email') {
            const raw = emailInput.trim().toLowerCase();
            // simple gmail-style normalization (remove aliases)
            // Note: This is a basic example
            const parts = raw.split('@');
            if (parts.length === 2 && parts[1] === 'gmail.com') {
                const local = parts[0].split('+')[0].replace(/\./g, '');
                setEmailResult(`${local}@${parts[1]}`);
            } else {
                setEmailResult(raw);
            }
        }
    }, [emailInput, activeTab]);

    return (
        <ToolLayout
            title="Converter Utilities"
            description="Various data format and string converters."
            icon={ArrowLeftRight}
        >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('csv')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'csv' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'csv' ? 600 : 400,
                        color: activeTab === 'csv' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <FileText size={16} /> JSON &lt;&gt; CSV
                </button>
                <button
                    onClick={() => setActiveTab('slug')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'slug' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'slug' ? 600 : 400,
                        color: activeTab === 'slug' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <LinkIcon size={16} /> Slugify
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'email' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'email' ? 600 : 400,
                        color: activeTab === 'email' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <Mail size={16} /> Email Normalizer
                </button>
            </div>

            {activeTab === 'csv' && (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ marginBottom: 15 }}>
                        <select
                            value={csvMode}
                            onChange={(e) => setCsvMode(e.target.value as any)}
                            style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
                        >
                            <option value="json2csv">JSON to CSV</option>
                            <option value="csv2json">CSV to JSON</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                        <textarea
                            value={csvInput}
                            onChange={(e) => setCsvInput(e.target.value)}
                            rows={10}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontFamily: 'monospace' }}
                            placeholder={csvMode === 'json2csv' ? '[Expected JSON array]' : 'col1,col2...'}
                        />
                        <textarea
                            readOnly
                            value={csvResult}
                            rows={10}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontFamily: 'monospace', background: '#f8f9fa' }}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'slug' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Slugify String</h3>
                    <input
                        type="text"
                        value={slugInput}
                        onChange={(e) => setSlugInput(e.target.value)}
                        style={{ width: '100%', padding: 15, borderRadius: 8, border: '1px solid #ddd', fontSize: '1.2rem', marginBottom: 20 }}
                    />
                    <div style={{ background: '#e3f2fd', color: '#1565c0', padding: 20, borderRadius: 8, fontSize: '1.2rem', fontFamily: 'monospace' }}>
                        {slugResult}
                    </div>
                </div>
            )}

            {activeTab === 'email' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Email Normalizer</h3>
                    <p style={{ color: '#666', marginBottom: 15 }}>Trims whitespace, lowercases, and removes Gmail aliases (e.g. <code>+tag</code> and dots).</p>
                    <input
                        type="text"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        style={{ width: '100%', padding: 15, borderRadius: 8, border: '1px solid #ddd', fontSize: '1.2rem', marginBottom: 20 }}
                    />
                    <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: 20, borderRadius: 8, fontSize: '1.2rem', fontFamily: 'monospace' }}>
                        {emailResult}
                    </div>
                </div>
            )}

        </ToolLayout>
    );
}
