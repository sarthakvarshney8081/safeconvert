"use client";

import React, { useState, useEffect } from 'react';
import { Timer, Clock, Calculator, Plus, Minus, ArrowRight } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';

export default function EtaCalculator() {
    const [totalItems, setTotalItems] = useState<number>(186);
    const [startTime, setStartTime] = useState<string>(new Date().toISOString().slice(0, 16));
    const [itemsPerSpan, setItemsPerSpan] = useState<number>(3);
    const [spanValue, setSpanValue] = useState<number>(5);
    const [spanUnit, setSpanUnit] = useState<'seconds' | 'minutes' | 'hours'>('minutes');

    const [totalDuration, setTotalDuration] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    useEffect(() => {
        calculateEta();
    }, [totalItems, startTime, itemsPerSpan, spanValue, spanUnit]);

    const calculateEta = () => {
        if (!totalItems || !itemsPerSpan || !spanValue) return;

        // Convert span to minutes
        let spanInMinutes = spanValue;
        if (spanUnit === 'seconds') spanInMinutes = spanValue / 60;
        if (spanUnit === 'hours') spanInMinutes = spanValue * 60;

        // Calculate minutes per item
        const minutesPerItem = spanInMinutes / itemsPerSpan;
        const totalMinutesRequired = totalItems * minutesPerItem;

        // Format Duration
        const hours = Math.floor(totalMinutesRequired / 60);
        const minutes = Math.round(totalMinutesRequired % 60);
        const durationStr = `${hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} ` : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;
        setTotalDuration(durationStr);

        // Calculate End Time
        const start = new Date(startTime);
        const end = new Date(start.getTime() + totalMinutesRequired * 60000);

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        let prefix = '';
        if (end.toDateString() === now.toDateString()) prefix = 'today at ';
        else if (end.toDateString() === tomorrow.toDateString()) prefix = 'tomorrow at ';
        else prefix = `on ${end.toLocaleDateString()} at `;

        const timeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setEndTime(`${prefix}${timeStr}`);
    };

    return (
        <ToolLayout
            title="ETA Calculator"
            description="Predict task completion time based on your current progress rate."
            icon={Timer}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '30px' }}>

                {/* Inputs Section */}
                <div style={{
                    display: 'grid',
                    gap: '24px',
                    padding: '32px',
                    background: '#fff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Amount of elements to consume</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '10px 15px', border: '1px solid #e2e8f0' }}>
                                <input
                                    type="number"
                                    value={totalItems}
                                    onChange={(e) => setTotalItems(Number(e.target.value))}
                                    style={{ background: 'transparent', border: 'none', color: '#1e293b', fontSize: '1.1rem', width: '100%', outline: 'none', fontWeight: 500 }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setTotalItems(prev => Math.max(0, prev - 1))} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Minus size={14} /></button>
                                    <button onClick={() => setTotalItems(prev => prev + 1)} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Consumption started at</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: '#1e293b',
                                    borderRadius: '12px',
                                    padding: '10px 15px',
                                    fontSize: '1rem',
                                    width: '100%',
                                    outline: 'none',
                                    fontWeight: 500
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Rate of consumption</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                            <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '10px 15px', border: '1px solid #e2e8f0' }}>
                                <input
                                    type="number"
                                    value={itemsPerSpan}
                                    onChange={(e) => setItemsPerSpan(Number(e.target.value))}
                                    style={{ background: 'transparent', border: 'none', color: '#1e293b', fontSize: '1.1rem', width: '100%', outline: 'none', fontWeight: 500 }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setItemsPerSpan(prev => Math.max(0, prev - 1))} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Minus size={14} /></button>
                                    <button onClick={() => setItemsPerSpan(prev => prev + 1)} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Plus size={14} /></button>
                                </div>
                            </div>

                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>in</span>

                            <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '10px 15px', border: '1px solid #e2e8f0' }}>
                                <input
                                    type="number"
                                    value={spanValue}
                                    onChange={(e) => setSpanValue(Number(e.target.value))}
                                    style={{ background: 'transparent', border: 'none', color: '#1e293b', fontSize: '1.1rem', width: '100%', outline: 'none', fontWeight: 500 }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setSpanValue(prev => Math.max(0, prev - 1))} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Minus size={14} /></button>
                                    <button onClick={() => setSpanValue(prev => prev + 1)} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex' }}><Plus size={14} /></button>
                                </div>
                            </div>

                            <select
                                value={spanUnit}
                                onChange={(e) => setSpanUnit(e.target.value as any)}
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    color: '#1e293b',
                                    borderRadius: '12px',
                                    padding: '11px 15px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    flex: '1 1 120px'
                                }}
                            >
                                <option value="seconds">seconds</option>
                                <option value="minutes">minutes</option>
                                <option value="hours">hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '32px', background: '#eff6ff', borderRadius: '24px', border: '1px solid #dbeafe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600, marginBottom: '15px' }}>
                            <Timer size={20} />
                            <span>Total duration</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a' }}>
                            {totalDuration}
                        </div>
                    </div>

                    <div style={{ padding: '32px', background: '#f5f3ff', borderRadius: '24px', border: '1px solid #ede9fe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8b5cf6', fontSize: '0.95rem', fontWeight: 600, marginBottom: '15px' }}>
                            <Clock size={20} />
                            <span>Estimated finish</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4c1d95' }}>
                            {endTime}
                        </div>
                    </div>
                </div>

                {/* Info Tip */}
                <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <Calculator size={22} color="#64748b" style={{ marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6' }}>
                        <strong>Quick Example:</strong> If you process <strong>3 items</strong> every <strong>5 minutes</strong> and have <strong>186 items</strong> left, the tool calculates exactly how long you have left and when you'll be done.
                    </p>
                </div>

            </div>
        </ToolLayout>
    );
}
