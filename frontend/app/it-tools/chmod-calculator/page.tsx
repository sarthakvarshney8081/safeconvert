"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ChmodContent() {
    const [chmodOctal, setChmodOctal] = useState('755');
    const [permissions, setPermissions] = useState({
        owner: { r: true, w: true, x: true },
        group: { r: true, w: false, x: true },
        public: { r: true, w: false, x: true }
    });

    useEffect(() => {
        const calc = (p: any) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
        const o = calc(permissions.owner);
        const g = calc(permissions.group);
        const p = calc(permissions.public);
        setChmodOctal(`${o}${g}${p}`);
    }, [permissions]);

    const handlePermChange = (who: 'owner' | 'group' | 'public', perm: 'r' | 'w' | 'x') => {
        setPermissions(prev => ({
            ...prev,
            [who]: { ...prev[who], [perm]: !prev[who][perm] }
        }));
    };

    return (
        <ToolLayout
            title="Chmod Calculator"
            description="Calculate file permissions."
            icon={Shield}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Chmod Calculator: <span style={{ fontFamily: 'monospace', background: '#eee', padding: '2px 8px', borderRadius: 4 }}>{chmodOctal}</span></h3>
                <div className="grid grid-cols-3" style={{ gap: 20, marginTop: 20 }}>
                    <PermGroup title="Owner" state={permissions.owner} onChange={(p: 'r' | 'w' | 'x') => handlePermChange('owner', p)} />
                    <PermGroup title="Group" state={permissions.group} onChange={(p: 'r' | 'w' | 'x') => handlePermChange('group', p)} />
                    <PermGroup title="Public" state={permissions.public} onChange={(p: 'r' | 'w' | 'x') => handlePermChange('public', p)} />
                </div>
            </div>
        </ToolLayout>
    );
}

const PermGroup = ({ title, state, onChange }: any) => (
    <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
        <h4 style={{ margin: '0 0 10px 0' }}>{title}</h4>
        <label style={{ display: 'block', marginBottom: 5 }}><input type="checkbox" checked={state.r} onChange={() => onChange('r')} /> Read (4)</label>
        <label style={{ display: 'block', marginBottom: 5 }}><input type="checkbox" checked={state.w} onChange={() => onChange('w')} /> Write (2)</label>
        <label style={{ display: 'block', marginBottom: 5 }}><input type="checkbox" checked={state.x} onChange={() => onChange('x')} /> Execute (1)</label>
    </div>
);

export default function ChmodCalculator() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChmodContent />
        </Suspense>
    );
}
