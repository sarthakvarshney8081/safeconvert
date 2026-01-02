"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, LucideIcon } from 'lucide-react';

interface ToolLayoutProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children: React.ReactNode;
}

export default function ToolLayout({ title, description, icon: Icon, children }: ToolLayoutProps) {
    return (
        <div className="container" style={{ maxWidth: 1000, padding: '20px 20px 40px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/it-tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                    <ArrowLeft size={16} />
                    Back to IT Tools
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                    <Icon size={40} className="text-primary" />
                    <h1 style={{ margin: 0 }}>{title}</h1>
                </div>
                <p style={{ color: '#666' }}>{description}</p>
            </div>

            <div className="card">
                {children}
            </div>

            <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 20 }}>
                <Link href="/" style={{ color: '#666', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Home size={16} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
