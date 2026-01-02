'use client';

import React, { useState } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Rss, CheckCircle, XCircle, AlertTriangle, FileJson, Activity } from 'lucide-react';

export default function RSSFeedValidator() {
    const [inputMode, setInputMode] = useState<'url' | 'content'>('url');
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        if (inputMode === 'url') {
            formData.append('url', url);
        } else {
            formData.append('content', content);
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
            const res = await fetch(`${apiBase}/web/rss-validate`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to validate feed');
            }

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while validating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolLayout
            title="RSS Feed Validator"
            description="Validate RSS and Atom feeds. Check syntax and compatibility with standard readers."
            icon={<Rss className="w-10 h-10 text-orange-500" />}
        >
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
                        <button
                            onClick={() => setInputMode('url')}
                            className={`pb-2 px-4 font-medium transition-colors ${inputMode === 'url' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Validate by URL
                        </button>
                        <button
                            onClick={() => setInputMode('content')}
                            className={`pb-2 px-4 font-medium transition-colors ${inputMode === 'content' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Validate by Direct Input
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {inputMode === 'url' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Feed URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com/feed.xml"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">XML Content</label>
                                <textarea
                                    required
                                    rows={10}
                                    placeholder="<?xml version='1.0' encoding='UTF-8'?>..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-medium text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'}`}
                        >
                            {loading ? 'Validating...' : 'Check Feed'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
                            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                        <div className={`p-6 border-b ${result.valid ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {result.valid ? (
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-600" />
                                )}
                                <div>
                                    <h3 className={`text-xl font-bold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.valid ? 'Valid Feed' : 'Invalid Feed'}
                                    </h3>
                                    <p className={`text-sm ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.title || 'Unknown Feed'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Feed Details</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Format/Version:</span>
                                            <span className="font-medium">{result.version || 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Items Count:</span>
                                            <span className="font-medium">{result.entries_count}</span>
                                        </div>
                                    </div>
                                </div>

                                {result.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                            {result.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {result.errors && result.errors.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Errors
                                        </h4>
                                        <ul className="bg-red-50 rounded-lg p-4 space-y-2 text-sm text-red-700">
                                            {result.errors.map((err: string, i: number) => (
                                                <li key={i} className="flex gap-2">
                                                    <span className="text-red-400">•</span>
                                                    {err}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Placeholder for warnings if we add them later */}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
