"use client";

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import styles from './FileDropzone.module.css';

interface FileDropzoneProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
}

export default function FileDropzone({ onFilesSelected, accept, multiple = false, maxFiles }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleFiles = useCallback((incomingFiles: File[]) => {
        let validFiles = incomingFiles;

        // 1. Max Files Check
        if (maxFiles && (files.length + incomingFiles.length) > maxFiles) {
            alert(`You can only upload a maximum of ${maxFiles} files.`);
            validFiles = incomingFiles.slice(0, maxFiles - files.length);
        }

        // 2. Max File Size Check (20MB)
        const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
        const oversizeFiles = validFiles.filter(f => f.size > MAX_SIZE);
        if (oversizeFiles.length > 0) {
            alert(`Some files are too large! Max file size is 20MB.\nSkipped: ${oversizeFiles.map(f => f.name).join(', ')}`);
            validFiles = validFiles.filter(f => f.size <= MAX_SIZE);
        }

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            onFilesSelected(validFiles);
        }
    }, [files, maxFiles, onFilesSelected]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            handleFiles(newFiles);
        }
    }, [handleFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            handleFiles(newFiles);
        }
    }, [handleFiles]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        // Note: This doesn't notify parent to remove, might need sync if parent manages state
    };

    return (
        <div className={styles.container}>
            <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className={styles.input}
                    onChange={handleFileInput}
                    accept={accept}
                    multiple={multiple}
                    id="file-input"
                />
                <label htmlFor="file-input" className={styles.label}>
                    <div className={styles.iconWrapper}>
                        <Upload size={48} className={styles.icon} />
                    </div>
                    <h3 className={styles.title}>
                        {isDragging ? "Drop files here" : "Drag & drop files here"}
                    </h3>
                    <p className={styles.subtitle}>or click to browse</p>
                </label>
            </div>

            {files.length > 0 && (
                <div className={styles.fileList}>
                    {files.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                            <File size={20} className={styles.fileIcon} />
                            <span className={styles.fileName}>{file.name}</span>
                            <button onClick={() => removeFile(index)} className={styles.removeBtn}>
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
