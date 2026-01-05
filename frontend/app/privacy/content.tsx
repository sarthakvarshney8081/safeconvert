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
                            At SafeConvert, your privacy is our absolute priority. We have engineered our systems to minimize data retention. While we do not sell your personal document data, we use third-party services (like Google) to serve advertisements, which may involve limited data collection for ad personalization.
                        </p>
                    </section>

                    <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>2. Cookies and Advertising</h2>
                        <p style={{ marginBottom: 10 }}><strong>Google AdSense:</strong> We use Google as a third-party vendor to serve ads on our site.</p>
                        <ul style={{ listStyle: 'disc', listStylePosition: 'inside', paddingLeft: 10, color: '#444' }}>
                            <li style={{ marginBottom: 10 }}><strong>Cookies:</strong> Google uses cookies to serve ads based on your prior visits to our website or other websites.</li>
                            <li style={{ marginBottom: 10 }}><strong>Personalized Ads:</strong> Users in the EEA and UK will be presented with a Consent Message to opt-in or out of personalized advertising.</li>
                            <li><strong>Google's Terms:</strong> For more information, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>How Google uses information from sites or apps that use our services</a>.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>3. Data Handling & Security</h2>
                        <p style={{ marginBottom: 10 }}>Our data processing pipeline is automated and secure:</p>
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
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>4. Automated Deletion Policy</h2>
                        <p>We adhere to a strict retention policy:</p>
                        <ul style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginTop: 15, listStyle: 'disc', listStylePosition: 'inside' }}>
                            <li style={{ marginBottom: 8, color: '#444' }}><strong>Immediately:</strong> Original uploads are deleted as soon as processing starts.</li>
                            <li style={{ color: '#444' }}><strong>Within 20 Minutes:</strong> All processed output files are permanently purged from our servers.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 30 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>5. Contact Us</h2>
                        <p style={{ marginBottom: 20 }}>For any concerns regarding your privacy, you may contact us at:</p>
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                            <p><strong>Email:</strong> support@safeconverts.com</p>
                        </div>
                    </section>
                </div>
            </div>
        </ToolLayout>
    );
}
