"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Palette, Copy, Check } from 'lucide-react';
import { colord, extend, Colord } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

interface ColorFormat {
    label: string;
    value: string;
    key: string;
    placeholder?: string;
}

export default function ColorConverter() {
    // Current color state (source of truth is the colord object, but for inputs we need individual strings)
    // Actually, to support typing in any field, we update all fields on valid input.

    const [color, setColor] = useState<Colord>(colord('#1ea54c'));
    const [values, setValues] = useState<Record<string, string>>({
        hex: '#1ea54c',
        rgb: 'rgb(30, 165, 76)',
        hsl: 'hsl(140, 69%, 38%)',
        hwb: 'hwb(140, 12%, 35%)',
        lch: 'lch(60.67, 76.5, 147.2)',
        cmyk: 'cmyk(82, 0, 54, 35)',
        name: 'jungle green',
    });

    const updateAll = (c: Colord, sourceKey?: string) => {
        if (!c.isValid()) return;
        setColor(c);
        const newValues: Record<string, string> = {
            hex: c.toHex(),
            rgb: c.toRgbString(),
            hsl: c.toHslString(),
            hwb: c.toHwbString(),
            lch: c.toLchString(),
            cmyk: c.toCmykString(),
            name: c.toName({ closest: true }) || 'Unknown',
        };
        // Preserve the source input's exact string if it's valid, to avoid cursor jumping or reformatting while typing
        if (sourceKey) {
            newValues[sourceKey] = values[sourceKey];
            // Wait, this is tricky. If I type "rgb(0,0,  0)", I don't want it to become "rgb(0, 0, 0)" immediately?
            // Actually, for simplicity, let's just update all others. 
            // The input component should just call `updateFromInput` on change.
            // But if I bind `value` to state, I need to update state.
        }
        setValues(prev => ({ ...newValues, ...(sourceKey ? { [sourceKey]: prev[sourceKey] } : {}) }));
    };

    // Correct approach handles input change:
    // 1. Update the specific input value immediately.
    // 2. Try to parse color.
    // 3. If valid, update ALL OTHER inputs.

    const handleChange = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }));
        const c = colord(val);
        if (c.isValid()) {
            // Update others
            const newValues: Record<string, string> = {
                hex: c.toHex(),
                rgb: c.toRgbString(),
                hsl: c.toHslString(),
                hwb: c.toHwbString(),
                lch: c.toLchString(),
                cmyk: c.toCmykString(),
                name: c.toName({ closest: true }) || 'Unknown',
            };
            setValues(prev => {
                const updated = { ...newValues };
                updated[key] = val; // Keep current input as is
                return updated;
            });
            setColor(c);
        }
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; // Hex
        const c = colord(val);
        updateAll(c);
    }


    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={copy}
                style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: copied ? '#4CAF50' : '#666'
                }}
                title="Copy"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
        );
    };

    const formats = [
        { key: 'hex', label: 'HEX', placeholder: '#ff0000' },
        { key: 'rgb', label: 'RGB', placeholder: 'rgb(255, 0, 0)' },
        { key: 'hsl', label: 'HSL', placeholder: 'hsl(0, 100%, 50%)' },
        { key: 'hwb', label: 'HWB', placeholder: 'hwb(0, 0%, 0%)' },
        { key: 'lch', label: 'LCH', placeholder: 'lch(53, 104, 40)' },
        { key: 'cmyk', label: 'CMYK', placeholder: 'cmyk(0, 100%, 100%, 0)' },
        { key: 'name', label: 'Name', placeholder: 'red' },
    ];

    return (
        <ToolLayout
            title="Color Converter"
            description="Convert colors between formats (HEX, RGB, HSL, CMYK, etc.)"
            icon={Palette}
        >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {formats.map((f) => (
                            <div key={f.key} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: '5px 10px' }}>
                                <div style={{ width: 80, textAlign: 'right', paddingRight: 15, fontWeight: 500, color: '#555' }}>
                                    {f.label}
                                </div>
                                <input
                                    type="text"
                                    value={values[f.key]}
                                    onChange={(e) => handleChange(f.key, e.target.value)}
                                    placeholder={f.placeholder}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '10px',
                                        fontFamily: 'monospace',
                                        color: '#333'
                                    }}
                                />
                                <CopyButton text={values[f.key]} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        background: color.toHex(),
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        border: '2px solid #fff'
                    }} />
                    <input
                        type="color"
                        value={color.toHex()}
                        onChange={handlePickerChange}
                        style={{ width: '100%', height: 40, cursor: 'pointer' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {color.isValid() ? 'Valid Color' : 'Invalid Color'}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
