import React from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function HeroStatic({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ padding: '80px 20px 40px', minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>

            {/* Background Decor (Gradients) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', overflow: 'hidden', zIndex: -1, background: 'radial-gradient(circle at 50% 10%, #f0f9ff 0%, #fff 100%)' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />
            </div>

            {/* Hero Content (Static - Immediate Render) */}
            <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: 30, animation: 'fadeIn 0.8s ease' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderRadius: 20, fontSize: '0.85rem', marginBottom: 15, fontWeight: 500 }}>
                    <Globe size={14} />
                    <span>Global Privacy-First Platform</span>
                </div>

                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    SafeConverts
                </h1>

                <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.5, maxWidth: 600, margin: '0 auto' }}>
                    Premium PDF and Image tools. 100% Privacy-Focused.
                    <br />
                    No sign-up required.
                </p>
            </div>

            {/* Dynamic Search Bar (Client Side) */}
            {children}

            {/* Trust Badges (Static) */}
            <div style={{ display: 'flex', gap: 30, marginTop: 10, opacity: 0.8, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} />
                    <span>Secure & Private</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                    <Zap size={16} />
                    <span>Lightning Fast</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.85rem' }}>
                    <Globe size={16} />
                    <span>Browser-Based</span>
                </div>
            </div>
        </div>
    );
}
