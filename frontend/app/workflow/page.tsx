"use client";

import React from 'react';
import DetailedWorkflowSelector from '@/components/DetailedWorkflowSelector';
import { FileText, FileImage, Files, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
    const router = useRouter();

    const workflows = [
        {
            id: 'ocr',
            title: 'OCR & Intelligence',
            description: 'Extract text from images/PDFs, preserve layouts, or digitize handwriting.',
            icon: FileText,
            features: ['Text Extraction', 'Layout Preservation', 'Handwriting OCR', 'Multi-language'],
            bestFor: 'Digitizing scanned documents and forms.',
            limitations: 'Redirects to dedicated OCR tool.'
        },
        {
            id: 'pdf',
            title: 'PDF Management',
            description: 'Merge, split, compress, or repair PDF documents.',
            icon: Files,
            features: ['Merge/Split', 'Compression', 'Repair', 'Organize'],
            bestFor: 'Managing PDF files and structure.',
            limitations: 'Redirects to PDF Tools.'
        },
        {
            id: 'image',
            title: 'Image Processing',
            description: 'Convert PDFs to images, compress images, or vectorization.',
            icon: FileImage,
            features: ['PDF to Image', 'Image Compression', 'Vectorization'],
            bestFor: 'Handling visual assets.',
            limitations: 'Redirects to Image Tools.'
        },
        {
            id: 'custom',
            title: 'Custom Builder',
            description: 'Create a custom pipeline by chaining multiple operations together.',
            icon: Settings2,
            badge: 'New',
            features: ['Chain up to 4 Tools', 'Custom Ordering', 'Flexible Inputs', 'One-click Run'],
            bestFor: 'Specific multi-step requirements.',
            limitations: 'Requires manual setup.'
        }
    ];

    const handleSelect = (id: string) => {
        if (id === 'ocr') {
            router.push('/tools/ocr-pdf');
        } else if (id === 'pdf') {
            router.push('/workflow/pdf');
        } else if (id === 'image') {
            router.push('/workflow/image');
        } else if (id === 'custom') {
            router.push('/workflow/custom');
        }
    };

    return (
        <DetailedWorkflowSelector
            title="Workflow Hub"
            description="Choose a specialized tool or build your own processing pipeline."
            workflows={workflows}
            onSelect={handleSelect}
        />
    );
}
