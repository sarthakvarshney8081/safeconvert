"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileUp, Play, Download, Loader2, Code as CodeIcon, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for VisualEditorWrapper to avoid SSR issues
const VisualEditorWrapper = dynamic(() => import('./VisualEditorWrapper'), {
    ssr: false,
    loading: () => <p>Loading Editor...</p>
});

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{hyperref}

\\title{My Resume}
\\author{John Doe}
\\date{\\today}

\\begin{document}

\\maketitle

\\section*{Summary}
Experienced software engineer with a passion for privacy-focused web applications.

\\section*{Experience}
\\textbf{Company A} - Senior Developer \\\\
\\textit{2020 - Present} \\\\
Built scalable backend services using Python and Rust.

\\section*{Education}
\\textbf{University of Tech} \\\\
B.S. Computer Science

\\end{document}
`;

const DEFAULT_HTML = `
<h1>My Resume</h1>
<p><strong>Summary</strong></p>
<p>Experienced software engineer with a passion for privacy-focused web applications.</p>
<p><strong>Experience</strong></p>
<p><strong>Company A</strong> - Senior Developer<br><em>2020 - Present</em><br>Built scalable backend services using Python and Rust.</p>
`;

export default function LatexEditor() {
    const [activeTab, setActiveTab] = useState<'code' | 'visual'>('code');
    const [code, setCode] = useState(DEFAULT_LATEX);
    const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const [isDecompiling, setIsDecompiling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Basic RegExp-based LaTeX to HTML converter for Preview
    const latexToHtml = (latex: string) => {
        let html = latex;

        // 1. Extract Body Content only (if document env exists)
        const bodyMatch = html.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
        if (bodyMatch && bodyMatch[1]) {
            html = bodyMatch[1];
        } else {
            // Fallback: Strip common preamble commands if no env found
            html = html.replace(/\\documentclass[\s\S]*?\\begin\{document\}/, '');
        }

        // 2. Remove Metadata / Title commands that might linger
        html = html.replace(/\\title\{.*?\}/g, '')
            .replace(/\\author\{.*?\}/g, '')
            .replace(/\\date\{.*?\}/g, '')
            .replace(/\\maketitle/g, '<h1>My Resume</h1>');

        // 3. Structural Conversions
        html = html.replace(/\\section\*?\{([\s\S]*?)\}/g, '<h1>$1</h1>')
            .replace(/\\subsection\*?\{([\s\S]*?)\}/g, '<h2>$1</h2>')
            .replace(/\\subsubsection\*?\{([\s\S]*?)\}/g, '<h3>$1</h3>')
            .replace(/\\centering\{([\s\S]*?)\}/g, '<center>$1</center>')
            .replace(/\{\\centering ([\s\S]*?)\}/g, '<center>$1</center>')
            .replace(/\\titlerule/g, '<hr>');

        // 4. Text Formatting & Links
        html = html.replace(/\\textbf\{([\s\S]*?)\}/g, '<strong>$1</strong>')
            .replace(/\\textit\{([\s\S]*?)\}/g, '<em>$1</em>')
            .replace(/\\underline\{([\s\S]*?)\}/g, '<u>$1</u>')
            .replace(/\\emph\{([\s\S]*?)\}/g, '<em>$1</em>')
            .replace(/\\href\{([^}]+)\}\{([\s\S]*?)\}/g, '<a href="$1">$2</a>');

        // 5. Lists
        html = html.replace(/\\begin\{itemize\}/g, '<ul>')
            .replace(/\\end\{itemize\}/g, '</ul>')
            .replace(/\\begin\{enumerate\}/g, '<ol>')
            .replace(/\\end\{enumerate\}/g, '</ol>')
            .replace(/\\item\s+([\s\S]*?)(?=\\item|\\end\{itemize\}|\\end\{enumerate\}|$)/g, '<li>$1</li>');

        // 6. Newlines & Cleanup
        html = html.replace(/\r\n/g, '\n');
        html = html.replace(/\n\s*\n+/g, '</p><p>'); // Double newline -> Paragraph break
        html = html.replace(/\\\\/g, '<br>');      // Explicit LaTeX break -> Break

        // Wrap in p tags if needed
        if (!html.trim().startsWith('<h') && !html.trim().startsWith('<p') && !html.trim().startsWith('<ul') && !html.trim().startsWith('<ol') && !html.trim().startsWith('<hr')) {
            html = `<p>${html}</p>`;
        }

        return html.trim();
    };

    const handleTabChange = async (tab: 'code' | 'visual') => {
        if (tab === activeTab) return;

        setIsCompiling(true); // Re-use spinner for conversion state
        try {
            if (tab === 'visual') {
                // Code -> Visual: Parse LaTeX to HTML
                const convertedHtml = latexToHtml(code);
                setHtmlContent(convertedHtml);
                setActiveTab('visual');
            } else {
                // Visual -> Code: Call API to convert HTML to LaTeX
                const convertRes = await fetch('/api/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html: htmlContent }),
                });

                if (!convertRes.ok) throw new Error("Conversion failed");

                const convertData = await convertRes.json();
                const bodyLatex = convertData.latex;

                // Wrap in standard template
                const latexToSend = `\\documentclass{article}
