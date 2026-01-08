"use client";

import React, { useState, useEffect, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Clock, Plus, X, Globe, Calendar, Search } from 'lucide-react';
import { DateTime } from 'luxon';

const COMMON_TIMEZONES = [
    { label: 'UTC (GMT)', value: 'UTC' },
    { label: 'London (GMT/BST)', value: 'Europe/London' },
    { label: 'New York (EST/EDT)', value: 'America/New_York' },
    { label: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'India (IST)', value: 'Asia/Kolkata' },
    { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
    { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
    { label: 'Berlin (CET/CEST)', value: 'Europe/Berlin' },
    { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
    { label: 'Sao Paulo (BRT)', value: 'America/Sao_Paulo' },
    { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
    { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong' },
    { label: 'Seoul (KST)', value: 'Asia/Seoul' },
];

export default function TimezoneConverter() {
    const [selectedZones, setSelectedZones] = useState(['UTC', 'Asia/Kolkata', 'America/New_York']);
    const [baseTime, setBaseTime] = useState(DateTime.now());
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Update real time every minute if not manually adjusted? 
    // Actually, for a converter, manual adjustment is key. 
    // But we start with "Now".

    const filteredZones = useMemo(() => {
        if (!searchQuery) return COMMON_TIMEZONES.filter(z => !selectedZones.includes(z.value));
        return COMMON_TIMEZONES.filter(z =>
            !selectedZones.includes(z.value) &&
            (z.label.toLowerCase().includes(searchQuery.toLowerCase()) || z.value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, selectedZones]);

    const addZone = (zone: string) => {
        setSelectedZones([...selectedZones, zone]);
        setSearchQuery('');
        setIsAdding(false);
    };

    const removeZone = (zone: string) => {
        setSelectedZones(selectedZones.filter(z => z !== zone));
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hours = parseInt(e.target.value);
        setBaseTime(baseTime.set({ hour: hours, minute: 0, second: 0, millisecond: 0 }));
    };

    return (
        <ToolLayout
            title="Timezone Converter"
            description="Compare and convert times across multiple timezones simultaneously."
            icon={Globe}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                {/* Master Time Slider */}
                <div style={{
                    padding: '32px',
                    background: '#fff',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Time Slider</h3>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Drag the slider to adjust the time for all zones below.</p>
                        </div>
                        <div style={{
                            padding: '12px 20px',
                            background: '#eff6ff',
                            borderRadius: '12px',
                            border: '1px solid #dbeafe',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: '1.1rem'
                        }}>
                            {baseTime.toFormat('HH:mm')} (Selected)
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="23"
                        value={baseTime.hour}
                        onChange={handleHourChange}
                        style={{
                            width: '100%',
                            height: '8px',
                            background: '#e2e8f0',
                            borderRadius: '4px',
                            appearance: 'none',
                            cursor: 'pointer',
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#94a3b8', fontSize: '0.8rem' }}>
                        <span>12 AM</span>
                        <span>6 AM</span>
                        <span>12 PM</span>
                        <span>6 PM</span>
                        <span>11 PM</span>
                    </div>
                </div>

                {/* Timezone Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>Selected Timezones</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 16px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Plus size={18} />
                            Add Zone
                        </button>
                    </div>

                    {isAdding && (
                        <div style={{
                            position: 'relative',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            marginBottom: 8
                        }}>
                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search timezone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {filteredZones.map(zone => (
                                    <button
                                        key={zone.value}
                                        onClick={() => addZone(zone.value)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            color: '#475569',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {zone.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                        {selectedZones.map(zone => {
                            const time = baseTime.setZone(zone);
                            const zoneData = COMMON_TIMEZONES.find(z => z.value === zone) || { label: zone, value: zone };
                            const isNextDay = time.day > baseTime.day;
                            const isPrevDay = time.day < baseTime.day;

                            return (
                                <div key={zone} style={{
                                    padding: '24px',
                                    background: '#fff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#64748b'
                                        }}>
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{zoneData.label}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{zone}</span>
                                                {isNextDay && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 600 }}>+1 day</span>}
                                                {isPrevDay && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#fff1f2', color: '#e11d48', borderRadius: '4px', fontWeight: 600 }}>-1 day</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                                                {time.toFormat('HH:mm')}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {time.toFormat('ccc, MMM dd')}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeZone(zone)}
                                            style={{
                                                padding: '8px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#cbd5e1',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.color = '#ef4444';
                                                e.currentTarget.style.background = '#fef2f2';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.color = '#cbd5e1';
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Helper Section */}
                <div style={{
                    padding: '24px',
                    background: '#f8fafc',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={18} color="#2563eb" />
                        Why use a Timezone Converter?
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                        Scheduling meetings across different continents can be tricky. This tool helps you visualize how a specific time reflects across multiple timezones simultaneously.
                        The slider allows you to sweep through the day to find the perfect overlap for international teams.
                    </p>
                </div>

            </div>
        </ToolLayout>
    );
}
