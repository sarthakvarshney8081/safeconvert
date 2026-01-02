"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileDiff, Split, AlignJustify, Check, AlertTriangle } from 'lucide-react';
import * as Diff from 'diff';

export default function DiffTools() {
    const [activeTab, setActiveTab] = useState<'text' | 'json'>('text');

    // Text Diff State
    const [oldText, setOldText] = useState('The quick brown fox jumps over the lazy dog.');
    const [newText, setNewText] = useState('The quick brown fox jumps over the active dog.');
    const [diffResult, setDiffResult] = useState<Diff.Change[]>([]);

    // JSON Diff State
    const [oldJson, setOldJson] = useState('{\n  "name": "John",\n  "age": 30\n}');
    const [newJson, setNewJson] = useState('{\n  "name": "Jane",\n  "age": 30,\n  "city": "NY"\n}');
    const [jsonError, setJsonError] = useState('');

    // Calculate Text Diff
    React.useEffect(() => {
        if (activeTab === 'text') {
            const diff = Diff.diffChars(oldText, newText);
            setDiffResult(diff);
        }
    }, [oldText, newText, activeTab]);

    // Calculate JSON Diff
    React.useEffect(() => {
        if (activeTab === 'json') {
            try {
                // Parse to ensure valid JSON and pretty print for comparison
                const oldObj = JSON.parse(oldJson);
                const newObj = JSON.parse(newJson);
                const oldString = JSON.stringify(oldObj, null, 2);
                const newString = JSON.stringify(newObj, null, 2);

                const diff = Diff.diffJson(oldObj, newObj);
                setDiffResult(diff);
                setJsonError('');
            } catch (e) {
                setJsonError('Invalid JSON input');
                setDiffResult([]);
            }
        }
    }, [oldJson, newJson, activeTab]);

    return (
        <ToolLayout
            title="Diff Tools"
            description="Compare Text or JSON to find differences."
            icon={FileDiff}
        >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('text')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'text' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'text' ? 600 : 400,
                        color: activeTab === 'text' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <AlignJustify size={16} /> Text Diff
                </button>
                <button
                    onClick={() => setActiveTab('json')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'json' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'json' ? 600 : 400,
                        color: activeTab === 'json' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <FileDiff size={16} /> JSON Diff
                </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginBottom: 20 }}>
                <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: 10, color: '#666' }}>Original</h3>
                    <textarea
                        value={activeTab === 'text' ? oldText : oldJson}
                        onChange={(e) => activeTab === 'text' ? setOldText(e.target.value) : setOldJson(e.target.value)}
                        rows={8}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontFamily: 'monospace' }}
                        placeholder={activeTab === 'text' ? "Original text..." : "{ ... }"}
                    />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: 10, color: '#666' }}>New</h3>
                    <textarea
                        value={activeTab === 'text' ? newText : newJson}
                        onChange={(e) => activeTab === 'text' ? setNewText(e.target.value) : setNewJson(e.target.value)}
                        rows={8}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', fontFamily: 'monospace' }}
                        placeholder={activeTab === 'text' ? "New text..." : "{ ... }"}
                    />
                </div>
            </div>

            {jsonError && activeTab === 'json' && (
                <div style={{ color: '#f44336', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} /> {jsonError}
                </div>
            )}

            {/* Result */}
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: 10 }}>Diff Result</h3>
                <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6, background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                    {diffResult.map((part, index) => {
                        const style = {
                            backgroundColor: part.added ? '#e6ffec' : part.removed ? '#ffebe9' : 'transparent',
                            color: part.added ? '#2e7d32' : part.removed ? '#c62828' : '#333',
                            textDecoration: part.removed ? 'line-through' : 'none'
                        };
                        return (
                            <span key={index} style={style}>
                                {part.value}
                            </span>
                        );
                    })}
                    {diffResult.length === 0 && !jsonError && (
                        <span style={{ color: '#999' }}>No differences found or empty input.</span>
                    )}
                </div>
            </div>

        </ToolLayout>
    );
}
