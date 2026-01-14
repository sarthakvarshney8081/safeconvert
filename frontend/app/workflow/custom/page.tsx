"use client";

import React, { useState } from 'react';
import CustomWorkflowBuilder, { WorkflowStep } from '@/components/CustomWorkflowBuilder';
import ToolInterface from '@/components/ToolInterface';

export default function CustomWorkflowPage() {
    const [view, setView] = useState<'builder' | 'runner'>('builder');
    const [customSteps, setCustomSteps] = useState<WorkflowStep[]>([]);

    const handleCustomComplete = (steps: WorkflowStep[]) => {
        setCustomSteps(steps);
        setView('runner');
    };

    const processCustomWorkflow = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('workflow_json', JSON.stringify(customSteps.map(s => ({ type: s.type }))));

        // Placeholder endpoint usage
        const endpoint = '/api/ocr/scan-pdf';
        formData.append('workflow', 'custom_chain');

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "Workflow processing failed" }));
            throw new Error(err.detail || "Processing failed");
        }
        return await response.blob();
    };

    if (view === 'builder') {
        return (
            <div className="container" style={{ padding: '20px' }}>
                <CustomWorkflowBuilder
                    onComplete={handleCustomComplete}
                    onCancel={() => window.history.back()}
                />
            </div>
        );
    }

    return (
        <ToolInterface
            title={`Custom Workflow: ${customSteps.map(s => s.label).join(' → ')}`}
            description="Processing your file through the defined custom pipeline."
            accept=".pdf,.png,.jpg,.jpeg"
            apiEndpoint="/api/ocr/scan-pdf" // Placeholder
            onProcess={processCustomWorkflow}
            resultFileName="workflow_result.pdf"
            processingMode="server"
            optionsComponent={
                <div style={{ padding: 15, background: '#f5f5f7', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Pipeline Steps:</h4>
                    <ol style={{ paddingLeft: 20, margin: 0, fontSize: '0.9rem', color: '#666' }}>
                        {customSteps.map((s, i) => (
                            <li key={s.id} style={{ marginBottom: 4 }}>{s.label}</li>
                        ))}
                    </ol>
                    <button
                        onClick={() => setView('builder')}
                        style={{ marginTop: 15, background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                    >
                        Edit Pipeline
                    </button>
                </div>
            }
        />
    );
}
