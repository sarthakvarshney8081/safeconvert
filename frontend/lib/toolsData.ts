import {
    FileStack, Scissors, RotateCw, Image as ImageIcon, FileType, Shield, Unlock, Scan, Minimize2, Video, Hash, PenTool,
    Terminal, Globe, Info, Rss, ArrowLeftRight, Palette, List, Code, KeyRound, Wifi, Camera, Timer, Calculator, FileDiff, AlignLeft, CalendarClock, FileCode
} from 'lucide-react';

export const allTools = [
    // --- PDF Tools ---
    { title: 'Merge PDF', description: 'Combine multiple PDFs into one.', icon: FileStack, href: '/tools/merge-pdf', color: '#FF5252', category: 'PDF' },
    { title: 'Split PDF', description: 'Separate PDF pages.', icon: Scissors, href: '/tools/split-pdf', color: '#FF4081', category: 'PDF' },
    { title: 'Remove Pages', description: 'Delete unwanted pages.', icon: Minimize2, href: '/tools/remove-pages', color: '#ef4444', category: 'PDF' },
    { title: 'Extract Pages', description: 'Save specific pages.', icon: FileType, href: '/tools/extract-pages', color: '#8b5cf6', category: 'PDF' },
    { title: 'Organize PDF', description: 'Reorder and manage pages.', icon: FileStack, href: '/tools/organize-pdf', color: '#f59e0b', category: 'PDF' },
    { title: 'Compress PDF', description: 'Reduce file size.', icon: Minimize2, href: '/tools/compress-pdf', color: '#10b981', category: 'PDF' },
    { title: 'Repair PDF', description: 'Recover broken PDFs.', icon: Shield, href: '/tools/repair-pdf', color: '#6366f1', category: 'PDF' },
    { title: 'Rotate PDF', description: 'Rotate pages permanently.', icon: RotateCw, href: '/tools/rotate-pdf', color: '#7C4DFF', category: 'PDF' },
    { title: 'Watermark', description: 'Add text overlay.', icon: FileType, href: '/tools/watermark-pdf', color: '#ec4899', category: 'PDF' },
    { title: 'Protect PDF', description: 'Encrypt with password.', icon: Shield, href: '/tools/protect-pdf', color: '#3D5AFE', category: 'PDF' },
    { title: 'Unlock PDF', description: 'Remove password.', icon: Unlock, href: '/tools/unlock-pdf', color: '#F44336', category: 'PDF' },
    { title: 'Verify Signature', description: 'Check PDF signatures.', icon: Shield, href: '/it-tools/pdf-signature-checker', color: '#9C27B0', category: 'PDF' },
    { title: 'Add Page Numbers', description: 'Insert page numbers.', icon: Hash, href: '/tools/page-numbers', category: 'Advanced' },
    { title: 'Sign PDF', description: 'Add digital signatures.', icon: PenTool, href: '/tools/sign-pdf', badge: 'Edit & Security', category: 'Advanced' },
    { title: 'LaTeX to PDF', description: 'Compile LaTeX code to PDF.', icon: FileType, href: '/latex-builder', color: '#2563eb', badge: 'Beta', category: 'Advanced' },
    { title: 'Crop PDF', description: 'Trim margins.', icon: Scissors, href: '/tools/crop-pdf', color: '#8BC34A', category: 'Advanced' },
    { title: 'Edit PDF', description: 'Add text, images, and shapes.', icon: PenTool, href: '/tools/edit-pdf', color: '#FF9800', badge: 'Beta', category: 'Advanced' },

    // --- Converters ---
    { title: 'Image to PDF', description: 'JPG/PNG to PDF.', icon: ImageIcon, href: '/tools/image-to-pdf', color: '#00B0FF', category: 'Converter' },
    { title: 'Office to PDF', description: 'Word/Excel to PDF.', icon: FileType, href: '/tools/office-to-pdf', color: '#FFC107', category: 'Converter' },
    { title: 'Scan to PDF', description: 'OCR images to text.', icon: Scan, href: '/tools/scan-pdf', color: '#607D8B', category: 'Converter' },
    { title: 'PDF to Image', description: 'Save as high-res JPG.', icon: ImageIcon, href: '/tools/pdf-to-image', color: '#00E676', category: 'Converter' },
    { title: 'PDF to Word', description: 'Convert to DOCX.', icon: FileType, href: '/tools/pdf-to-word', color: '#3b82f6', category: 'Converter' },
    { title: 'PDF to Excel', description: 'Convert to XLSX.', icon: FileType, href: '/tools/pdf-to-excel', color: '#22c55e', category: 'Converter' },
    { title: 'PDF to PPT', description: 'Convert to PowerPoint.', icon: FileType, href: '/tools/pdf-to-ppt', color: '#f97316', category: 'Converter' },

    // --- Image Tools ---
    { title: 'Compress Image', description: 'Reduce image size.', icon: Minimize2, href: '/tools/compress-image', color: '#448AFF', category: 'Image' },
    { title: 'Resize Image', description: 'Change dimensions.', icon: Minimize2, href: '/tools/resize-image', color: '#795548', category: 'Image' },
    { title: 'Convert Image', description: 'Change format.', icon: ImageIcon, href: '/tools/convert-image', color: '#009688', category: 'Image' },
    { title: 'PNG to SVG', description: 'Vectorize images.', icon: Scan, href: '/tools/png-to-svg', color: '#FF5722', category: 'Image' },
    { title: 'Video to GIF', description: 'Convert MP4 to GIF.', icon: Video, href: '/tools/video-to-gif', color: '#E91E63', category: 'Video' },
    { title: 'GIF Maker', description: 'Images to GIF.', icon: ImageIcon, href: '/tools/gif-maker', color: '#9C27B0', category: 'Video' },

    // --- IT Tools ---
    { title: 'Hash Text', description: 'MD5, SHA1, SHA256 hashing.', icon: FileType, href: '/it-tools/hash-text', color: '#607D8B', category: 'IT' },
    { title: 'Bcrypt Generator', description: 'Hash & verify passwords.', icon: Hash, href: '/it-tools/bcrypt-generator', color: '#E91E63', category: 'IT' },
    { title: 'Base64 Converter', description: 'Encode/Decode text & files.', icon: FileType, href: '/it-tools/base64-converter', color: '#3f51b5', category: 'IT' },
    { title: 'JSON Converter', description: 'Format & Convert JSON/YAML.', icon: FileType, href: '/it-tools/data-converter', color: '#4caf50', category: 'IT' },
    { title: 'Regex Cheatsheet', description: 'Common regex patterns.', icon: FileType, href: '/it-tools/regex-cheatsheet', color: '#e91e63', category: 'IT' },
    { title: 'UUID Generator', description: 'Generate v1/v4 UUIDs.', icon: FileType, href: '/it-tools/uuid-generator', color: '#673AB7', category: 'IT' },
    { title: 'QR Code', description: 'Create QR codes.', icon: Scan, href: '/it-tools/qr-code-generator', color: '#000000', category: 'IT' },
    { title: 'WiFi QR', description: 'WiFi login codes.', icon: Scan, href: '/it-tools/wifi-qr-code', color: '#2196F3', category: 'IT' },
    { title: 'JWT Parser', description: 'Decode JWT tokens.', icon: Shield, href: '/it-tools/jwt-parser', color: '#e91e63', category: 'IT' },
    { title: 'URL Parser', description: 'Deconstruct URLs.', icon: FileType, href: '/it-tools/url-parser', color: '#2196f3', category: 'IT' },
    { title: 'Git Cheatsheet', description: 'Common commands.', icon: FileType, href: '/it-tools/git-cheatsheet', color: '#f44336', category: 'IT' },
    { title: 'Password Strength', description: 'Check entropy.', icon: Shield, href: '/it-tools/password-strength-analyser', color: '#4CAF50', category: 'IT' },
    { title: 'PDF Sign Checker', description: 'Verify signatures.', icon: Shield, href: '/it-tools/pdf-signature-checker', color: '#9C27B0', category: 'IT' },
    { title: 'Markdown to HTML', description: 'Preview markdown.', icon: FileType, href: '/it-tools/markdown-to-html', color: '#2196F3', category: 'IT' },
    { title: 'Text Statistics', description: 'Count words/chars.', icon: FileType, href: '/it-tools/text-manipulation', color: '#673ab7', category: 'IT' },
    { title: 'Diff Checker', description: 'Compare text files.', icon: FileType, href: '/it-tools/diff-tools', color: '#ff5722', category: 'IT' },
    { title: 'Color Converter', description: 'HEX/RGB/HSL.', icon: ImageIcon, href: '/it-tools/color-converter', color: '#2196f3', category: 'IT' },
    { title: 'Date Converter', description: 'ISO/Timestamp.', icon: FileType, href: '/it-tools/date-time-converter', color: '#e91e63', category: 'IT' },
    { title: 'Unit Converter', description: 'Binary/Hex/Decimal.', icon: FileType, href: '/it-tools/integer-base-converter', color: '#9c27b0', category: 'IT' },
    { title: 'ETA Calculator', description: 'Predict task completion time.', icon: Timer, href: '/it-tools/eta-calculator', color: '#6200EE', category: 'IT' },
    { title: 'JSON to TOML', description: 'Convert JSON to TOML format.', icon: FileCode, href: '/it-tools/json-to-toml', color: '#4caf50', category: 'IT' },
    { title: 'Timezone Converter', description: 'Compare times across zones.', icon: Globe, href: '/it-tools/timezone-converter', color: '#3b82f6', category: 'IT' }
];

export const popularTools = [
    allTools.find(t => t.href.includes('merge-pdf'))!,
    allTools.find(t => t.href.includes('compress-pdf'))!,
    allTools.find(t => t.href.includes('image-to-pdf'))!,
    allTools.find(t => t.href.includes('pdf-to-word'))!,
    allTools.find(t => t.href.includes('data-converter'))!, // JSON
    allTools.find(t => t.href.includes('wifi-qr-code'))!,
    allTools.find(t => t.href.includes('eta-calculator'))!
];