\\usepackage{geometry}
\\usepackage{hyperref}
\\geometry{a4paper, margin=1in}
\\begin{document}
${bodyLatex}
\\end{document}`;

                setCode(latexToSend);
                setActiveTab('code');
            }
        } catch (err) {
            console.error("Sync error:", err);
            // Fallback: just switch tab
            setActiveTab(tab);
        } finally {
            setIsCompiling(false);
        }
    };

    const handleCompile = async () => {
        setIsCompiling(true);
        setError(null);
        try {
            let latexToSend = code;

            // If in Visual Mode, first convert HTML to LaTeX via API
            if (activeTab === 'visual') {
                const convertRes = await fetch('/api/convert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html: htmlContent }),
                });

                if (!convertRes.ok) {
                    throw new Error("Failed to convert Visual content to LaTeX");
                }

                const convertData = await convertRes.json();
                let bodyLatex = convertData.latex;

                // Debug: Ensure bodyLatex is a string
                if (typeof bodyLatex === 'object') {
                    console.warn("bodyLatex is an object, stringifying:", bodyLatex);
                    bodyLatex = JSON.stringify(bodyLatex);
                }

                // Wrap in standard template
                latexToSend = `\\documentclass{article}
\\usepackage{geometry}
\\usepackage{hyperref}
\\geometry{a4paper, margin=1in}
\\begin{document}
${bodyLatex}
\\end{document}`;

                // Update Code View with the new conversion
                setCode(latexToSend);
            }

            // Compile LaTeX to PDF
            const formData = new FormData();
            formData.append('latex_code', latexToSend);

            const res = await fetch('/api/resume/compile', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || "Compilation failed");
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCompiling(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setIsDecompiling(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/resume/decompile', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error("Decompilation failed");

            const data = await res.json();

            // Insert extracted text into a template
            const newCode = `\\documentclass{article}
\\begin{document}
% Extracted from PDF (Best Effort)

${data.extracted_text}

\\end{document}`;
            setCode(newCode);
            // Switch to code mode as we have raw text
            setActiveTab('code');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDecompiling(false);
            e.target.value = "";
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '85vh', gap: 20 }}>
            {/* Header with Title and Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>LaTeX to PDF Builder</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>Write standard LaTeX code to generate privacy-focused documents.</p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {error && <span style={{ color: 'red', fontSize: '0.85rem' }}>Error: {error}</span>}

                    <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            {isDecompiling ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                            Import PDF
                        </button>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={isDecompiling}
                            style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    <button
                        onClick={handleCompile}
                        disabled={isCompiling}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: isCompiling ? 0.7 : 1, boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4), 0 2px 4px -1px rgba(37, 99, 235, 0.2)' }}
                    >
                        {isCompiling ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        Compile PDF
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, gap: 20, minHeight: 0 }}>
                {/* Left Panel: Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {/* Visual/Code Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                        <button
                            onClick={() => handleTabChange('code')}
                            disabled={isCompiling}
                            style={{
                                flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: activeTab === 'code' ? 'white' : '#f8fafc',
                                borderBottom: activeTab === 'code' ? '2px solid #2563eb' : 'none',
                                fontWeight: activeTab === 'code' ? 600 : 500,
                                color: activeTab === 'code' ? '#2563eb' : '#64748b',
                                cursor: 'pointer', outline: 'none', border: 'none', borderRight: '1px solid #e2e8f0',
                                opacity: isCompiling ? 0.5 : 1
                            }}
                        >
                            <CodeIcon size={16} /> LaTeX Code
                        </button>
                        <button
                            onClick={() => handleTabChange('visual')}
                            disabled={isCompiling}
                            style={{
                                flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: activeTab === 'visual' ? 'white' : '#f8fafc',
                                borderBottom: activeTab === 'visual' ? '2px solid #2563eb' : 'none',
                                fontWeight: activeTab === 'visual' ? 600 : 500,
                                color: activeTab === 'visual' ? '#2563eb' : '#64748b',
                                cursor: 'pointer', outline: 'none', border: 'none',
                                opacity: isCompiling ? 0.5 : 1
                            }}
                        >
                            <Eye size={16} /> Visual Editor
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        {activeTab === 'code' ? (
                            <Editor
                                height="100%"
                                defaultLanguage="latex"
                                value={code}
                                onChange={(val) => setCode(val || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false
                                }}
                            />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <VisualEditorWrapper
                                    value={htmlContent}
                                    onChange={setHtmlContent}
                                />
                                <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    <strong>Note:</strong> Visual mode supports text & basic formatting. Use <strong>Code Mode</strong> for Tables & Columns.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div style={{ background: '#525659', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {pdfUrl ? (
                        <iframe src={pdfUrl} width="100%" height="100%" style={{ border: 'none' }} />
                    ) : (
                        <div style={{ color: '#d1d5db', textAlign: 'center' }}>
                            <div style={{ marginBottom: 16 }}>
                                <Play size={48} style={{ opacity: 0.5 }} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Ready to Compile</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Click "Compile PDF" to render your document.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
