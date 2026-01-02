"use client";

import React, { Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

function GitContent() {
    return (
        <ToolLayout
            title="Git Cheatsheet"
            description="Common git commands."
            icon={FileText}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Git Cheatsheet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                    <CheatItem title="Init & Clone" code="git init&#10;git clone <url>" multilines />
                    <CheatItem title="Staging" code="git add .&#10;git add -p" multilines />
                    <CheatItem title="Commit" code="git commit -m 'message'&#10;git commit --amend" multilines />
                    <CheatItem title="Branching" code="git checkout -b <branch>&#10;git branch -d <branch>" multilines />
                    <CheatItem title="Syncing" code="git pull origin main&#10;git push origin main" multilines />
                    <CheatItem title="Undo" code="git reset --soft HEAD~1&#10;git checkout -- <file>" multilines />
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

export default function GitCheatsheet() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GitContent />
        </Suspense>
    );
}
