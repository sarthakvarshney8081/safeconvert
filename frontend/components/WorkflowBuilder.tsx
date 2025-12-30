"use client";

import React, { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import { Plus, ArrowDown, Play, Trash2, Download } from 'lucide-react';

const ACTIONS = [
    { id: 'rotate_pdf', label: 'Rotate PDF', params: [{ name: 'angle', type: 'select', options: ['90', '180', '270'] }] },
    { id: 'compress_image', label: 'Compress Image', params: [{ name: 'quality', type: 'number', default: 60 }] },
    { id: 'convert_image_to_pdf', label: 'Image to PDF', params: [] },
    { id: 'convert_pdf_to_image', label: 'PDF to Image', params: [{ name: 'fmt', type: 'select', options: ['png', 'jpeg'] }] }
];

export default function WorkflowBuilder() {
    const [file, setFile] = useState<File | null>(null);
    const [steps, setSteps] = useState<any[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const addStep = (actionId: string) => {
        const action = ACTIONS.find(a => a.id === actionId);
        if (action) {
            const defaultParams: any = {};
            action.params.forEach((p: any) => {
                defaultParams[p.name] = p.default || (p.options ? p.options[0] : '');
            });
            setSteps([...steps, { ...action, params: defaultParams, instanceId: Date.now() }]);
        }
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateParam = (stepIndex: number, paramName: string, value: any) => {
        const newSteps = [...steps];
        newSteps[stepIndex].params[paramName] = value;
        setSteps(newSteps);
    };

    const handleRun = async () => {
        if (!file || steps.length === 0) return;
        setStatus('processing');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const workflowPayload = steps.map(s => ({
                type: s.id,
                params: s.params
            }));
            formData.append('workflow_json', JSON.stringify(workflowPayload));

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/workflow/run`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Workflow failed');

            const blob = await res.blob();
            setResultUrl(URL.createObjectURL(blob));
            setStatus('completed');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: 800 }}>
            <h1 style={{ marginBottom: 20 }}>Workflow Builder</h1>
            <p style={{ marginBottom: 40, color: '#666' }}>Chain multiple actions together to process your file.</p>

            <div className="card" style={{ padding: 30, marginBottom: 30 }}>
                <h3 style={{ marginBottom: 20 }}>1. Upload Input File</h3>
                {!file ? (
                    <FileDropzone onFilesSelected={(files) => setFile(files[0])} multiple={false} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 15, background: '#f5f5f7', borderRadius: 8 }}>
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                        <button onClick={() => setFile(null)} style={{ marginLeft: 'auto', color: 'red', border: 'none', background: 'none' }}>Change</button>
                    </div>
                )}
            </div>

            {file && (
                <div className="card" style={{ padding: 30, marginBottom: 30 }}>
                    <h3 style={{ marginBottom: 20 }}>2. Build Steps</h3>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                        {ACTIONS.map(action => (
                            <button key={action.id} onClick={() => addStep(action.id)} className="btn" style={{ background: '#f0f0f0', fontSize: '0.9rem' }}>
                                <Plus size={16} style={{ marginRight: 5 }} /> {action.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {steps.map((step, i) => (
                            <div key={step.instanceId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {i > 0 && <ArrowDown size={20} style={{ color: '#ccc', margin: '5px 0' }} />}

                                <div style={{ width: '100%', padding: 15, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontWeight: 600 }}>{step.label}</span>
                                        <button onClick={() => removeStep(i)} style={{ color: '#999', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                                    </div>

                                    {step.params.length > 0 && (
                                        <div style={{ display: 'grid', gap: 10 }}>
                                            {step.params.map((p: any) => (
                                                <div key={p.name}>
                                                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>{p.name}</label>
                                                    {p.type === 'select' ? (
                                                        <select
                                                            value={step.params[p.name]}
                                                            onChange={(e) => updateParam(i, p.name, e.target.value)}
                                                            style={{ width: '100%', padding: 5 }}
                                                        >
                                                            {p.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={p.type}
                                                            value={step.params[p.name]}
                                                            onChange={(e) => updateParam(i, p.name, e.target.value)}
                                                            style={{ width: '100%', padding: 5 }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {steps.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                    <button onClick={handleRun} disabled={status === 'processing'} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px' }}>
                        {status === 'processing' ? 'Processing...' : (
                            <>
                                <Play size={20} style={{ marginRight: 10 }} /> Run Workflow
                            </>
                        )}
                    </button>
                </div>
            )}

            {status === 'completed' && resultUrl && (
                <div className="card" style={{ padding: 30, marginTop: 30, textAlign: 'center', background: '#e8f5e9' }}>
                    <h3>Workflow Completed!</h3>
                    <div style={{ marginTop: 20 }}>
                        <a href={resultUrl} download="workflow_result" className="btn btn-primary">
                            <Download size={20} style={{ marginRight: 10 }} /> Download Result
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
