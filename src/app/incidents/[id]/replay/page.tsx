'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

// Demo incident data
const incidentData = {
    id: 'INC-2024-0892',
    document: {
        rfidTag: 'ANRI-X8K9M2',
        title: 'Arsip Rahasia Kepegawaian 2024-001',
        classification: 'SECRET',
    },
    severity: 'CRITICAL',
    type: 'UNAUTHORIZED_ZONE',
    startTime: new Date(Date.now() - 4 * 3600000),
    endTime: new Date(Date.now() - 10 * 60000),
    status: 'OPEN',
    movements: [
        {
            id: 'm1',
            timestamp: new Date(Date.now() - 4 * 3600000),
            zone: { id: 'z1', name: 'Ruang Arsip Rahasia', code: 'ARCH-SEC' },
            reader: 'RDR-1002',
            action: 'START',
            isAnomaly: false,
            riskScore: 0.05,
        },
        {
            id: 'm2',
            timestamp: new Date(Date.now() - 3 * 3600000),
            zone: { id: 'z4', name: 'Kantor Kearsipan', code: 'OFF-01' },
            reader: 'RDR-1004',
            action: 'ENTER',
            isAnomaly: false,
            riskScore: 0.12,
        },
        {
            id: 'm3',
            timestamp: new Date(Date.now() - 2 * 3600000),
            zone: { id: 'z5', name: 'Ruang Digitalisasi', code: 'DIG-01' },
            reader: 'RDR-1003',
            action: 'ENTER',
            isAnomaly: false,
            riskScore: 0.18,
        },
        {
            id: 'm4',
            timestamp: new Date(Date.now() - 1 * 3600000),
            zone: { id: 'z7', name: 'Ruang Rapat', code: 'MEET-01' },
            reader: 'RDR-1005',
            action: 'ENTER',
            isAnomaly: false,
            riskScore: 0.25,
        },
        {
            id: 'm5',
            timestamp: new Date(Date.now() - 30 * 60000),
            zone: { id: 'z3', name: 'Ruang Baca Publik', code: 'READ-01' },
            reader: 'RDR-1006',
            action: 'ENTER',
            isAnomaly: true,
            riskScore: 0.65,
            alert: 'APPROACHING_PUBLIC_ZONE',
        },
        {
            id: 'm6',
            timestamp: new Date(Date.now() - 10 * 60000),
            zone: { id: 'z8', name: 'Lobby Utama', code: 'LOBBY' },
            reader: 'RDR-1001',
            action: 'ENTER',
            isAnomaly: true,
            riskScore: 0.85,
            alert: 'UNAUTHORIZED_ZONE_CRITICAL',
        },
    ],
    aiAnalysis: {
        explanation: 'Dokumen berklasifikasi RAHASIA terdeteksi bergerak dari zona aman menuju zona publik tanpa otorisasi. Pola pergerakan menunjukkan kemungkinan upaya eksfiltrasi.',
        contributingFactors: [
            { factor: 'Classification Mismatch', weight: 0.40 },
            { factor: 'No Authorization Record', weight: 0.35 },
            { factor: 'Unusual Path', weight: 0.15 },
            { factor: 'Speed Anomaly', weight: 0.10 },
        ],
        confidence: 0.92,
        recommendation: 'Segera lakukan pencegatan dan verifikasi identitas pembawa dokumen.',
    },
};

// Zone positions for visualization (simplified 2D map)
const zonePositions: Record<string, { x: number; y: number; level: string }> = {
    'z1': { x: 20, y: 70, level: 'B1' },
    'z2': { x: 50, y: 40, level: '1' },
    'z3': { x: 80, y: 40, level: '1' },
    'z4': { x: 30, y: 30, level: '2' },
    'z5': { x: 70, y: 30, level: '2' },
    'z6': { x: 20, y: 80, level: 'B2' },
    'z7': { x: 50, y: 20, level: '3' },
    'z8': { x: 50, y: 50, level: '1' },
};

