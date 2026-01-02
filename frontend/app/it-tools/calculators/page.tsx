"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Calculator, Percent, Thermometer, Clock } from 'lucide-react';
import * as math from 'mathjs';

export default function Calculators() {
    const [activeTab, setActiveTab] = useState<'math' | 'percent' | 'temp' | 'eta'>('math');

    // Math State
    const [mathInput, setMathInput] = useState('sqrt(16) + 5^2');
    const [mathResult, setMathResult] = useState('');

    // Percent State
    const [percentType, setPercentType] = useState<'what_percent' | 'percent_of' | 'change'>('what_percent');
    const [valA, setValA] = useState(10);
    const [valB, setValB] = useState(50);
    const [percentStart, setPercentStart] = useState(100);
    const [percentEnd, setPercentEnd] = useState(150);
    const [percentResult, setPercentResult] = useState('');

    // Temp State
    const [tempValue, setTempValue] = useState(25);
    const [tempUnit, setTempUnit] = useState<'c' | 'f' | 'k'>('c');
    const [tempResults, setTempResults] = useState({ c: 25, f: 77, k: 298.15 });

    // ETA State
    const [etaSize, setEtaSize] = useState(1024); // MB
    const [etaSpeed, setEtaSpeed] = useState(10); // MB/s
    const [etaResult, setEtaResult] = useState('');

    // Math Logic
    useEffect(() => {
        if (activeTab === 'math') {
            try {
                if (!mathInput.trim()) { setMathResult(''); return; }
                const res = math.evaluate(mathInput);
                setMathResult(String(res));
            } catch (e) {
                setMathResult('Error');
            }
        }
    }, [mathInput, activeTab]);

    // Percent Logic
    useEffect(() => {
        if (activeTab === 'percent') {
            let res = '';
            if (percentType === 'what_percent') {
                // X is what % of Y
                if (valB !== 0) res = `${((valA / valB) * 100).toFixed(2)}%`;
            } else if (percentType === 'percent_of') {
                // X% of Y
                res = String((valA / 100) * valB);
            } else if (percentType === 'change') {
                // % change from X to Y
                if (percentStart !== 0) {
                    const change = ((percentEnd - percentStart) / percentStart) * 100;
                    res = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                }
            }
            setPercentResult(res);
        }
    }, [valA, valB, percentType, percentStart, percentEnd, activeTab]);

    // Temp Logic
    useEffect(() => {
        if (activeTab === 'temp') {
            let c = 0, f = 0, k = 0;
            if (tempUnit === 'c') {
                c = tempValue;
                f = (c * 9 / 5) + 32;
                k = c + 273.15;
            } else if (tempUnit === 'f') {
                f = tempValue;
                c = (f - 32) * 5 / 9;
                k = c + 273.15;
            } else if (tempUnit === 'k') {
                k = tempValue;
                c = k - 273.15;
                f = (c * 9 / 5) + 32;
            }
            setTempResults({ c, f, k });
        }
    }, [tempValue, tempUnit, activeTab]);

    // ETA Logic
    useEffect(() => {
        if (activeTab === 'eta') {
            if (etaSpeed <= 0) { setEtaResult('Inf'); return; }
            const totalSeconds = etaSize / etaSpeed; // MB / MB/s = seconds

            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = Math.floor(totalSeconds % 60);

            setEtaResult(`${h}h ${m}m ${s}s`);
        }
    }, [etaSize, etaSpeed, activeTab]);

    return (
        <ToolLayout
            title="Calculators"
            description="Math, Percentage, Temperature, and ETA calculators."
            icon={Calculator}
        >
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20, overflowX: 'auto' }}>
                <button onClick={() => setActiveTab('math')} style={tabStyle(activeTab === 'math')}>
                    <Calculator size={16} /> Math
                </button>
                <button onClick={() => setActiveTab('percent')} style={tabStyle(activeTab === 'percent')}>
                    <Percent size={16} /> Percentage
                </button>
                <button onClick={() => setActiveTab('temp')} style={tabStyle(activeTab === 'temp')}>
                    <Thermometer size={16} /> Temperature
                </button>
                <button onClick={() => setActiveTab('eta')} style={tabStyle(activeTab === 'eta')}>
                    <Clock size={16} /> ETA
                </button>
            </div>

            {/* Math */}
            {activeTab === 'math' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Expression Evaluator</h3>
                    <input
                        type="text"
                        value={mathInput}
                        onChange={(e) => setMathInput(e.target.value)}
                        placeholder="e.g. 10 * 5 + sqrt(16)"
                        style={inputStyle}
                    />
                    <div style={resultStyle}>{mathResult}</div>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Supports standard math operators, functions (sin, cos, log, sqrt), and units.</p>
                </div>
            )}

            {/* Percent */}
            {activeTab === 'percent' && (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ marginBottom: 15 }}>
                        <select
                            value={percentType}
                            onChange={(e) => setPercentType(e.target.value as any)}
                            style={inputStyle}
                        >
                            <option value="what_percent">What % of Y is X?</option>
                            <option value="percent_of">What is X% of Y?</option>
                            <option value="change">% Change (Increase/Decrease)</option>
                        </select>
                    </div>

                    {(percentType === 'what_percent' || percentType === 'percent_of') && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="number" value={valA} onChange={(e) => setValA(parseFloat(e.target.value))} style={inputStyle} />
                            <span>{percentType === 'what_percent' ? 'is what % of' : '% of'}</span>
                            <input type="number" value={valB} onChange={(e) => setValB(parseFloat(e.target.value))} style={inputStyle} />
                        </div>
                    )}

                    {percentType === 'change' && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input type="number" value={percentStart} onChange={(e) => setPercentStart(parseFloat(e.target.value))} style={inputStyle} placeholder="Start" />
                            <span>to</span>
                            <input type="number" value={percentEnd} onChange={(e) => setPercentEnd(parseFloat(e.target.value))} style={inputStyle} placeholder="End" />
                        </div>
                    )}

                    <div style={{ ...resultStyle, marginTop: 20 }}>{percentResult}</div>
                </div>
            )}

            {/* Temp */}
            {activeTab === 'temp' && (
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <input type="number" value={tempValue} onChange={(e) => setTempValue(parseFloat(e.target.value))} style={inputStyle} />
                        <select value={tempUnit} onChange={(e) => setTempUnit(e.target.value as any)} style={inputStyle}>
                            <option value="c">Celsius (°C)</option>
                            <option value="f">Fahrenheit (°F)</option>
                            <option value="k">Kelvin (K)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3" style={{ gap: 20 }}>
                        <TempBox label="Celsius" val={tempResults.c.toFixed(2)} />
                        <TempBox label="Fahrenheit" val={tempResults.f.toFixed(2)} />
                        <TempBox label="Kelvin" val={tempResults.k.toFixed(2)} />
                    </div>
                </div>
            )}

            {/* ETA */}
            {activeTab === 'eta' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Transfer ETA</h3>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                        <div style={{ flex: 1 }}>
                            <label>File Size (MB)</label>
                            <input type="number" value={etaSize} onChange={(e) => setEtaSize(parseFloat(e.target.value))} style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Speed (MB/s)</label>
                            <input type="number" value={etaSpeed} onChange={(e) => setEtaSpeed(parseFloat(e.target.value))} style={inputStyle} />
                        </div>
                    </div>
                    <div style={resultStyle}>{etaResult}</div>
                </div>
            )}

        </ToolLayout>
    );
}

const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    borderBottom: active ? '2px solid var(--primary)' : 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--primary)' : '#666',
    display: 'flex', alignItems: 'center', gap: 8,
    whiteSpace: 'nowrap' as const
});

const inputStyle = {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%'
};

const resultStyle = {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: 20,
    borderRadius: 8,
    fontSize: '1.5rem',
    fontWeight: 700,
    textAlign: 'center' as const,
    marginTop: 10
};

const TempBox = ({ label, val }: { label: string, val: string }) => (
    <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontWeight: 600, color: '#333' }}>{label}</div>
        <div style={{ fontSize: '1.2rem', marginTop: 5 }}>{val}</div>
    </div>
);
