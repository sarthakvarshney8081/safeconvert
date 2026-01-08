"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    List, ListOrdered, Undo, Redo, Link as LinkIcon, Unlink,
    Heading1, Heading2, Heading3, Minus, AlignLeft as AlignLeftIcon, AlignCenter, AlignRight
} from 'lucide-react';

interface VisualEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const Button = ({ onClick, isActive, disabled, children, title }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                background: isActive ? '#e2e8f0' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? '#cbd5e1' : 'transparent',
                borderRadius: '6px',
                padding: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? '#94a3b8' : '#334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            className={isActive ? 'is-active' : ''}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            display: 'flex', gap: '4px', padding: '8px',
            borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
            flexWrap: 'wrap'
        }}>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 size={16} />
            </Button>

            <div style={{ width: 1, background: '#cbd5e1', margin: '0 4px' }} />

            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Cmd+B)"
            >
                <Bold size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Cmd+I)"
            >
                <Italic size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline (Cmd+U)"
            >
                <UnderlineIcon size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough size={16} />
            </Button>

            <div style={{ width: 1, background: '#cbd5e1', margin: '0 4px' }} />

            <Button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <AlignLeftIcon size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <AlignCenter size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <AlignRight size={16} />
            </Button>

            <div style={{ width: 1, background: '#cbd5e1', margin: '0 4px' }} />

            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
            >
                <Minus size={16} />
            </Button>

            <div style={{ width: 1, background: '#cbd5e1', margin: '0 4px' }} />

            <Button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo (Cmd+Z)"
            >
                <Undo size={16} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo (Cmd+Shift+Z)"
            >
                <Redo size={16} />
            </Button>
        </div>
    );
};

export default function VisualEditorWrapper({ value, onChange }: VisualEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Use dedicated extension
                horizontalRule: false, // Use dedicated extension
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            HorizontalRule,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                style: 'padding: 1rem; height: 100%; outline: none; overflow-y: auto;'
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync external value changes if needed (be careful of loops)
    // For now we assume one-way init, or simple sync.
    // If we want bidirectional sync we need useEffect to setContent if value differs.
    // But for a simple editor, usually we don't want to reset cursor.
    // Just initial load is fine, but if User swaps tabs back and forth, we need to load new value.
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            // Basic conflict resolution: only update if significantly different to verify
            // In this app, switching tabs completely unmounts/remounts usually or we want to persist.
            // But VisualEditorWrapper is dynamic, so it might remount.
            // If remounts, `content: value` handles it.
            // If prop updates while mounted?
            // editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100%', border: '1px solid #e2e8f0', borderRadius: '0 0 8px 8px',
            overflow: 'hidden'
        }}>
            <MenuBar editor={editor} />
            <div style={{ flex: 1, overflowY: 'auto', background: 'white', cursor: 'text' }} onClick={() => editor?.chain().focus().run()}>
                <EditorContent editor={editor} style={{ height: '100%' }} />
            </div>

            {/* Inline CSS for Tiptap Basic Styling if Tailwind prose not fully active */}
            <style jsx global>{`
                .ProseMirror {
                    min-height: 100%;
                    outline: none;
                }
                .ProseMirror p { margin: 0.5em 0; }
                .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; }
                .ProseMirror ul { list-style-type: disc; }
                .ProseMirror ol { list-style-type: decimal; }
                .ProseMirror h1 { font-size: 1.5em; font-weight: bold; }
                .ProseMirror h2 { font-size: 1.3em; font-weight: bold; }
                .ProseMirror strong { font-weight: bold; }
                .ProseMirror em { font-style: italic; }
            `}</style>
        </div>
    );
}
