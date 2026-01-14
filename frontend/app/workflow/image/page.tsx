"use client";

import React, { useState } from 'react';
import CustomWorkflowBuilder, { WorkflowStep } from '@/components/CustomWorkflowBuilder';
import { Image as ImageIcon, Maximize2, FileImage, FileType, Scissors, Minimize2 } from 'lucide-react';
import InteractiveWorkflow from '@/components/InteractiveWorkflow';
import FileDropzone from '@/components/ui/FileDropzone';

const IMAGE_STEPS: Omit<WorkflowStep, 'id'>[] = [
    { type: 'compress_img', label: 'Compress Image', icon: Minimize2 },
    { type: 'resize', label: 'Resize Image', icon: Maximize2 },
    { type: 'to_pdf', label: 'Convert to PDF', icon: FileImage },
    { type: 'convert_format', label: 'Convert Format', icon: FileType },
    { type: 'crop', label: 'Crop Image', icon: Scissors },
];

export default function ImageWorkflowPage() {
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
                    availableSteps={IMAGE_STEPS}
                    title="Image Processing Workflow"
                    description="Optimize, resize, and convert your images in one go."
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Upload Images</h2>
                        <p style={{ color: '#666' }}>
                            Selected Workflow: {customSteps.map(s => s.label).join(' → ')}
                        </p>
                    </div>

                    <div className="card">
                        <FileDropzone
                            onFilesSelected={(files) => setInitialFiles(files)}
                            accept=".png,.jpg,.jpeg,.webp,.bmp"
                            multiple={true}
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
