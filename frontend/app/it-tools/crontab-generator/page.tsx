"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Clock } from 'lucide-react';
import cronstrue from 'cronstrue';

export const dynamic = 'force-dynamic';

function CrontabContent() {
    const [cronExp, setCronExp] = useState('* * * * *');
    const [cronDesc, setCronDesc] = useState('');

    useEffect(() => {
        try {
            const desc = cronstrue.toString(cronExp);
            setCronDesc(desc);
        } catch (e) {
            setCronDesc('Invalid cron expression');
        }
    }, [cronExp]);

    return (
        <ToolLayout
            title="Crontab Generator"
            description="Parse and generate cron schedules."
            icon={Clock}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Crontab Generator</h3>
                <input
                    type="text"
                    value={cronExp}
                    onChange={(e) => setCronExp(e.target.value)}
                    placeholder="* * * * *"
                    style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                    }}
                />
                <div style={{ marginTop: 20, background: '#e8f5e9', padding: 20, borderRadius: 8, textAlign: 'center', fontSize: '1.2rem', color: '#2e7d32', fontWeight: 600 }}>
                    {cronDesc}
                </div>
            </div>
        </ToolLayout>
    );
}

export default function CrontabGenerator() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CrontabContent />
        </Suspense>
    );
}
