'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

// Real-time movement simulation data with RFID reader integration
interface MovementEvent {
    id: string;
    timestamp: Date;
    document: {
        rfidTag: string;
        title: string;
        classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
    };
    zone: {
        id: string;
        name: string;
        code: string;
    };
    reader: {
        id: string;
        name: string;
        type: 'FIXED' | 'MOBILE';
    };
    isAnomaly: boolean;
    riskScore: number;
    alertType?: string;
}

// Zone positions for map visualization
const zonePositions: Record<string, { x: number; y: number }> = {
    'z1': { x: 20, y: 25 },   // Ruang Arsip Rahasia
    'z2': { x: 50, y: 15 },   // Executive Suite
    'z3': { x: 80, y: 25 },   // Ruang Baca Publik
    'z4': { x: 25, y: 50 },   // Kantor Kearsipan
    'z5': { x: 75, y: 50 },   // Ruang Digitalisasi
    'z6': { x: 50, y: 50 },   // Lobby Central
    'z7': { x: 35, y: 75 },   // Ruang Rapat
    'z8': { x: 65, y: 75 },   // Area Penerimaan
};

// Zone security levels
const zoneLevels: Record<string, { level: string; color: string }> = {
    'z1': { level: 'SECRET', color: 'var(--status-critical)' },
    'z2': { level: 'RESTRICTED', color: 'var(--status-warning)' },
    'z3': { level: 'PUBLIC', color: 'var(--status-normal)' },
    'z4': { level: 'RESTRICTED', color: 'var(--status-warning)' },
    'z5': { level: 'RESTRICTED', color: 'var(--status-warning)' },
    'z6': { level: 'PUBLIC', color: 'var(--status-normal)' },
    'z7': { level: 'RESTRICTED', color: 'var(--status-warning)' },
    'z8': { level: 'PUBLIC', color: 'var(--status-normal)' },
};

