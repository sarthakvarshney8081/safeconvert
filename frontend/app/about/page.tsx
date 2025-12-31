import React from 'react';
import Link from 'next/link';
import { Shield, Github, Server, Lock } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Trusted File Management
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.6 }}>
                    SafeConvert delivers enterprise-grade file manipulation tools directly to your browser.
                    Fast, secure, and built for privacy.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 60 }}>
                <div className="card" style={{ padding: 30, border: '1px solid #eee' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: 20 }}>
                        <Shield size={40} />
                    </div>
                    <h3 style={{ marginBottom: 15 }}>Bank-grade Security</h3>
                    <p style={{ color: '#666' }}>
                        Your files are processed in secure, isolated environments. We employ industry-standard encryption protocols to ensure your data never falls into the wrong hands.
                    </p>
                </div>

                <div className="card" style={{ padding: 30, border: '1px solid #eee' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: 20 }}>
                        <Lock size={40} />
                    </div>
                    <h3 style={{ marginBottom: 15 }}>Zero-Knowledge Privacy</h3>
                    <p style={{ color: '#666' }}>
                        We perform strictly no logging. Your original files are deleted immediately after processing, and results are purged automatically within 1 hour.
                    </p>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 40, borderRadius: 16, marginBottom: 60 }}>
                <h2 style={{ marginBottom: 20 }}>Our Mission</h2>
                <p style={{ marginBottom: 20, color: '#444' }}>
                    In today's digital world, document security is paramount. SafeConvert was established to provide professionals and businesses with a reliable, private alternative for managing sensitive documents.
                </p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Server size={18} color="var(--primary)" /> Self-Hostable with Docker
                    </li>
                    <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Shield size={18} color="var(--primary)" /> No Third-Party Tracking
                    </li>
                    <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Github size={18} color="var(--primary)" /> MIT Licensed
                    </li>
                </ul>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: 20 }}>Support the Project</h3>
                <p style={{ marginBottom: 30, color: '#666' }}>
                    Star us on GitHub or contribute to the development.
                </p>
                <a href="https://github.com/SarthakVarshney8081/safeconvert" target="_blank" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <Github size={20} />
                    View on GitHub
                </a>
            </div>
        </div>
    );
}
