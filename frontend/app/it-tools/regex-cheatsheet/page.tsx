"use client";

import React, { Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Code2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function RegexContent() {
    return (
        <ToolLayout
            title="Regex Cheatsheet"
            description="Common regex patterns."
            icon={Code2}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Common Regex Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                    <CheatItem title="Email Address" code="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" />
                    <CheatItem title="URL (http/https)" code="^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$" />
                    <CheatItem title="Date (YYYY-MM-DD)" code="^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$" />
                    <CheatItem title="IPv4 Address" code="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" />
                    <CheatItem title="Password (Strong)" code="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" />
                    <CheatItem title="Hex Color" code="^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$" />
                </div>
            </div>
        </ToolLayout>
    );
}

const CheatItem = ({ title, code, multilines }: any) => (
    <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 5, color: '#444' }}>{title}</div>
        <pre style={{
            background: '#fff',
            padding: 10,
            borderRadius: 4,
            border: '1px solid #eee',
            overflowX: 'auto',
            fontFamily: 'monospace',
            color: '#d63384',
            margin: 0
        }}>
            {code}
        </pre>
    </div>
);

export default function RegexCheatsheet() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegexContent />
        </Suspense>
    );
}
