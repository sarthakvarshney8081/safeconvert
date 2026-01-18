"use client";

import React, { useState, useEffect } from 'react';
import { Merge, ArrowDown, ArrowUp, Trash2, Split } from 'lucide-react';
import ToolInterface from '@/components/ToolInterface';

interface Block {
    id: string;
    fileIndex: number;
    range: string; // "all", "1-3", "5", "4-end"
}

export default function MergePdfTool() {
    const [files, setLocalFiles] = useState<File[]>([]);
    const [pageCounts, setPageCounts] = useState<number[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isAdvanced, setIsAdvanced] = useState(false);

    // Load page counts when files change
    useEffect(() => {
        const loadPages = async () => {
            const counts: number[] = [...pageCounts];
            let changed = false;

            for (let i = 0; i < files.length; i++) {
                if (counts[i] === undefined) {
                    try {
                        const pdfjsLib = await import('pdfjs-dist');
                        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
                            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
                        }
                        const ab = await files[i].arrayBuffer();
                        const doc = await pdfjsLib.getDocument({ data: ab }).promise;
                        counts[i] = doc.numPages;
                        changed = true;
                    } catch (e) {
                        console.error("Error loading pages for file", i, e);
                        counts[i] = 0;
                        changed = true;
                    }
                }
            }
            if (changed) {
                setPageCounts(counts);
            }
        };
        if (files.length > 0) loadPages();
    }, [files]);

    const handleFilesChange = (newFiles: File[]) => {
        const oldLength = files.length;
        setLocalFiles(newFiles);

        // Reset counts for new indices (keeping old ones if valid? simplified: reset all > oldLength)
        // If files array is replaced, indices shift. Better to reset all counts if length mismatch or name mismatch.
        // For simplicity in this tool, we'll assume append-only or simple removal.
        // If full reset happens (Reset Button), newFiles is empty.
        if (newFiles.length === 0) {
            setPageCounts([]);
            setBlocks([]);
            return;
        }

        // If new files > old => Append blocks
        if (newFiles.length > oldLength) {
            const addedCount = newFiles.length - oldLength;
            const newBlocks: Block[] = [];
            for (let i = 0; i < addedCount; i++) {
                newBlocks.push({ id: Math.random().toString(36).substr(2, 9), fileIndex: oldLength + i, range: 'all' });
            }
            setBlocks(prev => [...prev, ...newBlocks]);
        } else if (newFiles.length < oldLength) {
            // Removed. Rebuild default blocks to be safe
            setBlocks(newFiles.map((_, i) => ({ id: Math.random().toString(36).substr(2, 9), fileIndex: i, range: 'all' })));
            setPageCounts([]); // Force reload pages to map correctly
        }
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        setBlocks(prev => {
            const copy = [...prev];
            const target = direction === 'up' ? index - 1 : index + 1;
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy;
        });
    };

    const splitBlock = (index: number) => {
        setBlocks(prev => {
            const copy = [...prev];
            const item = copy[index];
            copy.splice(index + 1, 0, { ...item, id: Math.random().toString(36).substr(2, 9), range: 'all' });
            return copy;
        });
    };

    const updateRange = (index: number, val: string) => {
        setBlocks(prev => {
            const copy = [...prev];
            copy[index].range = val;
            return copy;
        });
    };

    const removeBlock = (index: number) => {
        setBlocks(prev => prev.filter((_, i) => i !== index));
    };

    const process = async (filesData: File[], options: any) => {
        const formData = new FormData();
        filesData.forEach(f => formData.append('files', f));

        const instructions = blocks.map(b => ({
            file_index: b.fileIndex,
            pages: b.range
        }));
        formData.append('manifest', JSON.stringify(instructions));

        const res = await fetch('/api/pdf/merge', { method: 'POST', body: formData });
        if (!res.ok) {
            const txt = await res.text();
            try { throw new Error(JSON.parse(txt).detail); } catch { throw new Error(txt); }
        }

        let filename = "merged.pdf";
        const disp = res.headers.get('Content-Disposition');
        if (disp && disp.includes('filename=')) filename = disp.split('filename=')[1].replace(/"/g, '');

        return { blob: await res.blob(), fileName: filename };
    };

    return (
        <ToolInterface
            title="Merge PDF"
            description="Combine multiple PDF files into one. Drag and drop to reorder or use Advanced Mode to interleave specific pages."
            icon={Merge}
            accept=".pdf"
            multiple={true}
            onFilesChange={handleFilesChange}
            onProcess={process}
            minFiles={2}
        >
            <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Merge Sequence</h3>
                    <div className="form-check form-switch" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="advancedMode"
                            checked={isAdvanced}
                            onChange={e => setIsAdvanced(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label" htmlFor="advancedMode" style={{ cursor: 'pointer', userSelect: 'none' }}>
                            Advanced Mode (Split & Range)
                        </label>
                    </div>
                </div>

                <div className="card" style={{ padding: 10, background: '#f8f9fa' }}>
                    {files.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#999' }}> Upload files to start building sequence </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {blocks.map((block, index) => {
                                const file = files[block.fileIndex];
                                const maxPages = pageCounts[block.fileIndex] || '?';
                                return (
                                    <div key={block.id} className="card" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: 15, borderLeft: '4px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', color: '#ccc' }}>
                                            <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} style={{ border: 'none', background: 'transparent', cursor: index === 0 ? 'default' : 'pointer', padding: 2 }}>
                                                <ArrowUp size={14} color={index === 0 ? '#eee' : '#666'} />
                                            </button>
                                            <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} style={{ border: 'none', background: 'transparent', cursor: index === blocks.length - 1 ? 'default' : 'pointer', padding: 2 }}>
                                                <ArrowDown size={14} color={index === blocks.length - 1 ? '#eee' : '#666'} />
                                            </button>
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{file?.name || `Unknown File ${block.fileIndex}`}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{maxPages} Pages</div>
                                        </div>

                                        {isAdvanced && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: '0.85rem' }}>Range:</span>
                                                <input
                                                    type="text"
                                                    value={block.range}
                                                    onChange={e => updateRange(index, e.target.value)}
                                                    placeholder="e.g. 1-3, 5, all"
                                                    style={{ width: 80, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 5 }}>
                                            {isAdvanced && (
                                                <button type="button" onClick={() => splitBlock(index)} className="btn btn-sm" style={{ background: '#e3f2fd', color: '#1565c0', padding: 6 }} title="Split this block">
                                                    <Split size={16} />
                                                </button>
                                            )}
                                            <button type="button" onClick={() => removeBlock(index)} className="btn btn-sm" style={{ background: '#ffebee', color: '#c62828', padding: 6 }} title="Remove block">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {isAdvanced && (
                    <div style={{ marginTop: 10, fontSize: '0.85rem', color: '#666' }}>
                        * Range examples: <code>1-3</code>, <code>5</code>, <code>4-end</code>, <code>all</code>.
                    </div>
                )}
            </div>
        </ToolInterface>
    );
}
