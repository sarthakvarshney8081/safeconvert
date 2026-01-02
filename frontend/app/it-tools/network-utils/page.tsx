"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Network, Globe, Fingerprint } from 'lucide-react';
import { Address4 } from 'ip-address';

export default function NetworkUtils() {
    const [activeTab, setActiveTab] = useState<'ipv4' | 'ipv6' | 'mac'>('ipv4');

    // IPv4 State
    const [cidrInput, setCidrInput] = useState('192.168.1.0/24');
    const [ipv4Result, setIpv4Result] = useState<any>(null);

    // IPv6 ULA State
    const [ulaResult, setUlaResult] = useState<string>('');

    // MAC State
    const [macInput, setMacInput] = useState('');
    const [macResult, setMacResult] = useState('');

    // IPv4 Logic
    useEffect(() => {
        if (activeTab === 'ipv4') {
            try {
                if (!cidrInput.trim()) { setIpv4Result(null); return; }
                const addr = new Address4(cidrInput);
                setIpv4Result({
                    network: addr.startAddress().address,
                    broadcast: addr.endAddress().address,
                    netmask: addr.subnetMask, // Note: ip-address might have different proerty or standard parsing
                    // Manual fallback if lib doesn't expose easy subnet props directly in this version
                    // Using basic calculations for standard display
                    start: addr.startAddress().address,
                    end: addr.endAddress().address,
                    hosts: Math.pow(2, 32 - parseInt(cidrInput.split('/')[1] || '32')) - 2
                });
            } catch (e) {
                // Ignore invalid input while typing
            }
        }
    }, [cidrInput, activeTab]);

    // IPv6 ULA Logic
    const generateULA = () => {
        // RFC 4193: fd00::/8 + 40 bits random global ID + 16 bits subnet ID
        const randomHex = (len: number) => {
            let s = '';
            for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
            return s;
        };
        const globalId = randomHex(10);
        const subnetId = randomHex(4);
        setUlaResult(`fd${globalId.substring(0, 2)}:${globalId.substring(2, 6)}:${globalId.substring(6, 10)}:${subnetId}::/64`);
    };

    // MAC Logic
    const generateMac = () => {
        const hex = '0123456789ABCDEF';
        let mac = '';
        for (let i = 0; i < 6; i++) {
            mac += hex.charAt(Math.floor(Math.random() * 16));
            mac += hex.charAt(Math.floor(Math.random() * 16));
            if (i < 5) mac += ':';
        }
        setMacInput(mac);
    };

    // Format MAC
    useEffect(() => {
        if (activeTab === 'mac' && macInput) {
            const clean = macInput.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
            if (clean.length === 12) {
                const colon = clean.match(/.{1,2}/g)?.join(':');
                const dash = clean.match(/.{1,2}/g)?.join('-');
                const dot = clean.match(/.{1,4}/g)?.join('.');
                setMacResult(`Colon: ${colon}\nDash:  ${dash}\nDot:   ${dot}`);
            } else {
                setMacResult('');
            }
        }
    }, [macInput, activeTab]);


    return (
        <ToolLayout
            title="Network Utilities"
            description="IPv4 Subnet, IPv6 Generator, and MAC Address tools."
            icon={Network}
        >
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button onClick={() => setActiveTab('ipv4')} style={tabStyle(activeTab === 'ipv4')}>
                    <Network size={16} /> IPv4 Subnet
                </button>
                <button onClick={() => setActiveTab('ipv6')} style={tabStyle(activeTab === 'ipv6')}>
                    <Globe size={16} /> IPv6 ULA
                </button>
                <button onClick={() => setActiveTab('mac')} style={tabStyle(activeTab === 'mac')}>
                    <Fingerprint size={16} /> MAC Address
                </button>
            </div>

            {/* IPv4 */}
            {activeTab === 'ipv4' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>IPv4 Subnet Calculator</h3>
                    <input
                        type="text"
                        value={cidrInput}
                        onChange={(e) => setCidrInput(e.target.value)}
                        placeholder="e.g. 192.168.1.0/24"
                        style={inputStyle}
                    />
                    {ipv4Result && (
                        <div className="grid grid-cols-2" style={{ gap: 20, marginTop: 20 }}>
                            <InfoBox label="Network Address" val={ipv4Result.network} />
                            <InfoBox label="Broadcast Address" val={ipv4Result.broadcast} />
                            <InfoBox label="Subnet Mask" val={ipv4Result.netmask} />
                            <InfoBox label="Usable Hosts" val={ipv4Result.hosts > 0 ? ipv4Result.hosts : 0} />
                            <InfoBox label="Host Range" val={`${ipv4Result.start} - ${ipv4Result.end}`} full />
                        </div>
                    )}
                </div>
            )}

            {/* IPv6 */}
            {activeTab === 'ipv6' && (
                <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0 }}>Unique Local Address (ULA) Generator</h3>
                    <p style={{ color: '#666', marginBottom: 20 }}>Generates a random RFC4193 compliant private IPv6 range.</p>
                    <button onClick={generateULA} style={{ ...btnStyle, background: '#2196f3', margin: '0 auto' }}>Generate New</button>
                    {ulaResult && (
                        <div style={{ marginTop: 20, background: '#e3f2fd', padding: 20, borderRadius: 8, fontSize: '1.5rem', fontFamily: 'monospace', color: '#1565c0' }}>
                            {ulaResult}
                        </div>
                    )}
                </div>
            )}

            {/* MAC */}
            {activeTab === 'mac' && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>MAC Address Tools</h3>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <input
                            type="text"
                            value={macInput}
                            onChange={(e) => setMacInput(e.target.value)}
                            placeholder="Enter MAC Address..."
                            style={inputStyle}
                        />
                        <button onClick={generateMac} style={{ ...btnStyle, background: '#607d8b' }}>Random</button>
                    </div>
                    <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, fontFamily: 'monospace', color: '#333' }}>
                        {macResult || 'Enter valid 12-char hex to format...'}
                    </pre>
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
    display: 'flex', alignItems: 'center', gap: 8
});

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
    fontWeight: 600
};

const InfoBox = ({ label, val, full }: { label: string, val: any, full?: boolean }) => (
    <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 8, gridColumn: full ? 'span 2' : 'span 1' }}>
        <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: 5 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: '1.1rem', wordBreak: 'break-all' }}>{val}</div>
    </div>
);
