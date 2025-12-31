import React from 'react';

export const metadata = {
    title: 'Privacy Policy - SafeConverts',
    description: 'How we handle your data securely.',
};

export default function PrivacyPage() {
    return (
        <div className="container" style={{ maxWidth: 800, padding: '60px 20px' }}>
            <h1 style={{ marginBottom: 30 }}>Privacy Policy</h1>
            <p style={{ color: '#666', marginBottom: 40 }}>Last Updated: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: 40 }}>
                <h2>1. Overview</h2>
                <p>SafeConverts ("we", "our") is a privacy-first, self-hosted file manipulation tool. We respect your data and have designed our system to ensure your files remain your own.</p>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2>2. Data Collection & Usage</h2>
                <p>We only collect the files you explicitly upload for the purpose of processing (e.g., converting, merging, or editing). We do not collect personal identifiers, cookies, or tracking data.</p>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2>3. Data Retention (Auto-Deletion)</h2>
                <p>Our system operates on a strict zero-retention policy for long-term storage:</p>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, marginTop: 10 }}>
                    <li><strong>Input Files:</strong> Original files uploaded by you are deleted <strong>automatically immediately</strong> after the processing task is complete.</li>
                    <li><strong>Output Files:</strong> Processed results are kept for <strong>1 hour</strong> to allow you to download them. After 1 hour, a rigorous automated cleanup script permanently deletes them from the server.</li>
                </ul>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2>4. Server Location & Security</h2>
                <p>Your data is processed on secure servers. We use HTTPS encryption for all data in transit. Your files are isolated in temporary storage volumes and are never accessed by human personnel.</p>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2>5. Your Rights</h2>
                <p>Under the Digital Personal Data Protection Act, 2023, you have the right to grievance redressal. Since we do not permanently store your data, "Right to Erasure" is fulfilled automatically by our system design.</p>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h2>6. Contact Us</h2>
                <p>If you have any questions or grievances regarding this policy, please contact us at:</p>
                <p><strong>Email:</strong> support@safeconverts.com</p>
            </section>
        </div>
    );
}
