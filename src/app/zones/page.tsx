'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, StatusBadge } from '@/components/ui';
import { ZoneLockdownModal } from '@/components/zones/ZoneLockdownModal/ZoneLockdownModal';
import styles from './page.module.css';

interface Zone {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    securityLevel: 'HIGH_SECURITY' | 'RESTRICTED' | 'STANDARD' | 'PUBLIC';
    status: 'ACTIVE' | 'LOCKDOWN';
    floor?: string | null;
    building?: string | null;
    documentCount: number;
    access24h: number;
    riskScore: number;
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
}

const securityLevelConfig: Record<string, { color: 'critical' | 'warning' | 'normal'; label: string; cssClass: string }> = {
    HIGH_SECURITY: { color: 'critical', label: 'High Security', cssClass: 'highSecurity' },
    RESTRICTED: { color: 'warning', label: 'Restricted', cssClass: 'restricted' },
    STANDARD: { color: 'normal', label: 'Standard', cssClass: 'standard' },
    PUBLIC: { color: 'normal', label: 'Public', cssClass: 'public' },
};

// SVG Icons
const icons = {
    building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" /></svg>,
    lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
    unlock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></svg>,
    file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    wifi: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" /></svg>,
    alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    externalLink: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
};

export default function ZonesPage() {
    const router = useRouter();
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [showLockdownModal, setShowLockdownModal] = useState(false);
    const [showAddZoneModal, setShowAddZoneModal] = useState(false);
    const [filterLevel, setFilterLevel] = useState<string>('all');

    const fetchZones = async () => {
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
    };

    useEffect(() => {
        fetchZones();
    }, []);

    const handleZoneSelect = (zone: Zone) => {
        setSelectedZone(zone);
    };

    const handleLockdownToggle = () => {
        if (selectedZone) {
            setShowLockdownModal(true);
        }
    };

    const handleConfirmLockdown = async (reason: string) => {
        if (!selectedZone) return;

        try {
            const res = await fetch('/api/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'LOCKDOWN',
                    zoneId: selectedZone.id,
                    status: selectedZone.status === 'ACTIVE' ? 'LOCKDOWN' : 'ACTIVE',
                    reason
                })
            });

            const data = await res.json();
            if (data.success) {
                await fetchZones();
                setShowLockdownModal(false);
                setSelectedZone(null);
            } else {
                alert('Failed to update zone status: ' + data.error);
            }
        } catch (error) {
            console.error('Lockdown error:', error);
            alert('System Error during lockdown sequence');
        }
    };

    // Navigate to filtered views
    const navigateToDocuments = (zoneId?: string) => {
        if (zoneId) {
            router.push(`/documents?zoneId=${zoneId}`);
        } else {
            router.push('/documents');
        }
    };

    const navigateToAlerts = () => {
        router.push('/alerts');
    };

    // Calculate stats
    const stats = {
        total: zones.length,
        lockdown: zones.filter(z => z.status === 'LOCKDOWN').length,
        highSecurity: zones.filter(z => z.securityLevel === 'HIGH_SECURITY').length,
        totalDocuments: zones.reduce((sum, z) => sum + z.documentCount, 0),
        readersOnline: zones.reduce((sum, z) => sum + z.readerStatus.online, 0),
        readersTotal: zones.reduce((sum, z) => sum + z.readerStatus.total, 0),
        alertsActive: zones.reduce((sum, z) => sum + z.activeAlerts, 0),
    };

    const filteredZones = filterLevel === 'all'
        ? zones
        : zones.filter(z => z.securityLevel === filterLevel);

    if (loading) {
        return (
            <DashboardLayout title="Security Zones" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading zone data...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Security Zones" subtitle="Facility Zone Monitoring & Access Control">
            <div className={styles.container}>
                {/* Page Header with Actions */}
                <div className={styles.pageHeader}>
                    <div className={styles.headerInfo}>
                        <p>Kelola zona keamanan, aktivasi lockdown, dan pantau pergerakan dokumen per zona.</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowAddZoneModal(true)} className={styles.addBtn}>
                        <span className={styles.btnIcon}>{icons.plus}</span>
                        Tambah Zona
                    </Button>
                </div>

                {/* Stats Summary Row - CLICKABLE */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>{icons.building}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total Zones</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${stats.lockdown > 0 ? styles.alertCard : ''}`}>
                        <div className={styles.statIcon}>{icons.lock}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.lockdown}</span>
                            <span className={styles.statLabel}>In Lockdown</span>
                        </div>
                    </div>
                    <div
                        className={`${styles.statCard} ${styles.clickable}`}
                        onClick={() => navigateToDocuments()}
                        title="Klik untuk melihat semua dokumen"
                    >
                        <div className={styles.statIcon}>{icons.file}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalDocuments}</span>
                            <span className={styles.statLabel}>Documents</span>
                        </div>
                        <span className={styles.linkIcon}>{icons.externalLink}</span>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>{icons.wifi}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.readersOnline}/{stats.readersTotal}</span>
                            <span className={styles.statLabel}>Readers Online</span>
                        </div>
                    </div>
                    <div
                        className={`${styles.statCard} ${stats.alertsActive > 0 ? styles.alertCard : ''} ${styles.clickable}`}
                        onClick={navigateToAlerts}
                        title="Klik untuk melihat daftar alerts"
                    >
                        <div className={styles.statIcon}>{icons.alert}</div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.alertsActive}</span>
                            <span className={styles.statLabel}>Active Alerts</span>
                        </div>
                        <span className={styles.linkIcon}>{icons.externalLink}</span>
                    </div>
                </section>

                {/* Main Content: Two Column Layout */}
                <div className={styles.mainGrid}>
                    {/* Left: Zone List */}
                    <section className={styles.zoneListSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Zone List</h3>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Levels</option>
                                <option value="HIGH_SECURITY">High Security</option>
                                <option value="RESTRICTED">Restricted</option>
                                <option value="STANDARD">Standard</option>
                                <option value="PUBLIC">Public</option>
                            </select>
                        </div>

                        <div className={styles.zoneList}>
                            {filteredZones.map(zone => {
                                const config = securityLevelConfig[zone.securityLevel];
                                const isSelected = selectedZone?.id === zone.id;

                                return (
                                    <div
                                        key={zone.id}
                                        className={`${styles.zoneCard} ${isSelected ? styles.selected : ''} ${zone.status === 'LOCKDOWN' ? styles.lockdownCard : ''}`}
                                        onClick={() => handleZoneSelect(zone)}
                                    >
                                        <div className={styles.zoneCardHeader}>
                                            <div className={styles.zoneInfo}>
                                                <div className={`${styles.zoneIcon} ${styles[config.cssClass]}`}>
                                                    {icons.shield}
                                                </div>
                                                <div>
                                                    <h4>{zone.name}</h4>
                                                    <span className={styles.zoneCode}>{zone.code}</span>
                                                </div>
                                            </div>
                                            {zone.status === 'LOCKDOWN' && (
                                                <span className={styles.lockdownBadge}>LOCKDOWN</span>
                                            )}
                                        </div>
                                        <div className={styles.zoneCardStats}>
                                            <span>{zone.documentCount} documents</span>
                                            <span>{zone.readerStatus.online}/{zone.readerStatus.total} readers</span>
                                            {zone.activeAlerts > 0 && (
                                                <span className={styles.alertBadge}>{zone.activeAlerts} alerts</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Right: Zone Detail Panel */}
                    <section className={styles.detailSection}>
                        {selectedZone ? (
                            <Card className={styles.detailCard}>
                                <div className={styles.detailHeader}>
                                    <div>
                                        <h2>{selectedZone.name}</h2>
                                        <p className={styles.detailSubtitle}>
                                            {selectedZone.building || 'Gedung Utama'} • {selectedZone.floor || 'Lantai 1'}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        status={securityLevelConfig[selectedZone.securityLevel].color}
                                        label={securityLevelConfig[selectedZone.securityLevel].label}
                                    />
                                </div>

                                {selectedZone.status === 'LOCKDOWN' && (
                                    <div className={styles.lockdownBanner}>
                                        {icons.lock}
                                        <span>This zone is currently in lockdown mode</span>
                                    </div>
                                )}

                                {/* Action Buttons - PROMINENT */}
                                <div className={styles.actionButtons}>
                                    <Button
                                        variant={selectedZone.status === 'ACTIVE' ? 'danger' : 'primary'}
                                        onClick={handleLockdownToggle}
                                        className={styles.actionBtn}
                                    >
                                        {selectedZone.status === 'ACTIVE' ? (
                                            <><span className={styles.btnIcon}>{icons.lock}</span> Initiate Lockdown</>
                                        ) : (
                                            <><span className={styles.btnIcon}>{icons.unlock}</span> Restore Access</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {/* TODO: Edit zone */ }}
                                        className={styles.actionBtn}
                                    >
                                        <span className={styles.btnIcon}>{icons.edit}</span> Edit Zone
                                    </Button>
                                </div>

                                <div className={styles.detailStats}>
                                    <div className={styles.detailStatItem}>
                                        <span className={styles.detailStatLabel}>Zone Code</span>
                                        <span className={styles.detailStatValue}>{selectedZone.code}</span>
                                    </div>
                                    <div className={styles.detailStatItem}>
                                        <span className={styles.detailStatLabel}>Security Level</span>
                                        <span className={styles.detailStatValue}>{selectedZone.securityLevel.replace('_', ' ')}</span>
                                    </div>
                                    <div
                                        className={`${styles.detailStatItem} ${styles.clickableStat}`}
                                        onClick={() => navigateToDocuments(selectedZone.id)}
                                        title="Klik untuk melihat dokumen di zona ini"
                                    >
                                        <span className={styles.detailStatLabel}>Documents in Zone</span>
                                        <span className={styles.detailStatValue}>
                                            {selectedZone.documentCount} tracked
                                            <span className={styles.viewLink}>View →</span>
                                        </span>
                                    </div>
                                    <div className={styles.detailStatItem}>
                                        <span className={styles.detailStatLabel}>Access 24h</span>
                                        <span className={styles.detailStatValue}>{selectedZone.access24h} movements</span>
                                    </div>
                                    <div className={styles.detailStatItem}>
                                        <span className={styles.detailStatLabel}>RFID Readers</span>
                                        <span className={styles.detailStatValue}>
                                            {selectedZone.readerStatus.online} / {selectedZone.readerStatus.total} online
                                        </span>
                                    </div>
                                    <div
                                        className={`${styles.detailStatItem} ${selectedZone.activeAlerts > 0 ? styles.clickableStat : ''}`}
                                        onClick={() => selectedZone.activeAlerts > 0 && navigateToAlerts()}
                                        title={selectedZone.activeAlerts > 0 ? "Klik untuk melihat alerts" : ""}
                                    >
                                        <span className={styles.detailStatLabel}>Active Alerts</span>
                                        <span className={`${styles.detailStatValue} ${selectedZone.activeAlerts > 0 ? styles.alertText : ''}`}>
                                            {selectedZone.activeAlerts} suspicious
                                            {selectedZone.activeAlerts > 0 && <span className={styles.viewLink}>View →</span>}
                                        </span>
                                    </div>
                                </div>

                                {selectedZone.description && (
                                    <div className={styles.detailDescription}>
                                        <h4>Description</h4>
                                        <p>{selectedZone.description}</p>
                                    </div>
                                )}

                                <div className={styles.legendBox}>
                                    <h4>Security Level Legend</h4>
                                    <div className={styles.legendItems}>
                                        <div className={styles.legendItem}>
                                            <span className={`${styles.legendDot} ${styles.critical}`}></span>
                                            <span>High Security - Restricted archive access</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <span className={`${styles.legendDot} ${styles.warning}`}></span>
                                            <span>Restricted - Authorization required</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <span className={`${styles.legendDot} ${styles.info}`}></span>
                                            <span>Standard - General work areas</span>
                                        </div>
                                        <div className={styles.legendItem}>
                                            <span className={`${styles.legendDot} ${styles.normal}`}></span>
                                            <span>Public - Open access areas</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className={styles.emptyCard}>
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>{icons.mapPin}</div>
                                    <h3>Select a Zone</h3>
                                    <p>Click on a zone from the list to view details, manage lockdown, and see tracked documents.</p>
                                </div>
                            </Card>
                        )}
                    </section>
                </div>

                {/* Lockdown Modal */}
                {selectedZone && (
                    <ZoneLockdownModal
                        isOpen={showLockdownModal}
                        onClose={() => setShowLockdownModal(false)}
                        zone={selectedZone}
                        onConfirm={handleConfirmLockdown}
                    />
                )}

                {/* Add Zone Modal - Simple Placeholder */}
                {showAddZoneModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddZoneModal(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <h3>Tambah Zona Baru</h3>
                            <p>Fitur ini akan segera tersedia. Untuk demo, zona sudah di-seed di database.</p>
                            <Button variant="secondary" onClick={() => setShowAddZoneModal(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