// Simulated real-time movements from RFID readers
const simulatedMovements: MovementEvent[] = [
    {
        id: 'm1',
        timestamp: new Date(Date.now() - 180 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z1', name: 'Ruang Arsip Rahasia', code: 'ARCH-SEC' },
        reader: { id: 'RDR-1002', name: 'Fixed Reader B1', type: 'FIXED' },
        isAnomaly: false,
        riskScore: 0.05,
    },
    {
        id: 'm2',
        timestamp: new Date(Date.now() - 150 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z4', name: 'Kantor Kearsipan', code: 'OFF-01' },
        reader: { id: 'RDR-1004', name: 'Portal Utama A', type: 'FIXED' },
        isAnomaly: false,
        riskScore: 0.12,
    },
    {
        id: 'm3',
        timestamp: new Date(Date.now() - 120 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z5', name: 'Ruang Digitalisasi', code: 'DIG-01' },
        reader: { id: 'RDR-1003', name: 'Mobile Reader M1', type: 'MOBILE' },
        isAnomaly: false,
        riskScore: 0.18,
    },
    {
        id: 'm4',
        timestamp: new Date(Date.now() - 60 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z7', name: 'Ruang Rapat', code: 'MEET-01' },
        reader: { id: 'RDR-1005', name: 'Fixed Reader C1', type: 'FIXED' },
        isAnomaly: false,
        riskScore: 0.25,
    },
    {
        id: 'm5',
        timestamp: new Date(Date.now() - 30 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z3', name: 'Ruang Baca Publik', code: 'READ-01' },
        reader: { id: 'RDR-1006', name: 'Portal Publik A', type: 'FIXED' },
        isAnomaly: true,
        riskScore: 0.65,
        alertType: 'APPROACHING_PUBLIC_ZONE',
    },
    {
        id: 'm6',
        timestamp: new Date(Date.now() - 10 * 60000),
        document: { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' },
        zone: { id: 'z8', name: 'Area Penerimaan', code: 'RECEP-01' },
        reader: { id: 'RDR-1001', name: 'Portal Utama Exit', type: 'FIXED' },
        isAnomaly: true,
        riskScore: 0.85,
        alertType: 'UNAUTHORIZED_ZONE_CRITICAL',
    },
];

// AI Behavioral Analysis
const aiAnalysis = {
    explanation: 'AI mendeteksi pola pergerakan anomali: Dokumen berklasifikasi RAHASIA terdeteksi bergerak dari zona aman (Arsip Rahasia) menuju zona publik (Area Penerimaan) tanpa otorisasi yang tercatat. Pola ini menunjukkan kemungkinan upaya eksfiltrasi dokumen.',
    baselineDeviation: 0.78,
    contributingFactors: [
        { factor: 'Classification Mismatch', weight: 0.40, desc: 'Dokumen SECRET di zona PUBLIC' },
        { factor: 'No Authorization Record', weight: 0.30, desc: 'Tidak ada izin pemindahan' },
        { factor: 'Unusual Movement Path', weight: 0.18, desc: 'Rute tidak sesuai prosedur' },
        { factor: 'Time Anomaly', weight: 0.12, desc: 'Di luar jam operasional normal' },
    ],
    confidence: 0.92,
    recommendation: 'Segera lakukan pencegatan dan verifikasi identitas pembawa dokumen. Aktifkan protokol keamanan tingkat 2.',
};

export default function DocumentTimelinePage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

    const movements = simulatedMovements;

    // Playback control - auto advance through movements
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
    const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
    const handleStepForward = () => { if (currentStep < movements.length - 1) setCurrentStep(prev => prev + 1); };
    const handleStepBack = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

    // Export Timeline as PDF
    const handleExportPDF = () => {
        // Generate PDF content as printable HTML
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Gagal membuka jendela print. Pastikan popup tidak diblokir.');
            return;
        }

        const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Timeline Report - ${currentMovement.document.rfidTag}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        .header { text-align: center; border-bottom: 2px solid #3d7ab8; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3d7ab8; }
        .subtitle { font-size: 14px; color: #666; margin-top: 8px; }
        .doc-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .doc-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
        .rfid { font-family: monospace; color: #3d7ab8; font-size: 14px; }
        .classification { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-left: 10px; }
        .secret { background: #fecaca; color: #991b1b; }
        .restricted { background: #fde68a; color: #92400e; }
        .section-title { font-size: 16px; font-weight: 600; margin: 25px 0 15px; color: #1a1a2e; border-left: 3px solid #3d7ab8; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #3d7ab8; color: white; padding: 12px; text-align: left; font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        .anomaly { background: #fef2f2 !important; }
        .anomaly td { color: #991b1b; }
        .risk-low { color: #16a34a; }
        .risk-medium { color: #ca8a04; }
        .risk-high { color: #dc2626; }
        .ai-section { background: #0a1628; color: #e5e7eb; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .ai-title { font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #3d7ab8; }
        .ai-text { font-size: 13px; line-height: 1.7; }
        .recommendation { background: rgba(202, 138, 4, 0.2); border-left: 3px solid #ca8a04; padding: 12px; margin-top: 15px; }
        .factors { margin-top: 20px; }
        .factor { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 13px; }
        .stats { display: flex; gap: 40px; margin-bottom: 30px; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #3d7ab8; }
        .stat-label { font-size: 12px; color: #666; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #666; text-align: center; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏛️ ANRI Document Movement Report</div>
        <div class="subtitle">Sovereign Risk Intelligence Platform - Generated ${new Date().toLocaleString('id-ID')}</div>
    </div>
    
    <div class="doc-info">
        <div class="doc-title">${currentMovement.document.title}</div>
        <span class="rfid">${currentMovement.document.rfidTag}</span>
        <span class="classification ${currentMovement.document.classification.toLowerCase()}">${currentMovement.document.classification}</span>
    </div>
    
    <div class="stats">
        <div class="stat"><div class="stat-value">${totalMovements}</div><div class="stat-label">Total Movements</div></div>
        <div class="stat"><div class="stat-value" style="color: #dc2626;">${anomalyCount}</div><div class="stat-label">Anomalies</div></div>
        <div class="stat"><div class="stat-value">${Math.round(avgRisk * 100)}%</div><div class="stat-label">Avg Risk Score</div></div>
    </div>
    
    <div class="section-title">Movement Timeline</div>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Timestamp</th>
                <th>Zone</th>
                <th>RFID Reader</th>
                <th>Risk Score</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${movements.map((m, i) => `
                <tr class="${m.isAnomaly ? 'anomaly' : ''}">
                    <td>${i + 1}</td>
                    <td>${m.timestamp.toLocaleString('id-ID')}</td>
                    <td>${m.zone.name} (${m.zone.code})</td>
                    <td>${m.reader.name}</td>
                    <td class="${m.riskScore > 0.7 ? 'risk-high' : m.riskScore > 0.4 ? 'risk-medium' : 'risk-low'}">${Math.round(m.riskScore * 100)}%</td>
                    <td>${m.isAnomaly ? '⚠️ ANOMALY' : '✓ Normal'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="ai-section">
        <div class="ai-title">🤖 AI Behavioral Analysis</div>
        <div class="ai-text">${aiAnalysis.explanation}</div>
        <div class="recommendation">
            <strong>Recommendation:</strong> ${aiAnalysis.recommendation}
        </div>
        <div class="factors">
            <strong>Contributing Factors:</strong>
            ${aiAnalysis.contributingFactors.map(f => `
                <div class="factor">
                    <span>${f.factor}</span>
                    <span>${Math.round(f.weight * 100)}%</span>
                </div>
            `).join('')}
        </div>
        <p style="margin-top: 15px;">AI Confidence: <strong>${Math.round(aiAnalysis.confidence * 100)}%</strong></p>
    </div>
    
    <div class="footer">
        ANRI Sovereign Risk Intelligence Platform | Confidential Document | Page 1
    </div>
</body>
</html>`;

        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const formatTime = (date: Date) => date.toLocaleString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const formatDate = (date: Date) => date.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const currentMovement = movements[currentStep];
    const currentZonePos = zonePositions[currentMovement.zone.id];

    // Calculate stats
    const totalMovements = movements.length;
    const anomalyCount = movements.filter(m => m.isAnomaly).length;
    const avgRisk = movements.reduce((sum, m) => sum + m.riskScore, 0) / movements.length;

    return (
        <DashboardLayout
            title="Document Movement Timeline"
            subtitle="Real-time RFID Tracking & AI Behavioral Analysis"
        >
            <div className={styles.container}>
                {/* Summary Header - Critical Alert Style */}
                <section className={styles.summary}>
                    <div className={styles.summaryLeft}>
                        <StatusBadge status="critical" animate />
                        <span className={styles.rfidTag}>{currentMovement.document.rfidTag}</span>
                        <StatusBadge
                            status={currentMovement.document.classification === 'SECRET' ? 'critical' : 'warning'}
                            label={currentMovement.document.classification}
                        />
                    </div>
                    <div className={styles.summaryRight}>
                        <span className={styles.docTitle}>{currentMovement.document.title}</span>
                        <span className={styles.timeRange}>
                            {formatDate(movements[0].timestamp)} → {formatDate(movements[movements.length - 1].timestamp)}
                        </span>
                    </div>
                </section>

                {/* Statistics Bar */}
                <section className={styles.statsBar}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{totalMovements}</span>
                        <span className={styles.statLabel}>Total Movements</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={`${styles.statValue} ${styles.danger}`}>{anomalyCount}</span>
                        <span className={styles.statLabel}>Anomalies Detected</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={`${styles.statValue} ${avgRisk > 0.5 ? styles.danger : ''}`}>
                            {Math.round(avgRisk * 100)}%
                        </span>
                        <span className={styles.statLabel}>Avg Risk Score</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>8</span>
                        <span className={styles.statLabel}>Active Zones</span>
                    </div>
                </section>

                {/* Main Grid: Map + Movement Log */}
                <div className={styles.mainGrid}>
                    {/* Movement Visualization Map */}
                    <Card header="Movement Visualization" noPadding>
                        <div className={styles.mapContainer}>
                            <svg viewBox="0 0 100 100" className={styles.map}>
                                {/* Grid Pattern */}
                                <defs>
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(61,122,184,0.1)" strokeWidth="0.3" />
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#grid)" />

                                {/* Draw movement paths up to current step */}
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
                                            strokeWidth="1.5"
                                            strokeDasharray={m.isAnomaly ? "3 2" : "none"}
                                            className={styles.pathLine}
                                        />
                                    );
                                })}

                                {/* Zone indicators */}
                                {Object.entries(zonePositions).map(([id, pos]) => {
                                    const isCurrentZone = currentMovement.zone.id === id;
                                    const wasVisited = movements.slice(0, currentStep + 1).some(m => m.zone.id === id);
                                    const zoneLevel = zoneLevels[id];
                                    return (
                                        <g key={id}>
                                            {/* Zone circle */}
                                            <circle
                                                cx={pos.x}
                                                cy={pos.y}
                                                r={isCurrentZone ? 5 : 3.5}
                                                fill={isCurrentZone ? zoneLevel.color : wasVisited ? 'var(--navy-400)' : 'var(--navy-700)'}
                                                stroke={isCurrentZone ? 'white' : 'none'}
                                                strokeWidth="1"
                                                className={isCurrentZone ? styles.pulsingDot : ''}
                                            />
                                            {/* Zone label */}
                                            <text
                                                x={pos.x}
                                                y={pos.y - 8}
                                                textAnchor="middle"
                                                fontSize="3.5"
                                                fill={isCurrentZone ? 'var(--grey-100)' : 'var(--grey-500)'}
                                                fontFamily="var(--font-mono)"
                                            >
                                                {movements.find(m => m.zone.id === id)?.zone.code || id}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Current Position Info Overlay */}
                            <div className={styles.positionInfo}>
                                <span className={styles.positionLabel}>Current Position</span>
                                <span className={styles.positionZone}>{currentMovement.zone.name}</span>
                                <span className={styles.positionCode}>{currentMovement.zone.code}</span>
                                <span className={styles.positionReader}>📡 {currentMovement.reader.name}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Movement Log - Step by Step */}
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
                                            <StatusBadge status="critical" size="sm" label="ANOMALY" />
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
                                        onClick={() => setCurrentStep(i)}
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

                        {/* Export PDF Button */}
                        <Button variant="secondary" onClick={handleExportPDF}>
                            📄 Export PDF
                        </Button>
                    </div>
                </Card>

                {/* AI Analysis Section */}
                <Card header="🤖 AI Behavioral Analysis">
                    <div className={styles.aiSection}>
                        <div className={styles.explanation}>
                            <p>{aiAnalysis.explanation}</p>
                            <div className={styles.recommendation}>
                                <strong>Recommendation:</strong> {aiAnalysis.recommendation}
                            </div>
                        </div>
                        <div className={styles.factors}>
                            <h4>Contributing Factors</h4>
                            {aiAnalysis.contributingFactors.map((f, i) => (
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
                            AI Confidence: <strong>{Math.round(aiAnalysis.confidence * 100)}%</strong>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
