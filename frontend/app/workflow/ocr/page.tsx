"use client";

import React, { useState } from 'react';
import CustomWorkflowBuilder, { WorkflowStep } from '@/components/CustomWorkflowBuilder';
import { FileText, FileSearch, Wand2, Type } from 'lucide-react';
import InteractiveWorkflow from '@/components/InteractiveWorkflow';
import FileDropzone from '@/components/ui/FileDropzone';

const OCR_STEPS: Omit<WorkflowStep, 'id'>[] = [
    { type: 'enhance_image', label: 'Enhance Readability', icon: Wand2 },
    { type: 'ocr_pdf', label: 'Make Searchable PDF', icon: FileSearch },
    { type: 'extract_text', label: 'Extract Text', icon: FileText },
];

export default function OcrWorkflowPage() {
    const [view, setView] = useState<'builder' | 'runner'>('builder');
    const [customSteps, setCustomSteps] = useState<WorkflowStep[]>([]);
    const [initialFiles, setInitialFiles] = useState<File[]>([]);

    const handleComplete = (steps: WorkflowStep[]) => {
        setCustomSteps(steps);
        setView('runner');
    };

    if (view === 'builder') {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <CustomWorkflowBuilder
                    onComplete={handleComplete}
                    onCancel={() => window.history.back()}
                    availableSteps={OCR_STEPS}
                    title="OCR Intelligence Workflow"
                    description="Enhance images, recognize text, and preserve layouts."
                />
            </div>
        );
    }

    if (view === 'runner') {
        if (initialFiles.length === 0) {
            // Upload View
            return (
                <div className="container" style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Upload Documents</h2>
                        <p style={{ color: '#666' }}>
                            Selected Workflow: {customSteps.map(s => s.label).join(' → ')}
                        </p>
                    </div>

                    <div className="card">
                        <FileDropzone
                            onFilesSelected={(files) => setInitialFiles(files)}
                            accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff"
                            multiple={true}
                            maxFiles={10}
                        />
                        <div style={{ padding: 16, marginTop: 16, background: '#f5f5f7', borderRadius: 8, fontSize: '0.85rem', color: '#666', textAlign: 'left' }}>
                            <strong>Supports:</strong> PDF, PNG, JPG, TIFF. <br />
                            <strong>Note:</strong> For handwriting, ensure high contrast and clear writing for best results.
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <button
                                onClick={() => setView('builder')}
                                style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Back to Builder
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Wizard View
        return (
            <div className="container" style={{ padding: '40px 20px' }}>
                <InteractiveWorkflow
                    steps={customSteps}
                    initialFiles={initialFiles}
                    onReset={() => {
                        setInitialFiles([]);
                        setView('builder');
                    }}
                />
            </div>
        );
    }

    return null;
}
