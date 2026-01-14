"use client";

import React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Zap, Ban } from 'lucide-react';

export interface WorkflowOption {
    id: string;
    title: string;
    description: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    features?: string[];
    bestFor?: string;
    limitations?: string;
}

interface DetailedWorkflowSelectorProps {
    title?: string;
    description?: string;
    workflows: WorkflowOption[];
    onSelect: (workflowId: string) => void;
}

export default function DetailedWorkflowSelector({
    title = "Workflow Builder",
    description = "Select a processing pipeline tailored to your specific needs.",
    workflows,
    onSelect
}: DetailedWorkflowSelectorProps) {

    return (
        <div className="w-full" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 15, background: 'linear-gradient(135deg, #6200EE 0%, #3700B3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</h1>
                <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 30 }}>
                {workflows.map((workflow) => (
                    <button
                        key={workflow.id}
                        onClick={() => onSelect(workflow.id)}
                        className="card"
                        style={{
                            textAlign: 'left',
                            background: 'var(--surface)',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            position: 'relative',
                            padding: '30px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: 'var(--radius-xl)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        {workflow.badge && (
                            <span style={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: workflow.badge === 'Beta' ? '#fff3e0' : '#e3f2fd',
                                color: workflow.badge === 'Beta' ? '#e65100' : '#1565c0',
                                padding: '4px 12px',
                                borderRadius: 20,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {workflow.badge}
                            </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 16,
                                background: 'var(--background)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                {workflow.icon ? <workflow.icon size={28} /> : <Zap size={28} />}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>{workflow.title}</h3>
                        </div>

                        <p style={{
                            fontSize: '1rem',
                            color: '#555',
                            lineHeight: 1.6,
                            marginBottom: 25,
                            borderBottom: '1px solid #eee',
                            paddingBottom: 25
                        }}>
                            {workflow.description}
                        </p>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 30 }}>
                            {workflow.bestFor && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <CheckCircle2 size={18} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: 4 }} />
                                    <div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>Best For:</span>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 2 }}>{workflow.bestFor}</p>
                                    </div>
                                </div>
                            )}

                            {workflow.limitations && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 4 }} />
                                    <div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#333' }}>Limitation:</span>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: 2 }}>{workflow.limitations}</p>
                                    </div>
                                </div>
                            )}

                            {workflow.features && (
                                <div style={{ marginTop: 10 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Included Features</span>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                        {workflow.features.map((feature, i) => (
                                            <li key={i} style={{ fontSize: '0.85rem', color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)' }} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div style={{
                            background: 'var(--background)',
                            color: 'var(--primary)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'background 0.2s'
                        }}>
                            Use This Workflow <ArrowRight size={18} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
