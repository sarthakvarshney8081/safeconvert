"use client";

import ToolLayout from '@/components/ToolLayout';
import { Scale } from 'lucide-react';

export default function TermsContent() {
    return (
        <ToolLayout
            title="Terms of Service"
            description="Please read these terms carefully before using our services."
            icon={Scale}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', color: '#444', lineHeight: 1.7 }}>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using SafeConverts ("Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>2. Description of Service</h2>
                    <p>
                        SafeConverts provides web-based file manipulation tools suitable for PDF conversion, image editing, and other utility tasks. We prioritize privacy by processing files locally in your browser whenever possible.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>3. Privacy & Data Handling</h2>
                    <p>
                        We do not store your uploaded files permanently. Files uploaded for processing are automatically deleted from our servers shortly after processing is complete (typically within 10-20 minutes). For browser-based tools, files never leave your device. Please review our <a href="/privacy" style={{ color: '#0284c7' }}>Privacy Policy</a> for more details.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>4. User Responsibilities</h2>
                    <p>
                        You are solely responsible for the content of the files you upload. You agree not to upload files that contain illegal, harmful, or malicious content. SafeConverts assumes no liability for the content processed through our tools.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>5. Disclaimer of Warranties</h2>
                    <p>
                        The Service is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, express or implied. We do not guarantee that the tools will be error-free or uninterrupted. You use the Service at your own risk.
                    </p>
                </section>

                <section style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 15, color: '#333' }}>6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the Service after any such changes constitutes your acceptance of the new Terms of Service.
                    </p>
                </section>

                <div style={{ borderTop: '1px solid #eee', paddingTop: 20, fontSize: '0.9rem', color: '#666' }}>
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </ToolLayout>
    );
}
