"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Image as ImageIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SvgPlaceholderContent() {
    const [svgW, setSvgW] = useState(300);
    const [svgH, setSvgH] = useState(150);
    const [svgBg, setSvgBg] = useState('#cccccc');
    const [svgFg, setSvgFg] = useState('#969696');
    const [svgText, setSvgText] = useState('');
    const [svgCode, setSvgCode] = useState('');

    useEffect(() => {
        const txt = svgText || `${svgW}x${svgH}`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="100%" height="100%" fill="${svgBg}"/>
  <text x="50%" y="50%" fontFamily="sans-serif" fontSize="20" dy=".3em" textAnchor="middle" fill="${svgFg}">${txt}</text>
</svg>`;
        setSvgCode(svg);
    }, [svgW, svgH, svgBg, svgFg, svgText]);

    const handleDownloadSvg = () => {
        const blob = new Blob([svgCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'placeholder.svg';
        a.click();
    };

    return (
        <ToolLayout
            title="SVG Placeholder"
            description="Generate simple SVG placeholder images."
            icon={ImageIcon}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>SVG Placeholder Generator</h3>
                <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 15, marginBottom: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Width</label>
                        <input type="number" value={svgW} onChange={(e) => setSvgW(parseInt(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Height</label>
                        <input type="number" value={svgH} onChange={(e) => setSvgH(parseInt(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Bg Color</label>
                        <input type="color" value={svgBg} onChange={(e) => setSvgBg(e.target.value)} style={{ ...inputStyle, padding: 5, height: 42 }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Text Color</label>
                        <input type="color" value={svgFg} onChange={(e) => setSvgFg(e.target.value)} style={{ ...inputStyle, padding: 5, height: 42 }} />
                    </div>
                    <div className="md:col-span-4">
                        <label style={{ display: 'block', marginBottom: 5 }}>Custom Text (Optional)</label>
                        <input type="text" value={svgText} onChange={(e) => setSvgText(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                <div style={{ marginBottom: 20, textAlign: 'center', background: '#f5f5f5', padding: 20, borderRadius: 8, overflow: 'auto' }}>
                    <div dangerouslySetInnerHTML={{ __html: svgCode }} />
                </div>

                <textarea readOnly value={svgCode} rows={5} style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    marginBottom: 15
                }} />

                <button onClick={handleDownloadSvg} style={btnStyle}>Download SVG</button>
            </div>
        </ToolLayout>
    );
}

const inputStyle = {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%'
};

const btnStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    background: '#e91e63'
};

export default function SvgPlaceholder() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SvgPlaceholderContent />
        </Suspense>
    );
}
