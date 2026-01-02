"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileCode } from 'lucide-react';
import mime from 'mime-types';

export const dynamic = 'force-dynamic';

function MimeTypesContent() {
    const [mimeInput, setMimeInput] = useState('');
    const [mimeResult, setMimeResult] = useState('');

    useEffect(() => {
        if (!mimeInput.trim()) {
            setMimeResult('');
            return;
        }
        if (mimeInput.includes('/')) {
            const ext = mime.extension(mimeInput);
            setMimeResult(ext ? `Extension: .${ext}` : 'Unknown MIME type');
        } else {
            const type = mime.lookup(mimeInput);
            setMimeResult(type ? `MIME Type: ${type}` : 'Unknown extension');
        }
    }, [mimeInput]);

    return (
        <ToolLayout
            title="MIME Types"
            description="Find MIME types by extension."
            icon={FileCode}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>MIME Type Lookup</h3>
                <p style={{ color: '#666' }}>Enter a file extension (e.g., <code>.json</code> or <code>json</code>) OR a MIME type (e.g., <code>application/json</code>).</p>
                <input
                    type="text"
                    value={mimeInput}
                    onChange={(e) => setMimeInput(e.target.value)}
                    placeholder="Type extension or mime type..."
                    style={{ width: '100%', padding: 15, borderRadius: 8, border: '1px solid #ddd', fontSize: '1.1rem', marginBottom: 20 }}
                />
                {mimeResult && (
                    <div style={{ padding: 20, background: '#e3f2fd', color: '#0d47a1', borderRadius: 8, textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                        {mimeResult}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}

export default function MimeTypes() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MimeTypesContent />
        </Suspense>
    );
}
