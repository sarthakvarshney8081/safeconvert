"use client";

import React, { useState, useMemo, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { CalendarClock, Copy, Check } from 'lucide-react';
import {
    formatISO,
    formatISO9075,
    formatRFC3339,
    formatRFC7231,
    fromUnixTime,
    getTime,
    getUnixTime,
    isDate,
    isValid,
    parseISO,
    parseJSON,
} from 'date-fns';
import {
    isISO8601DateTimeString,
    isISO9075DateString,
    isRFC3339DateString,
    isRFC7231DateString,
    isUnixTimestamp,
    isTimestamp,
    isUTCDateString,
    isMongoObjectId,
    dateToExcelFormat,
    excelFormatToDate,
    isExcelFormat,
} from './utils';

type ToDateMapper = (date: any) => Date;

interface DateFormat {
    name: string;
    fromDate: (date: Date) => string;
    toDate: ToDateMapper;
    formatMatcher: (date?: string) => boolean;
}

export default function DateTimeConverter() {
    const [inputDate, setInputDate] = useState('');
    const [formatIndex, setFormatIndex] = useState(6); // Default to timestamp
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toDate: ToDateMapper = (date) => new Date(date);

    const formats: DateFormat[] = [
        {
            name: 'JS locale date string',
            fromDate: (date) => date.toString(),
            toDate,
            formatMatcher: () => false,
        },
        {
            name: 'ISO 8601',
            fromDate: formatISO,
            toDate: parseISO,
            formatMatcher: (date) => isISO8601DateTimeString(date),
        },
        {
            name: 'ISO 9075',
            fromDate: formatISO9075,
            toDate: parseISO,
            formatMatcher: (date) => isISO9075DateString(date),
        },
        {
            name: 'RFC 3339',
            fromDate: formatRFC3339,
            toDate,
            formatMatcher: (date) => isRFC3339DateString(date),
        },
        {
            name: 'RFC 7231',
            fromDate: formatRFC7231,
            toDate,
            formatMatcher: (date) => isRFC7231DateString(date),
        },
        {
            name: 'Unix timestamp',
            fromDate: (date) => String(getUnixTime(date)),
            toDate: (sec) => fromUnixTime(+sec),
            formatMatcher: (date) => isUnixTimestamp(date),
        },
        {
            name: 'Timestamp (ms)',
            fromDate: (date) => String(getTime(date)),
            toDate: (ms) => new Date(+ms),
            formatMatcher: (date) => isTimestamp(date),
        },
        {
            name: 'UTC format',
            fromDate: (date) => date.toUTCString(),
            toDate,
            formatMatcher: (date) => isUTCDateString(date),
        },
        {
            name: 'Mongo ObjectID',
            fromDate: (date) => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
            toDate: (objectId) => new Date(parseInt(objectId.substring(0, 8), 16) * 1000),
            formatMatcher: (date) => isMongoObjectId(date),
        },
        {
            name: 'Excel date/time',
            fromDate: (date) => dateToExcelFormat(date),
            toDate: excelFormatToDate,
            formatMatcher: isExcelFormat,
        },
    ];

    const normalizedDate = useMemo(() => {
        if (!inputDate) return now;

        const { toDate } = formats[formatIndex];
        try {
            const date = toDate(inputDate);
            return isValid(date) ? date : undefined;
        } catch {
            return undefined;
        }
    }, [inputDate, formatIndex, now]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputDate(val);
        const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(val));
        if (matchingIndex !== -1) {
            setFormatIndex(matchingIndex);
        }
    };

    const formatDate = (formatter: (date: Date) => string, date?: Date) => {
        if (!date || !isValid(date)) return '';
        try {
            return formatter(date);
        } catch {
            return '';
        }
    };

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const copy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={copy}
                style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: copied ? '#4CAF50' : '#666'
                }}
                title="Copy"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
        );
    };

    return (
        <ToolLayout
            title="Date-Time Converter"
            description="Convert dates between various formats (ISO, RFC, Timestamp, etc.)"
            icon={CalendarClock}
        >
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                    type="text"
                    value={inputDate}
                    onChange={handleInputChange}
                    placeholder="Put your date string here (or leave empty for current time)..."
                    style={{
                        flex: 1,
                        padding: '10px 15px',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        fontSize: '1rem'
                    }}
                    autoFocus
                />
                <select
                    value={formatIndex}
                    onChange={(e) => setFormatIndex(Number(e.target.value))}
                    style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        fontSize: '1rem',
                        background: '#fff'
                    }}
                >
                    {formats.map((f, i) => (
                        <option key={f.name} value={i}>{f.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
                {formats.map((format) => (
                    <div key={format.name} style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 8, padding: '5px 10px' }}>
                        <div style={{ width: 150, textAlign: 'right', paddingRight: 15, fontWeight: 500, color: '#555' }}>
                            {format.name}
                        </div>
                        <input
                            type="text"
                            readOnly
                            value={formatDate(format.fromDate, normalizedDate)}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                padding: '10px',
                                fontFamily: 'monospace',
                                color: '#333'
                            }}
                        />
                        <CopyButton text={formatDate(format.fromDate, normalizedDate)} />
                    </div>
                ))}
            </div>
        </ToolLayout>
    );
}
