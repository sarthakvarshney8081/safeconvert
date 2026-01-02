"use client";

import React, { Suspense } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

function HttpStatusContent() {
    return (
        <ToolLayout
            title="HTTP Status Codes"
            description="List of standard HTTP status codes."
            icon={Info}
        >
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginTop: 0 }}>HTTP Status Codes</h3>
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Code</th>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Status</th>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>200</td><td>OK</td><td>Success</td></tr>
                            <tr><td>201</td><td>Created</td><td>Success</td></tr>
                            <tr><td>204</td><td>No Content</td><td>Success</td></tr>
                            <tr><td>301</td><td>Moved Permanently</td><td>Redirection</td></tr>
                            <tr><td>302</td><td>Found</td><td>Redirection</td></tr>
                            <tr><td>400</td><td>Bad Request</td><td>Client Error</td></tr>
                            <tr><td>401</td><td>Unauthorized</td><td>Client Error</td></tr>
                            <tr><td>403</td><td>Forbidden</td><td>Client Error</td></tr>
                            <tr><td>404</td><td>Not Found</td><td>Client Error</td></tr>
                            <tr><td>429</td><td>Too Many Requests</td><td>Client Error</td></tr>
                            <tr><td>500</td><td>Internal Server Error</td><td>Server Error</td></tr>
                            <tr><td>502</td><td>Bad Gateway</td><td>Server Error</td></tr>
                            <tr><td>503</td><td>Service Unavailable</td><td>Server Error</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </ToolLayout>
    );
}

export default function HttpStatusCodes() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HttpStatusContent />
        </Suspense>
    );
}
