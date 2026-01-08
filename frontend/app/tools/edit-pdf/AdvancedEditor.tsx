import React from 'react';
import { Loader2, Download, FileType, Tv, FileUp, ArrowLeft } from 'lucide-react';

interface AdvancedEditorProps {
    file: File | null;
    htmlContent: string;
    setHtmlContent: (html: string) => void;
    toggleAdvancedMode: () => void;
    handleAdvancedSave: () => void;
    isProcessing: boolean;
    editorZoom: number;
    setEditorZoom: (z: number | ((prev: number) => number)) => void;
    fitToPage: boolean;
    setFitToPage: (fit: boolean) => void;
    contentEditableRef: React.RefObject<HTMLDivElement | null>;
}

export default function AdvancedEditor({
    file,
    htmlContent,
    setHtmlContent,
    toggleAdvancedMode,
    handleAdvancedSave,
    isProcessing,
    editorZoom,
    setEditorZoom,
    fitToPage,
    setFitToPage,
    contentEditableRef
}: AdvancedEditorProps) {

    const hasLoadedRef = React.useRef(false);

    // Fix for Cursor Jumping: Sync HTML only on mount or when file changes, not on every keystroke.
    React.useEffect(() => {
        // Only load content if we have content AND we haven't loaded it yet (or file changed)
        if (contentEditableRef.current && htmlContent && !hasLoadedRef.current) {
            contentEditableRef.current.innerHTML = htmlContent;
            hasLoadedRef.current = true; // Mark as loaded so we don't re-run this on typing

            // Ensure Enter key creates paragraphs instead of divs
            document.execCommand('defaultParagraphSeparator', false, 'p');
        }
    }, [file, htmlContent]); // Depend on htmlContent to catch async load, but use ref to block re-runs

    // Reset load state when file changes
    React.useEffect(() => {
        hasLoadedRef.current = false;
    }, [file]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999, // Ensure it sits on top of everything including global nav
            display: 'flex',
            flexDirection: 'column',
            background: '#f0f2f5'
        }}>
            {/* Minimal Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #ddd',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 101, // Above toolbar sticky
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        type="button"
                        onClick={toggleAdvancedMode}
                        className="btn btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}
                    >
                        <ArrowLeft size={16} /> Back to Standard Mode
                    </button>
                    <div style={{ height: '24px', width: '1px', background: '#e0e0e0' }}></div>
                    <span style={{ fontWeight: 600, color: '#333' }}>
                        {file ? file.name : 'Untitled Document'}
                    </span>
                    <span style={{ background: '#ff9800', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, verticalAlign: 'middle' }}>BETA</span>
                </div>
            </div>

            {/* Toolbar */}
            {!htmlContent && !isProcessing && (
                <div style={{ textAlign: 'center', padding: '100px', color: '#666', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Loader2 className="animate-spin" size={48} style={{ marginBottom: '20px', color: 'var(--primary)' }} />
                    <p>Preparing editable document...</p>
                </div>
            )}

            {htmlContent && (
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8f9fa',
                        padding: '10px 15px',
                        borderBottom: '1px solid #ddd',
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* History */}
                            <button type="button" onClick={() => document.execCommand('undo', false)} className="btn btn-sm" title="Undo">↩</button>
                            <button type="button" onClick={() => document.execCommand('redo', false)} className="btn btn-sm" title="Redo">↪</button>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* Headings */}
                            <select
                                onChange={(e) => document.execCommand('formatBlock', false, e.target.value)}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                                defaultValue="p"
                            >
                                <option value="p">Normal</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                            </select>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* Basic Formatting */}
                            <button type="button" onClick={() => document.execCommand('bold', false)} className="btn btn-sm" style={{ fontWeight: 'bold' }} title="Bold">B</button>
                            <button type="button" onClick={() => document.execCommand('italic', false)} className="btn btn-sm" style={{ fontStyle: 'italic' }} title="Italic">I</button>
                            <button type="button" onClick={() => document.execCommand('underline', false)} className="btn btn-sm" style={{ textDecoration: 'underline' }} title="Underline">U</button>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* Lists */}
                            <button type="button" onClick={() => document.execCommand('insertUnorderedList', false)} className="btn btn-sm" title="Bullet List">• List</button>
                            <button type="button" onClick={() => document.execCommand('insertOrderedList', false)} className="btn btn-sm" title="Numbered List">1. List</button>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* Alignment */}
                            <button type="button" onClick={() => document.execCommand('justifyLeft', false)} className="btn btn-sm" title="Align Left">L</button>
                            <button type="button" onClick={() => document.execCommand('justifyCenter', false)} className="btn btn-sm" title="Center">C</button>
                            <button type="button" onClick={() => document.execCommand('justifyRight', false)} className="btn btn-sm" title="Align Right">R</button>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* Math Insertion */}
                            <button
                                type="button"
                                onClick={() => {
                                    const formula = prompt("Enter standard formula text (e.g. E = mc^2):");
                                    if (formula) {
                                        const mathHtml = `<span style="font-family: 'Times New Roman', serif; font-style: italic; background: #f0f0f0; padding: 2px 4px; border-radius: 4px;">${formula}</span>&nbsp;`;
                                        document.execCommand('insertHTML', false, mathHtml);
                                    }
                                }}
                                className="btn btn-sm"
                                title="Insert Math / Formula"
                            >
                                Σ Math
                            </button>

                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>

                            {/* View Controls */}
                            <button type="button" onClick={() => setEditorZoom(z => Math.max(0.5, z - 0.1))} className="btn btn-sm" title="Zoom Out">-</button>
                            <span style={{ fontSize: '0.8em', width: '40px', textAlign: 'center' }}>{Math.round(editorZoom * 100)}%</span>
                            <button type="button" onClick={() => setEditorZoom(z => Math.min(2.0, z + 0.1))} className="btn btn-sm" title="Zoom In">+</button>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                            {/* <button
                                type="button"
                                onClick={() => setFitToPage(!fitToPage)}
                                className="btn btn-sm"
                                style={{
                                    background: !fitToPage ? '#e3f2fd' : 'transparent',
                                    color: !fitToPage ? '#1565c0' : 'inherit',
                                    border: !fitToPage ? '1px solid #1565c0' : '1px solid transparent'
                                }}
                                title={fitToPage ? "Switch to Full Width Mode" : "Switch to A4 Page Mode"}
                            >
                                {fitToPage ? <><FileType size={14} /> View: Page</> : <><Tv size={14} /> View: Full</>}
                            </button> */}
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                            <div style={{ width: 1, background: '#ccc', height: 20, margin: '0 5px' }}></div>
                        </div>
                        <button type="button" onClick={handleAdvancedSave} className="btn btn-primary" title="Export as PDF">
                            {isProcessing ? <Loader2 className="animate-spin" /> : <Download size={18} />}
                        </button>
                    </div>

                    {/* EDITOR CANVAS */}
                    <div style={{
                        background: '#e0e0e0',
                        flex: 1,
                        overflow: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '40px'
                    }}>
                        <div
                            ref={contentEditableRef}
                            contentEditable={true}
                            onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                            onKeyDown={(e) => {
                                // Default behavior should work now that the Effect loop is fixed.
                                // We removed the heavy-handed override.
                            }}
                            style={{
                                minHeight: 'calc(100% - 40px)',
                                width: '100%', // FORCE FULL WIDTH
                                background: 'white',
                                padding: '60px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                outline: 'none',
                                transform: 'none',
                                transformOrigin: 'top center',
                                transition: 'all 0.3s ease',
                                marginBottom: '100px',
                                fontSize: '1.1rem',
                                lineHeight: 1.6,
                                maxWidth: '1200px'
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
