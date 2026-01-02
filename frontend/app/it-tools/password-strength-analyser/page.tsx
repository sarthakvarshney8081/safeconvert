"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import zxcvbn from 'zxcvbn';

export default function PasswordStrength() {
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<any>(null);

    const checkStrength = (val: string) => {
        setPassword(val);
        if (!val) {
            setResult(null);
            return;
        }
        const res = zxcvbn(val);
        setResult(res);
    };

    const getScoreColor = (score: number) => {
        switch (score) {
            case 0: return '#e53935'; // Very weak
            case 1: return '#fb8c00'; // Weak
            case 2: return '#fdd835'; // Fair
            case 3: return '#7cb342'; // Good
            case 4: return '#43a047'; // Strong
            default: return '#eee';
        }
    };

    const getScoreLabel = (score: number) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    return (
        <ToolLayout
            title="Password Strength Analyser"
            description="Estimate the strength of your password against cracking attacks."
            icon={ShieldCheck}
        >
            <div style={{ display: 'grid', gap: '30px' }}>

                {/* Input */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>Password</label>
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => checkStrength(e.target.value)}
                        placeholder="Type password to analyze..."
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '12px',
                            border: '1px solid #ddd',
                            fontSize: '1.2rem'
                        }}
                    />
                </div>

                {/* Analysis Result */}
                {result && (
                    <div className="card" style={{ background: '#fafafa', border: 'none' }}>

                        {/* Score Indicator */}
                        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(result.score), marginBottom: '10px' }}>
                                {getScoreLabel(result.score)}
                            </div>
                            <div style={{ height: '10px', width: '100%', background: '#eee', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            background: i <= result.score ? getScoreColor(result.score) : 'transparent',
                                            borderRight: i < 4 ? '2px solid #fff' : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Crack Times */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Online (No Throttling)</div>
                                <div style={{ fontWeight: 600 }}>{result.crack_times_display.online_no_throttling_10_per_second}</div>
                            </div>
                            <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Online (Throttled)</div>
                                <div style={{ fontWeight: 600 }}>{result.crack_times_display.online_throttling_100_per_hour}</div>
                            </div>
                            <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Offline (Slow Hash)</div>
                                <div style={{ fontWeight: 600 }}>{result.crack_times_display.offline_slow_hashing_1e4_per_second}</div>
                            </div>
                            <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Offline (Fast Hash)</div>
                                <div style={{ fontWeight: 600 }}>{result.crack_times_display.offline_fast_hashing_1e10_per_second}</div>
                            </div>
                        </div>

                        {/* Feedback */}
                        {(result.feedback.warning || result.feedback.suggestions.length > 0) && (
                            <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '12px', color: '#e65100' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontWeight: 600 }}>
                                    <AlertTriangle size={20} /> Recommendations
                                </div>
                                {result.feedback.warning && <p style={{ fontWeight: 600, marginBottom: '10px' }}>{result.feedback.warning}</p>}
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {result.feedback.suggestions.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
