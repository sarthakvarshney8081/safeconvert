"use client";

import React, { useState } from 'react';
import nextDynamic from 'next/dynamic';
import ToolCard from '@/components/ui/ToolCard';
import Link from 'next/link';

// Dynamically import icons to prevent build-time static generation issues with lucide-react exports
const Fingerprint = nextDynamic(() => import('lucide-react').then(mod => mod.Fingerprint));
const Hash = nextDynamic(() => import('lucide-react').then(mod => mod.Hash));
const Code = nextDynamic(() => import('lucide-react').then(mod => mod.Code));
const Key = nextDynamic(() => import('lucide-react').then(mod => mod.Key));
const LayoutGrid = nextDynamic(() => import('lucide-react').then(mod => mod.LayoutGrid));
const FileDigit = nextDynamic(() => import('lucide-react').then(mod => mod.FileDigit));
const ArrowDownAZ = nextDynamic(() => import('lucide-react').then(mod => mod.ArrowDownAZ));
const Lock = nextDynamic(() => import('lucide-react').then(mod => mod.Lock));
const KeyRound = nextDynamic(() => import('lucide-react').then(mod => mod.KeyRound));
const ShieldCheck = nextDynamic(() => import('lucide-react').then(mod => mod.ShieldCheck));
const FileSignature = nextDynamic(() => import('lucide-react').then(mod => mod.FileSignature));
const CalendarClock = nextDynamic(() => import('lucide-react').then(mod => mod.CalendarClock));
const ArrowLeftRight = nextDynamic(() => import('lucide-react').then(mod => mod.ArrowLeftRight));
const Type = nextDynamic(() => import('lucide-react').then(mod => mod.Type));
const FileCode = nextDynamic(() => import('lucide-react').then(mod => mod.FileCode));
const Palette = nextDynamic(() => import('lucide-react').then(mod => mod.Palette));
const List = nextDynamic(() => import('lucide-react').then(mod => mod.List));
const Globe = nextDynamic(() => import('lucide-react').then(mod => mod.Globe));
const FileDiff = nextDynamic(() => import('lucide-react').then(mod => mod.FileDiff));
const AlignLeft = nextDynamic(() => import('lucide-react').then(mod => mod.AlignLeft));
const Calculator = nextDynamic(() => import('lucide-react').then(mod => mod.Calculator));
const Timer = nextDynamic(() => import('lucide-react').then(mod => mod.Timer));
const NetworkIcon = nextDynamic(() => import('lucide-react').then(mod => mod.Network));
const BoxIcon = nextDynamic(() => import('lucide-react').then(mod => mod.Box));
const QrCode = nextDynamic(() => import('lucide-react').then(mod => mod.QrCode));
const Wifi = nextDynamic(() => import('lucide-react').then(mod => mod.Wifi));
const CameraIcon = nextDynamic(() => import('lucide-react').then(mod => mod.Camera));
const ArrowLeft = nextDynamic(() => import('lucide-react').then(mod => mod.ArrowLeft));
const LinkIcon = nextDynamic(() => import('lucide-react').then(mod => mod.Link));
const Search = nextDynamic(() => import('lucide-react').then(mod => mod.Search));
const Clock = nextDynamic(() => import('lucide-react').then(mod => mod.Clock));
const Shield = nextDynamic(() => import('lucide-react').then(mod => mod.Shield));
const Code2 = nextDynamic(() => import('lucide-react').then(mod => mod.Code2));
const FileText = nextDynamic(() => import('lucide-react').then(mod => mod.FileText));
const ImageIcon = nextDynamic(() => import('lucide-react').then(mod => mod.Image));
const Info = nextDynamic(() => import('lucide-react').then(mod => mod.Info));
const Rss = nextDynamic(() => import('lucide-react').then(mod => mod.Rss));

export const dynamic = 'force-dynamic';

