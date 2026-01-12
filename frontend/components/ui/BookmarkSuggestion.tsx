"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark, X } from 'lucide-react';

export default function BookmarkSuggestion() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the suggestion
        const dismissed = localStorage.getItem('bookmark-suggestion-dismissed');
        if (!dismissed) {
            // Show after a small delay to not overwhelm the user immediately upon completion
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('bookmark-suggestion-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#fff8e1',
            border: '1px solid #ffe0b2',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#8d6e63',
            fontSize: '0.95rem',
            position: 'relative',
            animation: 'fadeIn 0.5s ease'
        }}>
            <div style={{
                background: '#ffecb3',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Bookmark size={18} color="#f57c00" />
            </div>

            <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ fontWeight: 600, color: '#e65100' }}>Quick Tip:</span> Press <code style={{ background: 'rgba(255,255,255,0.5)', padding: '2px 4px', borderRadius: '4px', border: '1px solid #ffe0b2' }}>Ctrl+D</code> (or <code style={{ background: 'rgba(255,255,255,0.5)', padding: '2px 4px', borderRadius: '4px', border: '1px solid #ffe0b2' }}>⌘+D</code>) to bookmark this tool for easier access next time!
            </div>

            <button
                onClick={handleDismiss}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#a1887f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                aria-label="Dismiss"
            >
                <X size={18} />
            </button>
        </div>
    );
}
