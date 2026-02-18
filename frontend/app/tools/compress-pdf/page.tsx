"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';

export default function CompressPdfTool() {
    // State for UI options
    const [mode, setMode] = React.useState<'basic' | 'strong' | 'preset' | 'target' | 'email'>('basic');
    const [presetType, setPresetType] = React.useState('screen');
    const [targetSize, setTargetSize] = React.useState('1.0');

    const processFile = async (files: File[], options: any) => {
        if (files.length === 0) throw new Error("No file selected");
        const file = files[0];

        // Construct level param for Backend (Ghostscript)
        // Mappings:
        // basic  -> /ebook (150 dpi)
        // strong -> /screen (72 dpi)
        // email  -> /screen (72 dpi)
        // preset -> passes value directly (screen, ebook, printer)
        // target -> /screen (fallback)

        let level = "ebook";

        switch (mode) {
            case 'basic': level = "basic"; break;
            case 'strong': level = "strong"; break;
            case 'email': level = "email"; break;
            case 'preset': level = presetType; break;
            case 'target': level = "target"; break;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("level", level);

        if (mode === 'target') {
            formData.append("target_size", targetSize);
        }

        // Server-Side Processing
        const response = await fetch('/api/optimize/compress', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Compression failed");
        }

        const blob = await response.blob();
        return blob;
    };

    return (
        <ToolInterface
            title="Compress PDF"
            description="Reduce file size using server-side optimization (Ghostscript)."
            accept=".pdf"
            onProcess={processFile}
            resultFileName="compressed.pdf"
            maxSize={100 * 1024 * 1024} // 100MB
            optionsComponent={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                        ℹ️ Using Server-Side Compression (Ghostscript) for maximum efficiency.
                    </div>

                    {/* Basic */}
                    <label style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: 10, border: mode === 'basic' ? '2px solid #0070f3' : '1px solid #eaeaea', borderRadius: 8, background: mode === 'basic' ? '#f0f9ff' : 'white' }}>
                        <input type="radio" checked={mode === 'basic'} onChange={() => setMode('basic')} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Basic compression</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Standard quality (150 dpi). Good for documents.</div>
                        </div>
                    </label>

                    {/* Strong */}
                    <label style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: 10, border: mode === 'strong' ? '2px solid #0070f3' : '1px solid #eaeaea', borderRadius: 8, background: mode === 'strong' ? '#f0f9ff' : 'white' }}>
                        <input type="radio" checked={mode === 'strong'} onChange={() => setMode('strong')} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Strong compression</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Low quality (72 dpi). Best for screen viewing/web.</div>
                        </div>
                    </label>

                    {/* Preset */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, border: mode === 'preset' ? '2px solid #0070f3' : '1px solid #eaeaea', borderRadius: 8, background: mode === 'preset' ? '#f0f9ff' : 'white' }}>
                        <input type="radio" checked={mode === 'preset'} onChange={() => setMode('preset')} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: 5 }}>Specific Quality Preset</div>
                            <select
                                value={presetType}
                                onChange={(e) => setPresetType(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={mode !== 'preset'}
                                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                            >
                                <option value="screen">Screen (72 dpi)</option>
                                <option value="ebook">Ebook (150 dpi)</option>
                                <option value="printer">Printer (300 dpi)</option>
                                <option value="prepress">Prepress (High Color Fidelity)</option>
                            </select>
                        </div>
                    </label>

                    {/* Target Size */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, border: mode === 'target' ? '2px solid #0070f3' : '1px solid #eaeaea', borderRadius: 8, background: mode === 'target' ? '#f0f9ff' : 'white' }}>
                        <input type="radio" checked={mode === 'target'} onChange={() => setMode('target')} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600 }}>Compress to target file size <span style={{ fontSize: '0.7rem', background: '#0070f3', color: 'white', padding: '2px 4px', borderRadius: 4 }}>BETA</span></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={targetSize}
                                    onChange={(e) => setTargetSize(e.target.value)}
                                    disabled={mode !== 'target'}
                                    style={{ width: 80, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                                />
                                <span style={{ color: '#666' }}>MB</span>
                            </div>
                        </div>
                    </label>

                    {/* Email */}
                    <label style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: 10, border: mode === 'email' ? '2px solid #0070f3' : '1px solid #eaeaea', borderRadius: 8, background: mode === 'email' ? '#f0f9ff' : 'white' }}>
                        <input type="radio" checked={mode === 'email'} onChange={() => setMode('email')} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Compress for email</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Maximum compression (72 dpi)</div>
                        </div>
                    </label>
                </div>
            }
        />
    );
}
