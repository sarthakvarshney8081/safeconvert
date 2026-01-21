"use client";

import React, { useState } from 'react';
import ToolInterface from '@/components/ToolInterface';
import ContentSection from '@/components/ContentSection';

export default function PdfToImageTool() {
    const processFile = async (files: File[], options: any) => {
        const formData = new FormData();
        formData.append('file', files[0]);
        formData.append('format', options.format || 'png');

        const response = await fetch(`/api/convert/pdf-to-image?fmt=${options.format || 'png'}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Conversion failed");
        }
        const blob = await response.blob();
        console.log("DEBUG: Received blob", { size: blob.size, type: blob.type });
        return blob;
    };

    return (
        <>
            <ToolInterface
                title="PDF to Image"
                description="Convert PDF pages into high-quality images (PNG/JPG)."
                accept=".pdf"
                apiEndpoint="/api/convert/pdf-to-image"
                onProcess={processFile}
                resultFileName="images.zip"
                processingMode="server"
                optionsComponent={
                    <div>
                        <label style={{ display: 'block', marginBottom: 5 }}>Output Format</label>
                        <select name="format" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}>
                            <option value="png">PNG (High Quality)</option>
                            <option value="jpeg">JPG (Smaller Size)</option>
                        </select>
                    </div>
                }
            />

            <ContentSection
                title="Convert PDF Pages to Images"
                features={[
                    {
                        title: "High-Quality Extraction",
                        description: "Convert each page of your PDF into a separate high-resolution image. Choose between PNG for quality or JPG for smaller file sizes."
                    },
                    {
                        title: "Batch Processing",
                        description: "Upload a multi-page PDF and get all pages converted at once. We verify the integrity of every page."
                    },
                    {
                        title: "Secure & Private",
                        description: "Your documents are processed securely and deleted immediately after the conversion is finished."
                    }
                ]}
                steps={[
                    {
                        title: "Upload PDF",
                        description: "Click to select your PDF file. The tool supports standard PDF documents of any size."
                    },
                    {
                        title: "Select Format",
                        description: "Choose your desired output format: 'PNG' for lossless quality or 'JPG' for web-ready images."
                    },
                    {
                        title: "Convert",
                        description: "Click 'PDF to Image'. The tool will process the file and download a ZIP containing all your page images."
                    }
                ]}
                faq={[
                    {
                        question: "How do I get the images?",
                        answer: "The tool generates a ZIP archive containing an image file for every page in your PDF. Just unzip it to view them."
                    },
                    {
                        question: "Does it work with scanned PDFs?",
                        answer: "Yes! Scanned pages are simply treated as images, so they convert perfectly to JPG or PNG formats."
                    },
                    {
                        question: "Is there a page limit?",
                        answer: "We support large PDFs, but for best performance, files under 100MB are recommended."
                    }
                ]}
            />
        </>
    );
}
