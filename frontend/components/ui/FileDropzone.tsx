"use client";

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import styles from './FileDropzone.module.css';

import { toast } from 'sonner';

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
            toast.error(`You can only upload a maximum of ${maxFiles} files.`);
            validFiles = incomingFiles.slice(0, maxFiles - files.length);
        }

        // 2. Max File Size Check (20MB)
        const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
        const oversizeFiles = validFiles.filter(f => f.size > MAX_SIZE);
        if (oversizeFiles.length > 0) {
            toast.error(`Some files are too large! Max file size is 20MB.`, {
                description: `Skipped: ${oversizeFiles.map(f => f.name).join(', ')}`
            });
            validFiles = validFiles.filter(f => f.size <= MAX_SIZE);
        }

        // 3. File Type Validation (Strict check for Drag & Drop)
        if (accept && validFiles.length > 0) {
            const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
            const invalidTypeFiles = validFiles.filter(f => {
                const ext = '.' + f.name.split('.').pop()?.toLowerCase();
                const type = f.type.toLowerCase();
                // Check if file matches EITHER extension OR mime type
                return !allowedTypes.some(allowed =>
                    allowed.startsWith('.') ? allowed === ext : (type === allowed || (allowed.endsWith('/*') && type.startsWith(allowed.replace('/*', ''))))
                );
            });

            if (invalidTypeFiles.length > 0) {
                toast.error(`Invalid file type! Allowed: ${accept}`, {
                    description: `Skipped: ${invalidTypeFiles.map(f => f.name).join(', ')}`
                });
                validFiles = validFiles.filter(f => !invalidTypeFiles.includes(f));
            }
        }

        if (validFiles.length > 0) {
            setFiles(prev => {
                const updated = [...prev, ...validFiles];
                onFilesSelected(updated); // Emit FULL list
                return updated;
            });
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
        setFiles(prev => {
            const updated = prev.filter((_, i) => i !== index);
            onFilesSelected(updated);
            return updated;
        });
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
                        <div key={index} className={styles.fileItem} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <File size={20} className={styles.fileIcon} />
                            <span className={styles.fileName} style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{file.name}</span>

                            <div style={{ display: 'flex', gap: 5 }}>
                                <button type="button" onClick={(e) => { e.preventDefault(); removeFile(index); }} className={styles.removeBtn} title="Remove" style={{ flexShrink: 0 }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
