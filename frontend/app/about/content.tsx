"use client";

import ToolLayout from '@/components/ToolLayout';
import { Info, Heart, Shield, Zap } from 'lucide-react';

export default function AboutContent() {
    return (
        <ToolLayout
            title="About Us"
            description="Our mission to make file tools safe and accessible."
            icon={Info}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', color: '#444', lineHeight: 1.7 }}>

                <section style={{ marginBottom: 50, textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: 600, margin: '0 auto' }}>
                        SafeConverts delivers enterprise-grade file manipulation tools directly to your browser. Fast, secure, and built for privacy.
                    </p>
                </section>

                <div className="grid grid-cols-3" style={{ gap: 20, marginBottom: 50 }}>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                            <Shield size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Privacy First</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Documents stay isolated and are deleted automatically.</p>
                    </div>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                            <Zap size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Lightning Fast</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Optimized processing without queue times.</p>
                    </div>
                    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                            <Heart size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>Free to Use</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>No hidden costs or watermarks.</p>
                    </div>
                </div>

                <section style={{ marginBottom: 40, background: '#fff', padding: 40, borderRadius: 12, border: '1px solid #f0f0f0' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>Our Mission</h2>
                    <p style={{ marginBottom: 20 }}>
                        In today's digital world, document security is paramount. SafeConverts was established to provide professionals and businesses with a reliable, private alternative for managing sensitive documents.
                    </p>
                    <p>
                        We believe that you shouldn't have to upload your confidential contracts or personal data to a remote server just to merge a PDF or convert an image. That's why we're building tools that process as much as possible right on your device.
                    </p>
                </section>

            </div>
        </ToolLayout>
    );
}
