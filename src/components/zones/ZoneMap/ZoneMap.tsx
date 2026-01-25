'use client';

import React, { useState } from 'react';
import styles from './ZoneMap.module.css';

interface Zone {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    securityLevel: 'PUBLIC' | 'STANDARD' | 'RESTRICTED' | 'HIGH_SECURITY';
    status: 'ACTIVE' | 'LOCKDOWN';
    x_coord: number;
    y_coord: number;
    width: number;
    height: number;
    activeAlerts: number;
    readerStatus: {
        total: number;
        online: number;
        offline: number;
    };
    floor?: string | null;
    building?: string | null;
    documentCount: number;
    access24h: number;
    riskScore: number;
}

interface ZoneMapProps {
    zones: Zone[];
    onZoneClick: (zone: Zone) => void;
}

export function ZoneMap({ zones, onZoneClick }: ZoneMapProps) {
    const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

    const getZoneColor = (zone: Zone) => {
        if (zone.status === 'LOCKDOWN') return 'rgba(239, 68, 68, 0.6)'; // Red
        switch (zone.securityLevel) {
            case 'HIGH_SECURITY': return 'rgba(220, 38, 38, 0.3)';
            case 'RESTRICTED': return 'rgba(234, 179, 8, 0.3)';
            case 'STANDARD': return 'rgba(59, 130, 246, 0.3)';
            case 'PUBLIC': return 'rgba(16, 185, 129, 0.3)';
            default: return 'rgba(100, 116, 139, 0.3)';
        }
    };

    const getStrokeColor = (zone: Zone) => {
        if (zone.status === 'LOCKDOWN') return '#EF4444';
        switch (zone.securityLevel) {
            case 'HIGH_SECURITY': return '#DC2626';
            case 'RESTRICTED': return '#EAB308';
            case 'STANDARD': return '#3B82F6';
            case 'PUBLIC': return '#10B981';
            default: return '#64748B';
        }
    };

    return (
        <div className={styles.mapContainer}>
            <svg viewBox="0 0 1600 900" className={styles.svgMap}>
                {/* Background Grid */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Building Outline (Abstract) */}
                <path d="M 50 50 L 1550 50 L 1550 850 L 50 850 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

                {/* Zones */}
                {zones.map((zone) => (
                    <g
                        key={zone.id}
                        onClick={() => onZoneClick(zone)}
                        onMouseEnter={() => setHoveredZone(zone)}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={styles.zoneGroup}
                        style={{ cursor: 'pointer' }}
                    >
                        <rect
                            x={zone.x_coord}
                            y={zone.y_coord}
                            width={zone.width}
                            height={zone.height}
                            fill={getZoneColor(zone)}
                            stroke={getStrokeColor(zone)}
                            strokeWidth="2"
                            rx="4"
                        />
                        {/* Zone Label */}
                        <text
                            x={zone.x_coord + 10}
                            y={zone.y_coord + 25}
                            fill="white"
                            fontSize="14"
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                        >
                            {zone.code}
                        </text>
                        {/* Status Icons */}
                        {zone.status === 'LOCKDOWN' && (
                            <text x={zone.x_coord + zone.width - 30} y={zone.y_coord + 25} fontSize="20">🔒</text>
                        )}
                        {zone.activeAlerts > 0 && (
                            <circle cx={zone.x_coord + zone.width - 10} cy={zone.y_coord + 10} r="5" fill="#EF4444" className={styles.pulse} />
                        )}
                    </g>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredZone && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: `${(hoveredZone.x_coord / 1600) * 100}%`,
                        top: `${(hoveredZone.y_coord / 900) * 100}%`
                    }}
                >
                    <h4>{hoveredZone.name}</h4>
                    <div className={styles.badge}>{hoveredZone.securityLevel}</div>
                    <p>{hoveredZone.description}</p>
                    <div className={styles.stats}>
                        <span>📡 Readers: {hoveredZone.readerStatus.online}/{hoveredZone.readerStatus.online + hoveredZone.readerStatus.offline}</span>
                        <span>⚠️ Alerts: {hoveredZone.activeAlerts}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