export default function ITToolsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const allTools = [
        // Crypto & Security
        {
            category: 'Crypto & Security',
            title: 'Hash Text',
            description: 'MD5, SHA1, SHA256, RipeMD160 hashing.',
            icon: FileDigit,
            href: '/it-tools/hash-text',
            color: '#607D8B'
        },
        {
            category: 'Crypto & Security',
            title: 'Bcrypt Generator',
            description: 'Hash strings and verify passwords.',
            icon: Hash,
            href: '/it-tools/bcrypt-generator',
            color: '#E91E63'
        },
        {
            category: 'Crypto & Security',
            title: 'HMAC Generator',
            description: 'Keyed-Hash Message Authentication Code.',
            icon: Key,
            href: '/it-tools/hmac-generator',
            color: '#795548'
        },
        {
            category: 'Crypto & Security',
            title: 'RSA Key Pair',
            description: 'Generate PEM-formatted public/private keys.',
            icon: Key,
            href: '/it-tools/rsa-key-pair-generator',
            color: '#3F51B5'
        },
        {
            category: 'Crypto & Security',
            title: 'Encrypt / Decrypt',
            description: 'AES, TripleDES, Rabbit, RC4 encryption.',
            icon: Lock,
            href: '/it-tools/encryption',
            color: '#F44336'
        },
        {
            category: 'Crypto & Security',
            title: 'BIP39 Passphrase',
            description: 'Generate mnemonic phrases for crypto wallets.',
            icon: KeyRound,
            href: '/it-tools/bip39-generator',
            color: '#8BC34A'
        },
        {
            category: 'Crypto & Security',
            title: 'Password Strength',
            description: 'Analyze entropy and crack time estimation.',
            icon: ShieldCheck,
            href: '/it-tools/password-strength-analyser',
            color: '#4CAF50'
        },
        {
            category: 'Crypto & Security',
            title: 'PDF Sign Checker',
            description: 'Verify digital signatures in PDF files.',
            icon: FileSignature,
            href: '/it-tools/pdf-signature-checker',
            color: '#9C27B0'
        },

        // Generators
        {
            category: 'Generators',
            title: 'UUID Generator',
            description: 'Generate v1, v4 (random), and v5 UUIDs.',
            icon: Fingerprint,
            href: '/it-tools/uuid-generator',
            color: '#673AB7'
        },
        {
            category: 'Generators',
            title: 'Token Generator',
            description: 'Generate random access tokens.',
            icon: Key,
            href: '/it-tools/token-generator',
            color: '#FF9800'
        },
        {
            category: 'Generators',
            title: 'ULID Generator',
            description: 'Universally Unique Lexicographically Sortable ID.',
            icon: ArrowDownAZ,
            href: '/it-tools/ulid-generator',
            color: '#00BCD4'
        },
        {
            category: 'Generators',
            title: 'QR Code',
            description: 'Create QR codes for text, URLs.',
            icon: QrCode,
            href: '/it-tools/qr-code-generator',
            color: '#000000'
        },
        {
            category: 'Generators',
            title: 'WiFi QR Code',
            description: 'Generate QR codes for WiFi connections.',
            icon: Wifi,
            href: '/it-tools/wifi-qr-code',
            color: '#2196F3'
        },
        {
            category: 'Generators',
            title: 'SVG Placeholder',
            description: 'Generate simple SVG placeholder images.',
            icon: ImageIcon,
            href: '/it-tools/svg-placeholder-generator',
            color: '#FFC107'
        },

        // Converters
        {
            category: 'Converters',
            title: 'Date-Time Converter',
            description: 'Convert ISO, RFC, Timestamp dates.',
            href: '/it-tools/date-time-converter',
            icon: CalendarClock,
            color: '#e91e63'
        },
        {
            category: 'Converters',
            title: 'Integer Base',
            description: 'Binary, Octal, Decimal, Hex converter.',
            href: '/it-tools/integer-base-converter',
            icon: ArrowLeftRight,
            color: '#9c27b0'
        },
        {
            category: 'Converters',
            title: 'Roman Numerals',
            description: 'Convert between Arabic and Roman numerals.',
            href: '/it-tools/roman-numeral-converter',
            icon: Type,
            color: '#673ab7'
        },
        {
            category: 'Converters',
            title: 'Base64 Converter',
            description: 'Encode/Decode strings and files.',
            href: '/it-tools/base64-converter',
            icon: FileCode,
            color: '#3f51b5'
        },
        {
            category: 'Converters',
            title: 'Color Converter',
            description: 'HEX, RGB, HSL, CMYK conversions.',
            href: '/it-tools/color-converter',
            icon: Palette,
            color: '#2196f3'
        },
        {
            category: 'Converters',
            title: 'Case Converter',
            description: 'camelCase, snake_case, etc.',
            href: '/it-tools/case-converter',
            icon: Type,
            color: '#03a9f4'
        },
        {
            category: 'Converters',
            title: 'Text Tools',
            description: 'NATO, ASCII Binary, Unicode.',
            href: '/it-tools/text-tools',
            icon: Type,
            color: '#00bcd4'
        },
        {
            category: 'Converters',
            title: 'List Converter',
            description: 'Sort, deduplicate, and format lists.',
            href: '/it-tools/list-converter',
            icon: List,
            color: '#009688'
        },
        {
            category: 'Converters',
            title: 'Data Format',
            description: 'JSON, YAML, TOML, XML converter.',
            href: '/it-tools/data-converter',
            icon: FileCode,
            color: '#4caf50'
        },
        {
            category: 'Converters',
            title: 'Markdown to HTML',
            description: 'Render markdown with live preview.',
            icon: Code,
            href: '/it-tools/markdown-to-html',
            color: '#2196F3'
        },

        // Web & Developer
        {
            category: 'Web & Developer',
            title: 'JWT Parser',
            description: 'Decode and debug JWT tokens.',
            href: '/it-tools/jwt-parser',
            icon: KeyRound,
            color: '#e91e63'
        },
        {
            category: 'Web & Developer',
            title: 'URL Parser',
            description: 'Breakdown URLs and query params.',
            href: '/it-tools/url-parser',
            icon: LinkIcon,
            color: '#2196f3'
        },
        {
            category: 'Web & Developer',
            title: 'HTML Entities',
            description: 'Escape or Unescape HTML characters.',
            href: '/it-tools/html-tools',
            icon: Code,
            color: '#ff9800'
        },
        {
            category: 'Web & Developer',
            title: 'User-Agent',
            description: 'Parse browser and OS strings.',
            href: '/it-tools/user-agent-parser',
            icon: Globe,
            color: '#4caf50'
        },
        {
            category: 'Web & Developer',
            title: 'MIME Types',
            description: 'Find MIME types by extension.',
            href: '/it-tools/mime-types',
            icon: FileCode,
            color: '#607d8b'
        },
        {
            category: 'Web & Developer',
            title: 'HTTP Status',
            description: 'Standard HTTP status codes.',
            href: '/it-tools/http-status-codes',
            icon: Info, // Assuming Info is imported or available
            color: '#9c27b0'
        },
        // Separated Cheatsheets
        {
            category: 'Web & Developer',
            title: 'Regex Cheatsheet',
            description: 'Common regex patterns.',
            href: '/it-tools/regex-cheatsheet',
            icon: Code2,
            color: '#e91e63'
        },
        {
            category: 'Web & Developer',
            title: 'Git Cheatsheet',
            description: 'Common git commands.',
            href: '/it-tools/git-cheatsheet',
            icon: FileText,
            color: '#f44336'
        },
        {
            category: 'Web & Developer',
            title: 'RSS Feed Validator',
            description: 'Validate RSS and Atom feeds.',
            href: '/it-tools/rss-feed-validator',
            icon: Rss,
            color: '#ff9800'
        },

        // Data & Text Utilities
        {
            category: 'Data & Text',
            title: 'Diff Checker',
            description: 'Compare text and JSON files.',
            href: '/it-tools/diff-tools',
            icon: FileDiff,
            color: '#ff5722'
        },
        {
            category: 'Data & Text',
            title: 'Text Statistics',
            description: 'Word count, char count, logic.',
            href: '/it-tools/text-manipulation',
            icon: AlignLeft,
            color: '#673ab7'
        },

        // Utilities & Calculators
        {
            category: 'Utilities',
            title: 'Math Calculator',
            description: 'Evaluate mathematical expressions.',
            href: '/it-tools/calculators',
            icon: Calculator,
            color: '#3f51b5'
        },
        {
            category: 'Utilities',
            title: 'Chronometer',
            description: 'Stopwatch with lap tracking.',
            href: '/it-tools/benchmarking',
            icon: Timer,
            color: '#009688'
        },

        // Networking & Infra
        {
            category: 'Infos & Infra',
            title: 'Network Utils',
            description: 'IPv4 Subnet, IPv6 ULA, MAC.',
            href: '/it-tools/network-utils',
            icon: NetworkIcon,
            color: '#03a9f4'
        },
        // Separated Infra Tools
        {
            category: 'Infos & Infra',
            title: 'Crontab Generator',
            description: 'Parse and generate cron schedules.',
            href: '/it-tools/crontab-generator',
            icon: Clock,
            color: '#795548'
        },
        {
            category: 'Infos & Infra',
            title: 'Chmod Calculator',
            description: 'Calculate file permissions.',
            href: '/it-tools/chmod-calculator',
            icon: Shield,
            color: '#4caf50'
        },
        {
            category: 'Infos & Infra',
            title: 'Docker Map',
            description: 'Convert Run to Compose.',
            href: '/it-tools/docker-map',
            icon: BoxIcon,
            color: '#2196f3'
        },

        // Media & Misc
        {
            category: 'Media & Misc',
            title: 'Webcam Tester',
            description: 'Test camera feed.',
            href: '/it-tools/webcam-tester',
            icon: CameraIcon,
            color: '#f44336'
        }
    ];

    // Filter tools
    const filteredTools = allTools.filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by category
    const categories = Array.from(new Set(filteredTools.map(t => t.category)));

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
                <Link href="/" style={{
                    position: 'absolute', left: 0, top: 0,
                    display: 'flex', alignItems: 'center', gap: 8,
                    textDecoration: 'none', color: '#666', fontWeight: 500,
                    fontSize: '0.9rem'
                }}>
                    <ArrowLeft size={16} /> Back
                </Link>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    IT Tools
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, margin: '0 auto 30px' }}>
                    A collection of handy tools for developers and IT professionals.
                    <br />
                    100% Client-side & Privacy-Focused.
                </p>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
                    <input
                        type="text"
                        id="tool-search"
                        name="tool-search"
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px 50px',
                            fontSize: '1.1rem',
                            borderRadius: '50px',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            outline: 'none'
                        }}
                    />
                    <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                        <Search size={20} />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'grid', gap: '60px' }}>
                {categories.map((categoryName) => {
                    const tools = filteredTools.filter(t => t.category === categoryName);
                    if (tools.length === 0) return null;

                    return (
                        <div key={categoryName}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#333', borderBottom: '2px solid #eee', paddingBottom: 10 }}>
                                {categoryName}
                            </h2>
                            <div className="grid grid-cols-4" style={{ gap: 20 }}>
                                {tools.map((tool, i) => (
                                    <ToolCard key={i} {...(tool as any)} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredTools.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
                        <p>No tools found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
