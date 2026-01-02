"use client";

import React, { useState, useEffect, useRef } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { Timer, Zap, Play, Square, RotateCcw } from 'lucide-react';

export default function Benchmarking() {
    const [activeTab, setActiveTab] = useState<'chrono' | 'benchmark'>('chrono');

    // Chrono State
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const timerRef = useRef<any>(null);

    // Benchmark State
    const [benchStatus, setBenchStatus] = useState<'idle' | 'running' | 'done'>('idle');
    const [benchScore, setBenchScore] = useState(0);
    const [benchDetails, setBenchDetails] = useState('');

    // Chrono Logic
    useEffect(() => {
        if (isRunning) {
            const start = Date.now() - time;
            timerRef.current = setInterval(() => {
                setTime(Date.now() - start);
            }, 10);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const split = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${split.toString().padStart(2, '0')}`;
    };

    const handleLap = () => {
        setLaps(prev => [time, ...prev]);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
        setLaps([]);
    };

    // Benchmark Logic
    const runBenchmark = async () => {
        setBenchStatus('running');
        setBenchDetails('');
        setBenchScore(0);

        // Simple CPU heavy task simulation (Matrix Multiplication or Primes)
        setTimeout(() => {
            const start = performance.now();
            let count = 0;
            const max = 50000;
            // Sieve of Eratosthenes
            const sieve = new Uint8Array(max + 1);
            for (let i = 2; i <= max; i++) {
                if (sieve[i] === 0) {
                    count++;
                    for (let j = i * 2; j <= max; j += i) sieve[j] = 1;
                }
            }
            // Matrix ops
            const size = 300;
            const resMatrix = new Float32Array(size * size);
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    resMatrix[i * size + j] = Math.random() * Math.random();
                }
            }

            const end = performance.now();
            const duration = end - start;

            // Score is inverse of duration (arbitrary scaling)
            const score = Math.floor(10000 / (duration / 100));

            setBenchScore(score);
            setBenchDetails(`Completed Primes up to ${max} & ${size}x${size} Matrix Ops in ${duration.toFixed(2)}ms`);
            setBenchStatus('done');
        }, 100);
    };

    return (
        <ToolLayout
            title="Benchmarking & Timing"
            description="Stopwatch, timer, and simple browser performance benchmark."
            icon={Timer}
        >
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: 20 }}>
                <button
                    onClick={() => setActiveTab('chrono')}
                    style={tabStyle(activeTab === 'chrono')}
                >
                    <Timer size={16} /> Chronometer
                </button>
                <button
                    onClick={() => setActiveTab('benchmark')}
                    style={tabStyle(activeTab === 'benchmark')}
                >
                    <Zap size={16} /> Benchmark
                </button>
            </div>

            {activeTab === 'chrono' && (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', fontFamily: 'monospace', fontWeight: 700, color: '#333' }}>
                        {formatTime(time)}
                    </div>
                    <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 20 }}>
                        {!isRunning ? (
                            <button onClick={() => setIsRunning(true)} style={{ ...btnStyle, background: '#4caf50' }}>
                                <Play size={20} /> Start
                            </button>
                        ) : (
                            <button onClick={() => setIsRunning(false)} style={{ ...btnStyle, background: '#f44336' }}>
                                <Square size={20} /> Stop
                            </button>
                        )}
                        <button onClick={handleLap} disabled={!isRunning} style={{ ...btnStyle, background: '#2196f3', opacity: !isRunning ? 0.5 : 1 }}>
                            Lap
                        </button>
                        <button onClick={handleReset} style={{ ...btnStyle, background: '#607d8b' }}>
                            <RotateCcw size={20} /> Reset
                        </button>
                    </div>

                    {laps.length > 0 && (
                        <div style={{ marginTop: 40, maxHeight: 300, overflowY: 'auto', borderTop: '1px solid #eee' }}>
                            {laps.map((l, i) => (
                                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', maxWidth: 300, margin: '0 auto' }}>
                                    <strong>Lap {laps.length - i}</strong>
                                    <span style={{ fontFamily: 'monospace' }}>{formatTime(l)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'benchmark' && (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <h2 style={{ marginTop: 0 }}>Browser Benchmark</h2>
                    <p style={{ color: '#666', marginBottom: 30 }}>Runs a quick series of arithmetic and memory operations to score your current browser context.</p>

                    {benchStatus === 'idle' && (
                        <button onClick={runBenchmark} style={{ ...btnStyle, background: '#2196f3', padding: '15px 40px', fontSize: '1.2rem' }}>
                            <Zap size={24} /> Run Benchmark
                        </button>
                    )}

                    {benchStatus === 'running' && (
                        <div style={{ color: '#2196f3', fontSize: '1.2rem' }}>Running tests...</div>
                    )}

                    {benchStatus === 'done' && (
                        <div>
                            <div style={{ fontSize: '5rem', fontWeight: 800, color: '#ff9800', marginBottom: 10 }}>
                                {benchScore}
                            </div>
                            <div style={{ color: '#666', fontSize: '1.1rem' }}>Points</div>
                            <div style={{ marginTop: 20, background: '#f5f5f5', padding: 15, borderRadius: 8 }}>
                                {benchDetails}
                            </div>
                            <button onClick={runBenchmark} style={{ ...btnStyle, background: 'transparent', color: '#2196f3', border: '1px solid #2196f3', marginTop: 30 }}>
                                Runs Again
                            </button>
                        </div>
                    )}
                </div>
            )}

        </ToolLayout>
    );
}

const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    borderBottom: active ? '2px solid var(--primary)' : 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--primary)' : '#666',
    display: 'flex', alignItems: 'center', gap: 8
});

const btnStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '1rem',
    fontWeight: 600
};
