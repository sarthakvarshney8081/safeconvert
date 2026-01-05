"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileDigit, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const links = [
        { href: '/tools', label: 'PDF Tools' },
        { href: '/it-tools', label: 'IT Tools' },
        { href: '/latex-builder', label: 'LaTeX Builder' },
        { href: '/workflow', label: 'Workflows' },
        { href: '/about', label: 'About' },
    ];

    const isActive = (path: string) => {
        if (path === '/' && pathname !== '/') return false;
        return pathname.startsWith(path);
    };

    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
                    <FileDigit size={32} />
                    SafeConverts
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '20px' }}>
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`btn ${isActive(link.href) ? 'btn-active' : ''}`}
                            style={{
                                color: isActive(link.href) ? 'var(--primary)' : 'inherit',
                                background: isActive(link.href) ? 'rgba(98, 0, 238, 0.08)' : 'transparent',
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    borderBottom: '1px solid #eee',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                color: isActive(link.href) ? 'var(--primary)' : 'inherit',
                                background: isActive(link.href) ? 'rgba(98, 0, 238, 0.08)' : 'transparent',
                                fontWeight: 500
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}


        </nav>
    );
}
