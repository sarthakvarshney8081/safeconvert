"use client";

import React, { useState } from 'react';
import CustomWorkflowBuilder, { WorkflowStep } from '@/components/CustomWorkflowBuilder';
import { Merge, Split, Minimize2, Wrench, FileStack, Shield, UploadCloud } from 'lucide-react';
import InteractiveWorkflow from '@/components/InteractiveWorkflow';
import FileDropzone from '@/components/ui/FileDropzone';

const PDF_STEPS: Omit<WorkflowStep, 'id'>[] = [
    { type: 'merge', label: 'Merge PDF', icon: Merge },
    { type: 'split', label: 'Split PDF', icon: Split },
    { type: 'compress', label: 'Compress PDF', icon: Minimize2 },
    { type: 'repair', label: 'Repair PDF', icon: Wrench },
    { type: 'organize', label: 'Organize Pages', icon: FileStack },
    { type: 'protect', label: 'Protect PDF', icon: Shield },
];

export default function PdfWorkflowPage() {
    const [view, setView] = useState<'builder' | 'runner'>('builder');
    const [customSteps, setCustomSteps] = useState<WorkflowStep[]>([]);
    const [initialFiles, setInitialFiles] = useState<File[]>([]);

    const handleComplete = (steps: WorkflowStep[]) => {
        setCustomSteps(steps);
        setView('runner');
    };

    const hasMergeStep = customSteps.some(s => s.type === 'merge');
    // If Merge is the first step, we definitely need multiple files logic.

    if (view === 'builder') {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <CustomWorkflowBuilder
                    onComplete={handleComplete}
                    onCancel={() => window.history.back()}
                    availableSteps={PDF_STEPS}
                    title="PDF Management Workflow"
                    description="Chain operations to manage your PDF structure and security."
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Upload Files</h2>
                        <p style={{ color: '#666' }}>
                            Selected Workflow: {customSteps.map(s => s.label).join(' → ')}
                        </p>
                    </div>

                    <div className="card">
                        <FileDropzone
                            onFilesSelected={(files) => setInitialFiles(files)}
                            accept=".pdf"
                            multiple={hasMergeStep || customSteps[0]?.type === 'merge'} // Allow multiple if merge is involved 
                            maxFiles={10}
                        />
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
