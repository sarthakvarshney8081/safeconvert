"use client";

import ToolLayout from '@/components/ToolLayout';
import { Mail } from 'lucide-react';

export default function ContactContent() {
    return (
        <ToolLayout
            title="Contact Us"
            description="We'd love to hear from you."
            icon={Mail}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '16px', marginBottom: '40px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: 1.6, marginBottom: '30px' }}>
                        Have questions, suggestions, or need assistance? Our team is dedicated to providing you with the best experience.
                    </p>

                    <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>

                        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '50%', color: '#0284c7' }}>
                                    <Mail size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Email Support</h3>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '10px' }}>
                                For general inquiries and support:
                            </p>
                            <a href="mailto:support@safeconverts.com" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none', fontSize: '1.1rem' }}>
                                support@safeconverts.com
                            </a>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                    <p>We typically respond within 24-48 business hours.</p>
                </div>
            </div>
        </ToolLayout>
    );
}
