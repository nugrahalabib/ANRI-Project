'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Button } from '@/components/ui';
import styles from './page.module.css';

interface Zone {
    id: string;
    code: string;
    name: string;
    description: string;
    securityLevel: 'HIGH_SECURITY' | 'RESTRICTED' | 'STANDARD' | 'PUBLIC';
    floor: string;
    building: string;
    rfidReaders: number;
    rfidOnline: number;
    documentCount: number;
    access24h: number;
    riskScore: number;
    status: string;
}

const levelConfig: Record<string, { label: string; labelId: string; color: string; icon: string }> = {
    HIGH_SECURITY: { label: 'HIGH SECURITY', labelId: 'KEAMANAN TINGGI', color: 'critical', icon: '◆' },
    RESTRICTED: { label: 'RESTRICTED', labelId: 'TERBATAS', color: 'warning', icon: '◈' },
    STANDARD: { label: 'STANDARD', labelId: 'STANDAR', color: 'normal', icon: '◇' },
    PUBLIC: { label: 'PUBLIC', labelId: 'PUBLIK', color: 'info', icon: '○' },
};

export default function ZonesPage() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [showLockdownModal, setShowLockdownModal] = useState(false);
    const [lockdownZone, setLockdownZone] = useState<Zone | null>(null);
    const [lockdownReason, setLockdownReason] = useState('');
    const [lockdownSuccess, setLockdownSuccess] = useState(false);

    useEffect(() => {
        async function fetchZones() {
            try {
                const res = await fetch('/api/zones');
                const data = await res.json();
                if (data.success) {
                    setZones(data.data);
                }
            } catch (error) {
                console.error('Error fetching zones:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchZones();
    }, []);

    const handleLockdown = (zone: Zone) => {
        setLockdownZone(zone);
        setLockdownReason('');
        setLockdownSuccess(false);
        setShowLockdownModal(true);
    };

    const confirmLockdown = () => {
        if (!lockdownReason) return;
        setLockdownSuccess(true);
        setTimeout(() => {
            setShowLockdownModal(false);
            setLockdownSuccess(false);
        }, 2000);
    };

    const getRiskColor = (score: number) => {
        if (score > 70) return 'var(--status-critical)';
        if (score > 40) return 'var(--status-warning)';
        return 'var(--status-normal)';
    };

    const groupedZones = {
        HIGH_SECURITY: zones.filter(z => z.securityLevel === 'HIGH_SECURITY'),
        RESTRICTED: zones.filter(z => z.securityLevel === 'RESTRICTED'),
        STANDARD: zones.filter(z => z.securityLevel === 'STANDARD'),
        PUBLIC: zones.filter(z => z.securityLevel === 'PUBLIC'),
    };

    if (loading) {
        return (
            <DashboardLayout title="Tactical Zone Command" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading zones from database...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Tactical Zone Command" subtitle="AI-Powered Security Zone Monitoring">
            <div className={styles.container}>
                {/* Stats Summary */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{zones.length}</span>
                        <span className={styles.statLabel}>Total Zones</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{groupedZones.HIGH_SECURITY.length}</span>
                        <span className={styles.statLabel}>High Security</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{zones.reduce((sum, z) => sum + z.rfidReaders, 0)}</span>
                        <span className={styles.statLabel}>RFID Readers</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{zones.reduce((sum, z) => sum + z.rfidOnline, 0)}</span>
                        <span className={styles.statLabel}>Readers Online</span>
                    </div>
                </section>

                {/* Zones by Security Level */}
                {Object.entries(groupedZones).map(([level, levelZones]) => (
                    levelZones.length > 0 && (
                        <section key={level} className={styles.levelSection}>
                            <div className={styles.levelHeader}>
                                <span className={`${styles.levelIcon} ${styles[levelConfig[level].color]}`}>
                                    {levelConfig[level].icon}
                                </span>
                                <h2>{levelConfig[level].label}</h2>
                                <span className={styles.levelCount}>{levelZones.length} zones</span>
                            </div>
                            <div className={styles.zonesGrid}>
                                {levelZones.map((zone) => (
                                    <div
                                        key={zone.id}
                                        className={`${styles.zoneCard} ${zone.riskScore > 50 ? styles.alertCard : ''}`}
                                        onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                                    >
                                        <div className={styles.zoneHeader}>
                                            <div className={styles.zoneTitle}>
                                                <h3>{zone.name}</h3>
                                                <span className={styles.zoneCode}>{zone.code}</span>
                                            </div>
                                            <div className={styles.riskBadge} style={{ background: getRiskColor(zone.riskScore) }}>
                                                {zone.riskScore}%
                                            </div>
                                        </div>
                                        <div className={styles.zoneLocation}>{zone.building}, {zone.floor}</div>
                                        <div className={styles.zoneStats}>
                                            <div className={styles.zoneStat}>
                                                <span className={styles.statIcon}>📄</span>
                                                <span>{zone.documentCount} docs</span>
                                            </div>
                                            <div className={styles.zoneStat}>
                                                <span className={styles.statIcon}>📡</span>
                                                <span>{zone.rfidOnline}/{zone.rfidReaders} readers</span>
                                            </div>
                                            <div className={styles.zoneStat}>
                                                <span className={styles.statIcon}>👤</span>
                                                <span>{zone.access24h} access/24h</span>
                                            </div>
                                        </div>
                                        {selectedZone?.id === zone.id && (
                                            <div className={styles.zoneActions}>
                                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                                    View Details
                                                </Button>
                                                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleLockdown(zone); }}>
                                                    🔒 Lockdown
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                ))}

                {/* Lockdown Modal */}
                {showLockdownModal && lockdownZone && (
                    <div className={styles.modalOverlay} onClick={() => setShowLockdownModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>🔒 Zone Lockdown</h2>
                                <button className={styles.closeBtn} onClick={() => setShowLockdownModal(false)}>×</button>
                            </div>
                            {lockdownSuccess ? (
                                <div className={styles.successMessage}>
                                    <span className={styles.successIcon}>✓</span>
                                    <h3>Lockdown Initiated!</h3>
                                    <p>Zone {lockdownZone.name} is now in lockdown mode.</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.modalBody}>
                                        <div className={styles.warningBox}>
                                            <strong>⚠️ Warning:</strong> This will restrict all access to {lockdownZone.name}.
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Reason for Lockdown *</label>
                                            <textarea
                                                value={lockdownReason}
                                                onChange={(e) => setLockdownReason(e.target.value)}
                                                placeholder="Describe the reason for lockdown..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.modalFooter}>
                                        <Button variant="secondary" onClick={() => setShowLockdownModal(false)}>Cancel</Button>
                                        <Button variant="primary" onClick={confirmLockdown} disabled={!lockdownReason}>
                                            Confirm Lockdown
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
