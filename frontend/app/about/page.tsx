import React from 'react';
import Link from 'next/link';
import { Shield, Github, Server, Lock } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    About SafeConvert
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.6 }}>
                    The privacy-first, self-hosted solution for your file manipulation needs.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 60 }}>
                <div className="card" style={{ padding: 30 }}>
                    <div style={{ color: 'var(--primary)', marginBottom: 20 }}>
                        <Shield size={40} />
                    </div>
                    <h3 style={{ marginBottom: 15 }}>Privacy First</h3>
                    <p style={{ color: '#666' }}>
                        Your files never leave your server. All processing happens locally within your Docker container.
                        Temporary files are automatically deleted after 1 hour.
                    </p>
                </div>

                <div className="card" style={{ padding: 30 }}>
                    <div style={{ color: 'var(--primary)', marginBottom: 20 }}>
                        <Lock size={40} />
                    </div>
                    <h3 style={{ marginBottom: 15 }}>Secure & Open Source</h3>
                    <p style={{ color: '#666' }}>
                        Full transparency. Review the code, host it yourself, and trust that your data is safe.
                        Built with modern standards using Next.js and FastAPI.
                    </p>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 40, borderRadius: 16, marginBottom: 60 }}>
                <h2 style={{ marginBottom: 20 }}>Why SafeConvert?</h2>
                <p style={{ marginBottom: 20, color: '#444' }}>
                    We built SafeConvert because we were tired of uploading sensitive documents to random websites just to merge a PDF or compress an image.
                    We believe basic file tools should be free, private, and accessible to everyone.
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
