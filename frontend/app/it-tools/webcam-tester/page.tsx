"use client";

import React, { Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Camera } from 'lucide-react';
import Webcam from 'react-webcam';

export const dynamic = 'force-dynamic';

function WebcamContent() {
    return (
        <ToolLayout
            title="Webcam Tester"
            description="Check your camera feed (Client-side only)."
            icon={Camera}
        >
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                <h3 style={{ marginTop: 0 }}>Webcam Tester</h3>
                <p style={{ color: '#666', marginBottom: 20 }}>Check your camera feed (Client-side only).</p>
                <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden', display: 'inline-block', maxWidth: '100%' }}>
                    <Webcam />
                </div>
            </div>
        </ToolLayout>
    );
}

export default function WebcamTester() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WebcamContent />
        </Suspense>
    );
}
