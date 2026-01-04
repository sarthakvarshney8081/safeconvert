"use client";

import ToolLayout from '@/components/ToolLayout';
import { Shield } from 'lucide-react';

export default function PrivacyContent() {
    return (
        <ToolLayout
            title="Privacy Policy"
            description="How we handle your data securely."
            icon={Shield}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', color: '#444', lineHeight: 1.7 }}>
                <div style={{ textAlign: 'center', marginBottom: 30, fontSize: '0.9rem', color: '#666' }}>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f0f0f0' }}>
                    <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>1. Commitment to Privacy</h2>
                        <p>
                            At SafeConverts, your privacy is our absolute priority. We have engineered our systems to minimize data retention and ensure that you retain full control over your documents. We do not track, sell, or share your personal information.
                        </p>
                    </section>

                    <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>2. Data Handling & Security</h2>
                        <p style={{ marginBottom: 10 }}>
                            Our data processing pipeline is automated and secure:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: 10, paddingLeft: 20, borderLeft: '3px solid var(--primary)' }}>
                                <strong style={{ color: '#333' }}>Encryption:</strong> All file transfers are encrypted using industry-standard TLS protocols.
                            </li>
                            <li style={{ marginBottom: 10, paddingLeft: 20, borderLeft: '3px solid var(--primary)' }}>
                                <strong style={{ color: '#333' }}>Isolation:</strong> Each processing task runs in an isolated container environment.
                            </li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>3. Automated Deletion Policy</h2>
                        <p>
                            We adhere to a strict retention policy to protect your sensitive information:
                        </p>
                        <ul style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginTop: 15, listStyle: 'disc', listStylePosition: 'inside' }}>
                            <li style={{ marginBottom: 8, color: '#444' }}><strong>Immediately:</strong> Original uploads are deleted as soon as processing starts.</li>
                            <li style={{ color: '#444' }}><strong>Within 10 Minutes:</strong> All processed output files are permanently purged from our servers.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>4. Grievance Officer</h2>
                        <p style={{ marginBottom: 20 }}>
                            In compliance with the Information Technology Act, 2000 and rules made thereunder, you may contact our Grievance Officer for any concerns:
                        </p>
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                            <p><strong>Email:</strong> support@safeconverts.com</p>
                        </div>
                    </section>
                </div>
            </div>
        </ToolLayout>
    );
}
