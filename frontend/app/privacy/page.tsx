import React from 'react';

export const metadata = {
    title: 'Privacy Policy - SafeConverts',
    description: 'How we handle your data securely.',
};

export default function PrivacyPage() {
    return (
        <div className="container" style={{ maxWidth: 800, padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 10 }}>Privacy Policy</h1>
                <p style={{ color: '#666' }}>Last Updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f0f0f0' }}>
                <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>1. Commitment to Privacy</h2>
                    <p style={{ lineHeight: 1.7, color: '#555' }}>
                        At SafeConvert, your privacy is our absolute priority. We have engineered our systems to minimize data retention and ensure that you retain full control over your documents. We do not track, sell, or share your personal information.
                    </p>
                </section>

                <section style={{ marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 30 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>2. Data Handling & Security</h2>
                    <p style={{ lineHeight: 1.7, color: '#555', marginBottom: 10 }}>
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
                    <p style={{ lineHeight: 1.7, color: '#555' }}>
                        We adhere to a strict retention policy to protect your sensitive information:
                    </p>
                    <ul style={{ background: '#f8fafc', padding: 20, borderRadius: 8, marginTop: 15, listStyle: 'disc', listStylePosition: 'inside' }}>
                        <li style={{ marginBottom: 8, color: '#444' }}><strong>Immediately:</strong> Original uploads are deleted as soon as processing starts.</li>
                        <li style={{ color: '#444' }}><strong>Within 20 Minutes:</strong> All processed output files are permanently purged from our servers.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 30 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>4. Grievance Officer</h2>
                    <p style={{ lineHeight: 1.7, color: '#555', marginBottom: 20 }}>
                        In compliance with the Information Technology Act, 2000 and rules made thereunder, you may contact our Grievance Officer for any concerns:
                    </p>
                    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                        <p><strong>Email:</strong> privacy@safeconverts.com</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
