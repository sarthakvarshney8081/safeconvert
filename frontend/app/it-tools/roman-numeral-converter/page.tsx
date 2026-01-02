"use client";

import React, { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Type, Copy, Check } from 'lucide-react';
import {
    arabicToRoman,
    romanToArabic,
    isValidRomanNumber,
    MIN_ARABIC_TO_ROMAN,
    MAX_ARABIC_TO_ROMAN
} from './utils';

export default function RomanNumeralConverter() {
    const [inputArabic, setInputArabic] = useState<string>('42');
    const [inputRoman, setInputRoman] = useState('XLII');

    const outputRoman = useMemo(() => {
        const num = parseInt(inputArabic, 10);
        if (isNaN(num)) return '';
        return arabicToRoman(num);
    }, [inputArabic]);

    const outputArabic = useMemo(() => {
        return romanToArabic(inputRoman);
    }, [inputRoman]);

    const isArabicValid = useMemo(() => {
        const num = parseInt(inputArabic, 10);
        return !isNaN(num) && num >= MIN_ARABIC_TO_ROMAN && num <= MAX_ARABIC_TO_ROMAN;
    }, [inputArabic]);

    const isRomanValid = useMemo(() => {
        return isValidRomanNumber(inputRoman);
    }, [inputRoman]);

    const CopyButton = ({ text, disabled }: { text: string, disabled?: boolean }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            if (disabled || !text) return;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <button
                onClick={copy}
                disabled={disabled || !text}
                style={{
                    padding: '8px 16px',
                    background: disabled ? '#ccc' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                Copy
            </button>
        );
    };

    return (
        <ToolLayout
            title="Roman Numeral Converter"
            description="Convert numbers between Arabic and Roman numerals."
            icon={Type}
        >
            <div style={{ display: 'grid', gap: 40 }}>
                {/* Arabic to Roman */}
                <div className="card" style={{ padding: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 15, color: '#444' }}>Arabic to Roman</h3>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <input
                                type="number"
                                value={inputArabic}
                                onChange={(e) => setInputArabic(e.target.value)}
                                min={MIN_ARABIC_TO_ROMAN}
                                max={MAX_ARABIC_TO_ROMAN}
                                placeholder="e.g. 42"
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: isArabicValid ? '1px solid #ddd' : '1px solid #f44336',
                                    borderRadius: 8,
                                    fontSize: '1rem'
                                }}
                            />
                            {!isArabicValid && (
                                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: 5 }}>
                                    Must be between {MIN_ARABIC_TO_ROMAN} and {MAX_ARABIC_TO_ROMAN}
                                </div>
                            )}
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50', minWidth: 100, textAlign: 'center' }}>
                            {outputRoman || '-'}
                        </div>

                        <CopyButton text={outputRoman} disabled={!outputRoman} />
                    </div>
                </div>

                {/* Roman to Arabic */}
                <div className="card" style={{ padding: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 15, color: '#444' }}>Roman to Arabic</h3>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <input
                                type="text"
                                value={inputRoman}
                                onChange={(e) => setInputRoman(e.target.value.toUpperCase())}
                                placeholder="e.g. XLII"
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    border: isRomanValid ? '1px solid #ddd' : '1px solid #f44336',
                                    borderRadius: 8,
                                    fontSize: '1rem'
                                }}
                            />
                            {!isRomanValid && inputRoman && (
                                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: 5 }}>
                                    Invalid Roman numeral
                                </div>
                            )}
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50', minWidth: 100, textAlign: 'center' }}>
                            {outputArabic !== null ? outputArabic : '-'}
                        </div>

                        <CopyButton text={String(outputArabic || '')} disabled={outputArabic === null} />
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
