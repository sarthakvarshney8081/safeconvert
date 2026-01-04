"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Type, AlignLeft, BarChart2, Smile } from 'lucide-react';
import { LoremIpsum } from "lorem-ipsum";
import figlet from 'figlet';
// For figlet to work in browser, we often need to load fonts. 
// However, the basic 'Standard' font is usually embedded or requires setup. 
// We will try basic import first, or fallback to simple mapping if needed.
// IMPORTANT: figlet.js in browser requires fonts to be fetched usually. 
// We'll try a simplified approach or just standard text stats + lorem first to avoid complex async font loading issues for now if figlet fails.

import figletFonts from 'figlet/importable-fonts/Standard.js';

export default function TextManipulation() {
    const [activeTab, setActiveTab] = useState<'lorem' | 'stats' | 'ascii'>('lorem');

    // Lorem State
    const [loremCount, setLoremCount] = useState(3);
    const [loremType, setLoremType] = useState<'paragraphs' | 'sentences'>('paragraphs');
    const [loremResult, setLoremResult] = useState('');

    // Stats State
    const [statsInput, setStatsInput] = useState('Type or paste your text here to get statistics...');
    const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0, sentences: 0 });

    // ASCII State
    const [asciiInput, setAsciiInput] = useState('SafeConverts');
    const [asciiResult, setAsciiResult] = useState('');

    // Lorem Logic
    useEffect(() => {
        if (activeTab === 'lorem') {
            const lorem = new LoremIpsum({
                sentencesPerParagraph: {
                    max: 8,
                    min: 4
                },
                wordsPerSentence: {
                    max: 16,
                    min: 4
                }
            });
            if (loremType === 'paragraphs') {
                setLoremResult(lorem.generateParagraphs(loremCount));
            } else {
                setLoremResult(lorem.generateSentences(loremCount));
            }
        }
    }, [loremCount, loremType, activeTab]);

    // Stats Logic
    useEffect(() => {
        if (activeTab === 'stats') {
            const chars = statsInput.length;
            const words = statsInput.trim() ? statsInput.trim().split(/\s+/).length : 0;
            const lines = statsInput.split(/\r\n|\r|\n/).length;
            const sentences = statsInput.split(/[.!?]+/).length - 1 || 0;
            setStats({ chars, words, lines, sentences });
        }
    }, [statsInput, activeTab]);

    // ASCII Logic
    useEffect(() => {
        if (activeTab === 'ascii' && asciiInput) {
            figlet.parseFont('Standard', figletFonts);
            figlet.text(asciiInput, { font: 'Standard' }, (err, data) => {
                if (err) {
                    setAsciiResult('Error generating ASCII art');
                } else {
                    setAsciiResult(data || '');
                }
            });
        }
    }, [asciiInput, activeTab]);

    return (
        <ToolLayout
            title="Text Manipulation"
            description="Generate text, analyze content, and create ASCII art."
            icon={Type}
        >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('lorem')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'lorem' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'lorem' ? 600 : 400,
                        color: activeTab === 'lorem' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <AlignLeft size={16} /> Lorem Ipsum
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'stats' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'stats' ? 600 : 400,
                        color: activeTab === 'stats' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <BarChart2 size={16} /> Stats
                </button>
                <button
                    onClick={() => setActiveTab('ascii')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'ascii' ? '2px solid var(--primary)' : 'none',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'ascii' ? 600 : 400,
                        color: activeTab === 'ascii' ? 'var(--primary)' : '#666',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <Smile size={16} /> ASCII Art
                </button>
            </div>

            {activeTab === 'lorem' && (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Count</label>
                            <input
                                type="number"
                                value={loremCount}
                                onChange={(e) => setLoremCount(parseInt(e.target.value) || 1)}
                                min="1" max="100"
                                style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd', width: 80 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Type</label>
                            <select
                                value={loremType}
                                onChange={(e) => setLoremType(e.target.value as any)}
                                style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
                            >
                                <option value="paragraphs">Paragraphs</option>
                                <option value="sentences">Sentences</option>
                            </select>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        value={loremResult}
                        rows={10}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', background: '#f8f9fa' }}
                    />
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="card" style={{ padding: 20 }}>
                    <textarea
                        value={statsInput}
                        onChange={(e) => setStatsInput(e.target.value)}
                        rows={6}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 20 }}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 20 }}>
                        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1565c0' }}>{stats.chars}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Characters</div>
                        </div>
                        <div style={{ background: '#e8f5e9', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2e7d32' }}>{stats.words}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Words</div>
                        </div>
                        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef6c00' }}>{stats.lines}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Lines</div>
                        </div>
                        <div style={{ background: '#f3e5f5', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7b1fa2' }}>{stats.sentences}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Sentences</div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ascii' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>ASCII Art Generator</h3>
                    <input
                        type="text"
                        value={asciiInput}
                        onChange={(e) => setAsciiInput(e.target.value)}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 20, fontSize: '1.2rem' }}
                    />
                    <pre style={{
                        background: '#222',
                        color: '#0f0',
                        padding: 20,
                        borderRadius: 8,
                        overflowX: 'auto',
                        fontFamily: 'monospace',
                        minHeight: 100
                    }}>
                        {asciiResult}
                    </pre>
                </div>
            )}

        </ToolLayout>
    );
}
