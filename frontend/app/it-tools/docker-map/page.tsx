"use client";

import React, { useState, useEffect, Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Box } from 'lucide-react';

export const dynamic = 'force-dynamic';

function DockerMapContent() {
    const [dockerRun, setDockerRun] = useState('docker run -d -p 8080:80 --name my-web nginx:latest');
    const [dockerCompose, setDockerCompose] = useState('');

    useEffect(() => {
        try {
            let dRun = dockerRun.trim();
            const parts = dRun.split(/\s+/);
            const image = parts[parts.length - 1]; // Assume last arg is image
            const nameMatch = dRun.match(/--name\s+([^\s]+)/) || dRun.match(/-name\s+([^\s]+)/);
            const ports = dRun.match(/-p\s+([^\s]+)/g)?.map(s => s.split(/\s+/)[1]) || [];
            const vols = dRun.match(/-v\s+([^\s]+)/g)?.map(s => s.split(/\s+/)[1]) || [];
            const envs = dRun.match(/-e\s+([^\s]+)/g)?.map(s => s.split(/\s+/)[1]) || [];

            const compose = `version: '3'
services:
  ${nameMatch ? nameMatch[1] : 'app'}:
    image: ${image}
    restart: always
    ${ports.length ? 'ports:' : ''}
    ${ports.map(p => `  - "${p}"`).join('\n')}
    ${vols.length ? 'volumes:' : ''}
    ${vols.map(v => `  - ${v}`).join('\n')}
    ${envs.length ? 'environment:' : ''}
    ${envs.map(e => `  - ${e}`).join('\n')}
`;
            setDockerCompose(compose);
        } catch (e) {
            setDockerCompose('# Error parsing command');
        }
    }, [dockerRun]);

    return (
        <ToolLayout
            title="Docker Map"
            description="Convert Docker Run commands to Docker Compose."
            icon={Box}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>Docker Run to Compose</h3>
                <textarea
                    value={dockerRun}
                    onChange={(e) => setDockerRun(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        fontSize: '1rem',
                        fontFamily: 'monospace'
                    }}
                    placeholder="docker run ..."
                />
                <textarea
                    readOnly
                    value={dockerCompose}
                    rows={12}
                    style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        background: '#f8f9fa',
                        marginTop: 20
                    }}
                />
            </div>
        </ToolLayout>
    );
}

export default function DockerMap() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DockerMapContent />
        </Suspense>
    );
}
