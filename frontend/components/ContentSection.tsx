import React from 'react';
import { HelpCircle, CheckCircle2, ListOrdered, FileQuestion } from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface FAQ {
    question: string;
    answer: string;
}

interface ContentSectionProps {
    title: string;
    features: Feature[];
    steps: (string | { title: string; description: string })[];
    faq: FAQ[];
    relatedTools?: { name: string; href: string }[];
}

export default function ContentSection({
    title,
    features,
    steps,
    faq,
    relatedTools
}: ContentSectionProps) {
    return (
        <section style={{ maxWidth: 1000, margin: '60px auto', padding: '0 20px', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>

            {/* Introduction / Title */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem' }}>{title}</h2>
                <div style={{ width: 60, height: 4, background: 'var(--primary, #3b82f6)', margin: '0 auto', borderRadius: 2 }}></div>
            </div>

            {/* Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, marginBottom: 80 }}>
                {features.map((feature, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: 30, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{
                            width: 48, height: 48, background: '#e0f2fe', color: 'var(--primary, #0284c7)',
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                        }}>
                            {feature.icon || <CheckCircle2 size={24} />}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 10, color: '#0f172a' }}>{feature.title}</h3>
                        <p style={{ color: '#475569', lineHeight: 1.6 }}>{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* How It Works */}
            <div style={{ marginBottom: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <ListOrdered size={32} className="text-primary" />
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>How to Use</h3>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    {steps.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            <div style={{
                                flexShrink: 0, width: 36, height: 36, background: 'var(--primary, #3b82f6)', color: 'white',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                {idx + 1}
                            </div>
                            <div style={{ paddingTop: 4 }}>
                                {typeof step === 'string' ? (
                                    <p style={{ fontSize: '1.1rem', color: '#334155', margin: 0 }}>{step}</p>
                                ) : (
                                    <>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>{step.title}</h4>
                                        <p style={{ color: '#475569', margin: 0 }}>{step.description}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div style={{ marginBottom: 60 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <HelpCircle size={32} className="text-primary" />
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Frequently Asked Questions</h3>
                </div>

                <div style={{ display: 'grid', gap: 15 }}>
                    {faq.map((item, idx) => (
                        <details key={idx} style={{
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}>
                            <summary style={{
                                padding: '16px 20px', cursor: 'pointer', fontWeight: 600, color: '#1e293b',
                                display: 'flex', justifyContent: 'space-between', listStyle: 'none'
                            }}>
                                {item.question}
                                <span style={{ color: '#94a3b8' }}>▼</span>
                            </summary>
                            <div style={{ padding: '0 20px 20px 20px', color: '#475569', lineHeight: 1.6, borderTop: '1px solid #f1f5f9' }}>
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>

        </section>
    );
}
