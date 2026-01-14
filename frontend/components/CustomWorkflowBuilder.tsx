"use client";

import React, { useState } from 'react';
import { Plus, X, ArrowRight, RotateCw, Minimize2, FileImage, FileText, CheckCircle2 } from 'lucide-react';

export type WorkflowStepType =
    | 'rotate' | 'compress' | 'convert' | 'ocr'
    | 'merge' | 'split' | 'repair' | 'organize' | 'protect'
    | 'compress_img' | 'resize' | 'to_pdf' | 'convert_format' | 'crop'
    | 'ocr_pdf' | 'extract_text' | 'enhance_image';

export interface WorkflowStep {
    id: string;
    type: WorkflowStepType;
    label: string;
    icon: React.ElementType;
    params?: Record<string, any>;
}

const DEFAULT_STEPS: Omit<WorkflowStep, 'id'>[] = [
    { type: 'rotate', label: 'Rotate PDF', icon: RotateCw },
    { type: 'compress', label: 'Compress PDF', icon: Minimize2 },
    { type: 'convert', label: 'Image to PDF', icon: FileImage },
    { type: 'ocr', label: 'OCR Process', icon: FileText },
];

interface CustomWorkflowBuilderProps {
    onComplete: (steps: WorkflowStep[]) => void;
    onCancel: () => void;
    availableSteps?: Omit<WorkflowStep, 'id'>[];
    title?: string;
    description?: string;
}

export default function CustomWorkflowBuilder({
    onComplete,
    onCancel,
    availableSteps = DEFAULT_STEPS,
    title = "Build Your Workflow",
    description = "Chain up to 4 tools to create a custom processing pipeline."
}: CustomWorkflowBuilderProps) {
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const addStep = (stepType: WorkflowStepType) => {
        if (steps.length >= 4) return;
        const template = availableSteps.find(s => s.type === stepType);
        if (template) {
            setSteps([...steps, { ...template, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setIsSelectorOpen(false);
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    return (
        <div className="w-full" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>{title}</h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>{description}</p>
            </div>

            {/* Builder Area */}
            <div style={{ padding: 40, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '2px dashed #e0e0e0', borderRadius: 16, boxShadow: 'var(--shadow-sm)', position: 'relative', zIndex: 10 }}>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, justifyContent: 'center', width: '100%' }}>

                    {/* Start Node */}
                    <div style={{ padding: '10px 20px', background: '#e0e0e0', borderRadius: 8, fontWeight: 600, color: '#666' }}>
                        Local File
                    </div>

                    <ArrowRight size={20} color="#ccc" />

                    {/* Steps */}
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div style={{ position: 'relative', width: 140, height: 100, background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--error)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={14} />
                                </button>
                                <step.icon size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{step.label}</span>
                            </div>
                            <ArrowRight size={20} color="#ccc" />
                        </React.Fragment>
                    ))}

                    {/* Add Button */}
                    {steps.length < 4 && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                                style={{ width: 60, height: 60, borderRadius: '50%', border: '2px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <Plus size={24} />
                            </button>

                            {/* Dropdown */}
                            {isSelectorOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 8, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: 240, minWidth: 'max-content', zIndex: 10000, border: '1px solid #eee' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#888', padding: '8px 12px', margin: 0, borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>Add Step</h4>
                                    {availableSteps.map(step => (
                                        <button
                                            key={step.type}
                                            onClick={() => addStep(step.type)}
                                            style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f7'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <step.icon size={16} />
                                            {step.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {steps.length >= 4 && (
                        <div style={{ padding: '10px 20px', background: '#e0e0e0', borderRadius: 8, fontWeight: 600, color: '#666' }}>
                            Max Limit
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 20 }}>
                <button onClick={onCancel} className="btn" style={{ background: '#f5f5f7', color: '#666' }}>
                    Cancel
                </button>
                <button
                    onClick={() => onComplete(steps)}
                    disabled={steps.length === 0}
                    className="btn btn-primary"
                    style={{ opacity: steps.length === 0 ? 0.5 : 1, cursor: steps.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                    <CheckCircle2 size={18} style={{ marginRight: 8 }} />
                    Use This Workflow
                </button>
            </div>
        </div>
    );
}
