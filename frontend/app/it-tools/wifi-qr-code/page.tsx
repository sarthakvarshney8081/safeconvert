"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Wifi, Download, FileJson, Image as ImageIcon, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

function WifiQrContent() {
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
    const [hidden, setHidden] = useState(false);
    const [wifiQrVal, setWifiQrVal] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // WIFI:S:<SSID>;T:<WPA|WEP|>;P:<password>;H:<true|false|>;
        let t = wifiType === 'nopass' ? '' : wifiType;
        const res = `WIFI:S:${wifiSsid};T:${t};P:${wifiPass};H:${hidden};;`;
        setWifiQrVal(res);
    }, [wifiSsid, wifiPass, wifiType, hidden]);

    const downloadAsImage = async () => {
        const element = document.getElementById('wifi-export-template');
        if (!element) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true });
            const link = document.createElement('a');
            link.download = `wifi-qr-${wifiSsid || 'network'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating image:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadAsPdf = async () => {
        const element = document.getElementById('wifi-export-template');
        if (!element) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(element, { backgroundColor: '#ffffff', cacheBust: true });

            // Get element dimensions
            const width = element.offsetWidth;
            const height = element.offsetHeight;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [width, height]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
            pdf.save(`wifi-qr-${wifiSsid || 'network'}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
        } finally {
            setIsDownloading(false);
        }
    };

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
                        <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} style={inputStyle} placeholder="Enter Network Name" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
                        <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} style={inputStyle} placeholder="Enter Password" />
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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', alignItems: 'flex-start' }}>
                    {/* Visual QR Card */}
                    <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #eee', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: 300 }}>
                        <QRCodeSVG value={wifiQrVal} size={200} />
                        <div style={{ marginTop: 15 }}>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{wifiSsid || 'Unnamed Network'}</div>
                            <div style={{ color: '#666', fontSize: '0.85rem' }}>Scan to connect</div>
                        </div>
                    </div>

                    {/* Download Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#444' }}>Export Connection Details</h4>
                        <button
                            onClick={downloadAsImage}
                            disabled={!wifiSsid || isDownloading}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', opacity: !wifiSsid || isDownloading ? 0.6 : 1 }}
                        >
                            <ImageIcon size={18} />
                            {isDownloading ? 'Generatng...' : 'Download as PNG'}
                        </button>
                        <button
                            onClick={downloadAsPdf}
                            disabled={!wifiSsid || isDownloading}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', opacity: !wifiSsid || isDownloading ? 0.6 : 1, background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }}
                        >
                            <FileText size={18} />
                            {isDownloading ? 'Generatng...' : 'Download as PDF'}
                        </button>
                    </div>
                </div>

                {/* Hidden Export Template */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div id="wifi-export-template" style={{
                        width: '400px',
                        padding: '40px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontFamily: 'sans-serif',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: 40 }}>
                            <img src="/logo.svg" alt="SafeConverts Logo" style={{ height: 45, width: 'auto' }} />
                        </div>

                        <div style={{
                            background: '#ffffff',
                            padding: '30px',
                            borderRadius: '32px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            marginBottom: 40
                        }}>
                            <QRCodeSVG value={wifiQrVal} size={240} level="H" includeMargin={true} />
                        </div>

                        <div style={{ marginBottom: 40 }}>
                            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Network SSID</div>
                            <h2 style={{ fontSize: '2.2rem', margin: 0, color: '#0f172a', fontWeight: 700 }}>{wifiSsid || 'Unnamed Network'}</h2>
                        </div>

                        <div style={{
                            padding: '20px 30px',
                            background: '#f8fafc',
                            borderRadius: '16px',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <p style={{ margin: 0, color: '#475569', fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 }}>
                                Open your camera app and scan the QR code<br />to connect automatically.
                            </p>
                        </div>

                        <div style={{ marginTop: 50, paddingTop: 30, borderTop: '2px solid #f1f5f9', width: '100%' }}>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                                Securely generated by <span style={{ color: '#2563eb' }}>safeconverts.com</span>
                            </p>
                        </div>
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
