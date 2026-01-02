"use client";

import React, { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { List, Copy, Check } from 'lucide-react';

export default function ListConverter() {
    const [input, setInput] = useState('Apple\nBanana\nOrange\nApple\ngrape');
    const [separator, setSeparator] = useState(',');
    const [itemPrefix, setItemPrefix] = useState("'");
    const [itemSuffix, setItemSuffix] = useState("'");
    const [listPrefix, setListPrefix] = useState('[');
    const [listSuffix, setListSuffix] = useState(']');

    // Checkboxes
    const [removeDuplicates, setRemoveDuplicates] = useState(true);
    const [trimItems, setTrimItems] = useState(true);
    const [lowerCase, setLowerCase] = useState(false);
    const [reverseList, setReverseList] = useState(false);
    const [sortList, setSortList] = useState<'asc' | 'desc' | 'none'>('none');
    const [keepLineBreaks, setKeepLineBreaks] = useState(false); // If true, output will have newlines after separator

    const output = useMemo(() => {
        let items = input.split('\n');

        if (trimItems) {
            items = items.map(s => s.trim());
        }

        // Remove empty lines
        items = items.filter(Boolean);

        if (lowerCase) {
            items = items.map(s => s.toLowerCase());
        }

        if (removeDuplicates) {
            items = Array.from(new Set(items));
        }

        if (sortList === 'asc') {
            items.sort((a, b) => a.localeCompare(b));
        } else if (sortList === 'desc') {
            items.sort((a, b) => b.localeCompare(a));
        }

        if (reverseList) {
            items.reverse();
        }

        // Apply prefix/suffix
        const processedItems = items.map(item => `${itemPrefix}${item}${itemSuffix}`);

        const joinStr = separator + (keepLineBreaks ? '\n' : '');
        const joined = processedItems.join(joinStr);

        return `${listPrefix}${keepLineBreaks ? '\n' : ''}${joined}${keepLineBreaks ? '\n' : ''}${listSuffix}`;

    }, [input, separator, itemPrefix, itemSuffix, listPrefix, listSuffix, removeDuplicates, trimItems, lowerCase, reverseList, sortList, keepLineBreaks]);

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            if (!text) return;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={copy}
                disabled={!text}
                style={{
                    padding: '8px 16px',
                    background: !text ? '#ccc' : '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: !text ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.9rem'
                }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        );
    };

    return (
        <ToolLayout
            title="List Converter"
            description="Transform lists with sorting, deduplication, and custom formatting."
            icon={List}
        >
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>

                {/* Input Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Input List</h3>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={8}
                            placeholder="Paste your list here (one item per line)..."
                            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 15 }}>Options</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox" checked={removeDuplicates} onChange={e => setRemoveDuplicates(e.target.checked)} />
                                Remove Duplicates
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox" checked={trimItems} onChange={e => setTrimItems(e.target.checked)} />
                                Trim Items
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox" checked={lowerCase} onChange={e => setLowerCase(e.target.checked)} />
                                Lowercase
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox" checked={reverseList} onChange={e => setReverseList(e.target.checked)} />
                                Reverse
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', userSelect: 'none' }}>
                                <input type="checkbox" checked={keepLineBreaks} onChange={e => setKeepLineBreaks(e.target.checked)} />
                                Keep Breakline
                            </label>
                        </div>

                        <div style={{ marginTop: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Sort:</label>
                            <select
                                value={sortList}
                                onChange={(e) => setSortList(e.target.value as any)}
                                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                            >
                                <option value="none">None</option>
                                <option value="asc">Ascending (A-Z)</option>
                                <option value="desc">Descending (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Configuration & Output Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 15 }}>Format</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Example: ('1', '2')</label>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <input
                                        type="text"
                                        value={itemPrefix}
                                        onChange={e => setItemPrefix(e.target.value)}
                                        placeholder="Item Prefix"
                                        style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                                    />
                                    <input
                                        type="text"
                                        value={itemSuffix}
                                        onChange={e => setItemSuffix(e.target.value)}
                                        placeholder="Item Suffix"
                                        style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>And: [ ... ]</label>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <input
                                        type="text"
                                        value={listPrefix}
                                        onChange={e => setListPrefix(e.target.value)}
                                        placeholder="List Prefix"
                                        style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                                    />
                                    <input
                                        type="text"
                                        value={listSuffix}
                                        onChange={e => setListSuffix(e.target.value)}
                                        placeholder="List Suffix"
                                        style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 4 }}>Separator</label>
                                <input
                                    type="text"
                                    value={separator}
                                    onChange={e => setSeparator(e.target.value)}
                                    placeholder="Separator (e.g. ,)"
                                    style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginTop: 0 }}>Output</h3>
                        <textarea
                            readOnly
                            value={output}
                            rows={8}
                            placeholder="Result..."
                            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, background: '#fbfbfb', flex: 1, fontFamily: 'monospace' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
                            <CopyButton text={output} />
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
