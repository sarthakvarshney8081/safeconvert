"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Globe } from 'lucide-react';
import { UAParser } from 'ua-parser-js';

export const dynamic = 'force-dynamic';

function UserAgentContent() {
    const [uaString, setUaString] = useState('');
    const [parsedUa, setParsedUa] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUaString(window.navigator.userAgent);
        }
    }, []);

    useEffect(() => {
        try {
            const parser = new UAParser(uaString);
            setParsedUa(parser.getResult());
        } catch {
            setParsedUa(null);
        }
    }, [uaString]);

    return (
        <ToolLayout
            title="User Agent Parser"
            description="Parse browser and OS strings."
            icon={Globe}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>User Agent Parser</h3>
                <textarea
                    value={uaString}
                    onChange={(e) => setUaString(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 20 }}
                />
                {parsedUa && (
                    <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
                        <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                            <strong>Browser</strong>
                            <div style={{ fontSize: '1.2rem', color: '#2196f3' }}>
                                {parsedUa.browser.name} <span style={{ fontSize: '0.9rem', color: '#666' }}>{parsedUa.browser.version}</span>
                            </div>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                            <strong>OS</strong>
                            <div style={{ fontSize: '1.2rem', color: '#4caf50' }}>
                                {parsedUa.os.name} <span style={{ fontSize: '0.9rem', color: '#666' }}>{parsedUa.os.version}</span>
                            </div>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8 }}>
                            <strong>Device</strong>
                            <div style={{ fontSize: '1.2rem', color: '#9c27b0' }}>
                                {parsedUa.device.vendor || 'Desktop'} {parsedUa.device.model} ({parsedUa.contextValue || 'N/A'})
                            </div>
                        </div>
                        <pre style={{ gridColumn: '1 / -1', background: '#222', color: '#fff', padding: 15, borderRadius: 8, overflowX: 'auto' }}>
                            {JSON.stringify(parsedUa, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}

export default function UserAgentParser() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserAgentContent />
        </Suspense>
    );
}
