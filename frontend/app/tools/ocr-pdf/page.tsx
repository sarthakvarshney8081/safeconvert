"use client";

import React, { useState } from 'react';
import ToolInterface from '@/components/ToolInterface';
import DetailedWorkflowSelector from '@/components/DetailedWorkflowSelector';
import CustomWorkflowBuilder, { WorkflowStep } from '@/components/CustomWorkflowBuilder';
import { FileText, LayoutTemplate, Type, PenTool, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function ScanPdfTool() {
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
    const [customSteps, setCustomSteps] = useState<WorkflowStep[]>([]);
    const [isBuildingCustom, setIsBuildingCustom] = useState(false);

    const workflows = [
        {
            id: 'standard',
            title: 'Standard OCR',
            description: 'A balanced approach suitable for most documents. Extracts text while attempting to maintain basic paragraph structure.',
            icon: FileText,
            features: ['Smart Text Detection', 'Basic Formatting', 'Multi-language Support', 'Fast Processing'],
            bestFor: 'General documents, articles, and books.',
            limitations: 'May not perfectly align complex tables.'
        },
        {
            id: 'layout',
            title: 'Layout Preservation',
            description: 'Strictly maintains the visual layout of the original document. Text blocks are placed at their exact coordinates.',
            icon: LayoutTemplate,
            badge: 'Recommended',
            features: ['Exact Positioning', 'Form Retention', 'Table Reconstruction', 'Image Preservation'],
            bestFor: 'Invoices, forms, receipts, and complex reports.',
            limitations: 'Generated text might be harder to edit sequentially.'
        },
        {
            id: 'handwriting',
            title: 'Handwriting Recognition',
            description: 'A specialized neural network model trained specifically to decipher and convert handwritten notes into digital text.',
            icon: PenTool,
            badge: 'Beta',
            features: ['Cursive Support', 'Note Digitization', 'Context Awareness', 'Style Adaptation'],
            bestFor: 'Class notes, meeting minutes, and letters.',
            limitations: 'Accuracy depends heavily on handwriting clarity.'
        }
    ];

    const handleWorkflowSelect = (id: string) => {
        if (id === 'custom') {
            setIsBuildingCustom(true);
        } else {
            setSelectedWorkflow(id);
            setCustomSteps([]); // Clear custom steps if switching to preset
        }
    };

    const handleCustomComplete = (steps: WorkflowStep[]) => {
        setCustomSteps(steps);
        setSelectedWorkflow('custom');
        setIsBuildingCustom(false);
    };

    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('lang', options.lang || 'eng');

        if (selectedWorkflow === 'custom') {
            formData.append('workflow', 'custom');
            formData.append('custom_steps', JSON.stringify(customSteps.map(s => s.type)));
        } else {
            formData.append('workflow', selectedWorkflow || 'standard');
        }

        const response = await fetch('/api/ocr/scan-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "OCR processing failed");
        }
        return await response.blob();
    };

    if (isBuildingCustom) {
        return (
            <CustomWorkflowBuilder
                onComplete={handleCustomComplete}
                onCancel={() => setIsBuildingCustom(false)}
            />
        );
    }

    if (!selectedWorkflow) {
        return (
            <div>
                <DetailedWorkflowSelector
                    title="OCR Workflow Builder"
                    description="Select the optimal processing pipeline for your document type."
                    workflows={workflows}
                    onSelect={handleWorkflowSelect}
                />
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" className="btn" style={{ background: '#f5f5f7', color: '#666' }}>
                        Back to Tools
                    </Link>
                </div>
            </div>
        );
    }

    const getToolTitle = () => {
        if (selectedWorkflow === 'custom') {
            return `Custom: ${customSteps.map(s => s.label).join(' → ')}`;
        }
        return `OCR PDF - ${workflows.find(w => w.id === selectedWorkflow)?.title}`;
    };

    return (
        <ToolInterface
            title={getToolTitle()}
            description={selectedWorkflow === 'custom' ? "Processing your custom workflow chain." : "Convert scanned documents into searchable, selectable PDF text."}
            accept=".pdf,.png,.jpg,.jpeg"
            apiEndpoint="/api/ocr/scan-pdf"
            onProcess={processFile}
            resultFileName="searchable.pdf"
            optionsComponent={
                <div>
                    <div style={{ marginBottom: 20, padding: 15, background: '#e3f2fd', borderRadius: 8, fontSize: '0.9rem', color: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Using Workflow: <strong>{selectedWorkflow === 'custom' ? 'Custom Chain' : workflows.find(w => w.id === selectedWorkflow)?.title}</strong></span>
                        <button
                            onClick={() => setSelectedWorkflow(null)}
                            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
                        >
                            Change
                        </button>
                    </div>

                    <label style={{ display: 'block', marginBottom: 5 }}>Document Language</label>
                    <select name="lang" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                        <option value="eng">English</option>
                        <option value="hin">Hindi</option>
                        <option value="fra">French</option>
                        <option value="deu">German</option>
                        <option value="spa">Spanish</option>
                    </select>
                </div>
            }
            processingMode="server"
        />
    );
}
