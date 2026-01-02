"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = 'force-dynamic';

function WifiQrContent() {
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
    const [hidden, setHidden] = useState(false);
    const [wifiQrVal, setWifiQrVal] = useState('');

    useEffect(() => {
        // WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;H:<true|false|>;
        let t = wifiType === 'nopass' ? '' : wifiType;
        const res = `WIFI:S:${wifiSsid};T:${t};P:${wifiPass};H:${hidden};;`;
        setWifiQrVal(res);
    }, [wifiSsid, wifiPass, wifiType, hidden]);

    return (
        <ToolLayout
            title="WiFi QR Code"
            description="Generate QR codes for WiFi connections."
            icon={Wifi}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>WiFi Login QR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20, marginBottom: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>SSID (Network Name)</label>
                        <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
                        <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Encryption</label>
                        <select value={wifiType} onChange={(e) => setWifiType(e.target.value as any)} style={inputStyle}>
                            <option value="WPA">WPA/WPA2/WPA3</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                            Hidden Network
                        </label>
                    </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                        <QRCodeSVG value={wifiQrVal} size={256} />
                        <div style={{ marginTop: 10, color: '#666', fontSize: '0.9rem' }}>Scan with camera to connect</div>
                    </div>
                </div>
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

export default function WifiQrCode() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WifiQrContent />
        </Suspense>
    );
}