export default function IncidentReplayPage() {
    const params = useParams();
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const movements = incidentData.movements;

    // Playback control
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= movements.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 2000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, movements.length]);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };
    const handleStepForward = () => {
        if (currentStep < movements.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };
    const handleStepBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const currentMovement = movements[currentStep];
    const currentZonePos = zonePositions[currentMovement.zone.id];

    return (
        <DashboardLayout
            title="Incident Replay"
            subtitle={`#${incidentData.id} - ${incidentData.document.title}`}
            actions={
                <Button variant="secondary" size="sm" onClick={() => router.back()}>
                    ← Kembali
                </Button>
            }
        >
            <div className={styles.container}>
                {/* Incident Summary */}
                <section className={styles.summary}>
                    <div className={styles.summaryLeft}>
                        <StatusBadge status="critical" animate />
                        <span className={styles.incidentId}>{incidentData.id}</span>
                        <StatusBadge
                            status="critical"
                            label={incidentData.document.classification}
                            showDot={false}
                            size="sm"
                        />
                    </div>
                    <div className={styles.summaryRight}>
                        <span className={styles.timeRange}>
                            {formatTime(incidentData.startTime)} → {formatTime(incidentData.endTime)}
                        </span>
                        <span className={styles.duration}>
                            Duration: {Math.round((incidentData.endTime.getTime() - incidentData.startTime.getTime()) / 60000)} min
                        </span>
                    </div>
                </section>

                {/* Replay Visualization */}
                <div className={styles.mainGrid}>
                    <Card header="Movement Visualization" noPadding>
                        <div className={styles.mapContainer}>
                            {/* Zone Map */}
                            <svg viewBox="0 0 100 100" className={styles.map}>
                                {/* Grid */}
                                <defs>
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(61,122,184,0.1)" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#grid)" />

                                {/* Draw path up to current step */}
                                {movements.slice(0, currentStep + 1).map((m, i) => {
                                    if (i === 0) return null;
                                    const prev = movements[i - 1];
                                    const prevPos = zonePositions[prev.zone.id];
                                    const currPos = zonePositions[m.zone.id];
                                    return (
                                        <line
                                            key={`path-${i}`}
                                            x1={prevPos.x}
                                            y1={prevPos.y}
                                            x2={currPos.x}
                                            y2={currPos.y}
                                            stroke={m.isAnomaly ? 'var(--status-critical)' : 'var(--navy-400)'}
                                            strokeWidth="2"
                                            strokeDasharray={m.isAnomaly ? "4 2" : "none"}
                                        />
                                    );
                                })}

                                {/* Zone indicators */}
                                {Object.entries(zonePositions).map(([id, pos]) => {
                                    const isCurrentZone = currentMovement.zone.id === id;
                                    const wasVisited = movements.slice(0, currentStep + 1).some(m => m.zone.id === id);
                                    return (
                                        <g key={id}>
                                            <circle
                                                cx={pos.x}
                                                cy={pos.y}
                                                r={isCurrentZone ? 6 : 4}
                                                fill={isCurrentZone ? 'var(--status-critical)' : wasVisited ? 'var(--navy-400)' : 'var(--navy-700)'}
                                                stroke={isCurrentZone ? 'var(--status-critical-light)' : 'none'}
                                                strokeWidth="2"
                                                className={isCurrentZone ? styles.pulsingDot : ''}
                                            />
                                            <text
                                                x={pos.x}
                                                y={pos.y - 10}
                                                textAnchor="middle"
                                                fontSize="4"
                                                fill={isCurrentZone ? 'var(--grey-100)' : 'var(--grey-500)'}
                                            >
                                                {movements.find(m => m.zone.id === id)?.zone.code || id}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Current Position Info */}
                            <div className={styles.positionInfo}>
                                <span className={styles.positionLabel}>Current Position:</span>
                                <span className={styles.positionZone}>{currentMovement.zone.name}</span>
                                <span className={styles.positionCode}>{currentMovement.zone.code}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Timeline Steps */}
                    <Card header="Movement Log">
                        <div className={styles.stepsList}>
                            {movements.map((m, index) => (
                                <div
                                    key={m.id}
                                    className={`${styles.step} ${index === currentStep ? styles.current : ''} ${index < currentStep ? styles.passed : ''} ${m.isAnomaly ? styles.anomaly : ''}`}
                                    onClick={() => setCurrentStep(index)}
                                >
                                    <div className={styles.stepNumber}>{index + 1}</div>
                                    <div className={styles.stepContent}>
                                        <span className={styles.stepTime}>{formatTime(m.timestamp)}</span>
                                        <span className={styles.stepZone}>{m.zone.name}</span>
                                        {m.isAnomaly && (
                                            <StatusBadge status="critical" label="ANOMALY" size="sm" />
                                        )}
                                    </div>
                                    <div className={styles.stepRisk}>
                                        <div className={styles.riskBar}>
                                            <div
                                                className={styles.riskFill}
                                                style={{
                                                    width: `${m.riskScore * 100}%`,
                                                    background: m.riskScore > 0.7 ? 'var(--status-critical)' :
                                                        m.riskScore > 0.4 ? 'var(--status-warning)' : 'var(--status-normal)'
                                                }}
                                            />
                                        </div>
                                        <span>{Math.round(m.riskScore * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Playback Controls */}
                <Card>
                    <div className={styles.controls}>
                        <div className={styles.playbackButtons}>
                            <button onClick={handleReset} className={styles.controlBtn} title="Reset">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10" />
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                            </button>
                            <button onClick={handleStepBack} className={styles.controlBtn} title="Step Back">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="19 20 9 12 19 4 19 20" />
                                    <line x1="5" y1="19" x2="5" y2="5" />
                                </svg>
                            </button>
                            {isPlaying ? (
                                <button onClick={handlePause} className={`${styles.controlBtn} ${styles.primary}`} title="Pause">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                </button>
                            ) : (
                                <button onClick={handlePlay} className={`${styles.controlBtn} ${styles.primary}`} title="Play">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </button>
                            )}
                            <button onClick={handleStepForward} className={styles.controlBtn} title="Step Forward">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 4 15 12 5 20 5 4" />
                                    <line x1="19" y1="5" x2="19" y2="19" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className={styles.progressSection}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${(currentStep / (movements.length - 1)) * 100}%` }}
                                />
                                {movements.map((m, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.progressMarker} ${m.isAnomaly ? styles.anomalyMarker : ''}`}
                                        style={{ left: `${(i / (movements.length - 1)) * 100}%` }}
                                    />
                                ))}
                            </div>
                            <span className={styles.progressLabel}>
                                Step {currentStep + 1} of {movements.length}
                            </span>
                        </div>

                        {/* Speed Control */}
                        <div className={styles.speedControl}>
                            <span>Speed:</span>
                            {[0.5, 1, 2].map(speed => (
                                <button
                                    key={speed}
                                    className={`${styles.speedBtn} ${playbackSpeed === speed ? styles.active : ''}`}
                                    onClick={() => setPlaybackSpeed(speed)}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* AI Analysis */}
                <Card header="🤖 AI Analysis">
                    <div className={styles.aiSection}>
                        <div className={styles.explanation}>
                            <p>{incidentData.aiAnalysis.explanation}</p>
                            <p className={styles.recommendation}>
                                <strong>Recommendation:</strong> {incidentData.aiAnalysis.recommendation}
                            </p>
                        </div>
                        <div className={styles.factors}>
                            <h4>Contributing Factors</h4>
                            {incidentData.aiAnalysis.contributingFactors.map((f, i) => (
                                <div key={i} className={styles.factor}>
                                    <span className={styles.factorName}>{f.factor}</span>
                                    <div className={styles.factorBar}>
                                        <div
                                            className={styles.factorFill}
                                            style={{ width: `${f.weight * 100}%` }}
                                        />
                                    </div>
                                    <span className={styles.factorWeight}>{Math.round(f.weight * 100)}%</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.confidence}>
                            AI Confidence: <strong>{Math.round(incidentData.aiAnalysis.confidence * 100)}%</strong>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
