"use client";

import React from 'react';
import ToolInterface from '@/components/ToolInterface';
import ContentSection from '@/components/ContentSection';
import { toast } from 'sonner';

export default function ImageToPdfTool() {
    // This is the original API-based tool for converting Images -> PDF
    const processFiles = async (files: File[]) => {
        if (files.length === 0) throw new Error("No files selected");

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                toast.error(`File ${file.name} is not a supported image format (PNG, JPG, WebP).`);
                throw new Error("Invalid format");
            }
        }

        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('/api/convert/image-to-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let msg = "Conversion failed";
            try {
                const json = JSON.parse(errorText);
                msg = json.detail || msg;
            } catch { }
            throw new Error(msg);
        }
        return await response.blob();
    };

    return (
        <>
            <ToolInterface
                title="Image to PDF"
                description="Convert JPG, PNG, or other images to PDF format."
                accept="image/*"
                apiEndpoint="/api/convert/image-to-pdf"
                onProcess={processFiles}
            />

            <ContentSection
                title="Convert Images to PDF Online"
                features={[
                    {
                        title: "Universal Compatibility",
                        description: "Our tool supports a wide range of image formats including JPG, PNG, BMP, TIFF, and WebP, ensuring you can convert almost any image to PDF."
                    },
                    {
                        title: "High-Quality Conversion",
                        description: "We preserve the original quality of your images. The resulting PDF will have crisp, clear visuals suitable for printing or professional sharing."
                    },
                    {
                        title: "100% Free & Secure",
                        description: "All conversions happen securely. We do not store your files permanently on our servers. The service is completely free to use with no hidden costs."
                    }
                ]}
                steps={[
                    {
                        title: "Select your Images",
                        description: "Click the 'Select Files' button or drag and drop your images (JPG, PNG, etc.) into the upload area."
                    },
                    {
                        title: "Arrange and Preview",
                        description: "Once uploaded, our system processes them. (In future updates, you will be able to reorder them)."
                    },
                    {
                        title: "Convert and Download",
                        description: "Click the 'Image to PDF' button. Your file will be processed instantly, and a download link will be provided."
                    }
                ]}
                faq={[
                    {
                        question: "Is this Image to PDF converter free?",
                        answer: "Yes, this tool is 100% free to use. You can convert as many images as you like without any daily limits or watermarks."
                    },
                    {
                        question: "Can I convert multiple images into a single PDF?",
                        answer: "Absolutely! You can select multiple images at once, and our tool will combine them into a single, multi-page PDF document in the order you uploaded them."
                    },
                    {
                        question: "Are my files safe?",
                        answer: "Security is our top priority. Your files are processed securely and are automatically deleted from our servers after the conversion is complete. We do not keep any copies of your documents."
                    },
                    {
                        question: "Does it support PNG and JPG?",
                        answer: "Yes, we support all major image formats, specifically optimizing for JPG and PNG to PDF conversions to ensure the best balance of file size and quality."
                    }
                ]}
            />
        </>
    );
}
