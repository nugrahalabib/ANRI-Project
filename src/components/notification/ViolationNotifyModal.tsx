'use client';

import React from 'react';
import styles from './ViolationNotifyModal.module.css';

export interface ViolationNotifyProps {
    isOpen: boolean;
    onClose: () => void;
    policyName: string;
    violationUrl?: string;
    violationDomain?: string;
    actionTaken: string;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    helpdeskPhone?: string;
    helpdeskEmail?: string;
}

const severityLabels: Record<string, { label: string; color: string }> = {
    CRITICAL: { label: 'KRITIS', color: '#dc2626' },
    HIGH: { label: 'TINGGI', color: '#ea580c' },
    MEDIUM: { label: 'SEDANG', color: '#ca8a04' },
    LOW: { label: 'RENDAH', color: '#16a34a' },
};

const actionLabels: Record<string, string> = {
    BLOCK: 'AKSES DIBLOKIR',
    WARN: 'PERINGATAN',
    LOG_ONLY: 'TERCATAT',
    SUSPEND_ACCESS: 'AKSES DITANGGUHKAN',
    ISOLATE_DEVICE: 'PERANGKAT DIISOLASI',
};

export function ViolationNotifyModal({
    isOpen,
    onClose,
    policyName,
    violationUrl,
    violationDomain,
    actionTaken,
    timestamp,
    severity,
    helpdeskPhone = 'ext. 1234',
    helpdeskEmail = 'helpdesk@anri.go.id',
}: ViolationNotifyProps) {
    if (!isOpen) return null;

    const severityInfo = severityLabels[severity] || severityLabels.MEDIUM;
    const actionLabel = actionLabels[actionTaken] || actionTaken;

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        }).format(date);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.warningIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <h2>SISTEM PERINGATAN KEAMANAN</h2>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <p className={styles.mainMessage}>
                        Akses Anda dibatasi karena adanya pelanggaran kebijakan yang
                        terdeteksi oleh sistem pemantauan keamanan otomatis.
                    </p>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Kebijakan:</span>
                            <span className={styles.detailValue}>{policyName}</span>
                        </div>

                        {violationUrl && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>URL:</span>
                                <span className={`${styles.detailValue} ${styles.urlValue}`}>
                                    {violationUrl}
                                </span>
                            </div>
                        )}

                        {violationDomain && !violationUrl && (
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Domain:</span>
                                <span className={`${styles.detailValue} ${styles.urlValue}`}>
                                    {violationDomain}
                                </span>
                            </div>
                        )}

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Waktu:</span>
                            <span className={styles.detailValue}>
                                {formatTimestamp(timestamp)}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Tingkat:</span>
                            <span
                                className={styles.severityBadge}
                                style={{ backgroundColor: severityInfo.color }}
                            >
                                {severityInfo.label}
                            </span>
                        </div>

                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Tindakan:</span>
                            <span className={styles.actionBadge}>
                                {actionLabel}
                            </span>
                        </div>
                    </div>

                    <div className={styles.helpSection}>
                        <p>Untuk bantuan dan klarifikasi, hubungi:</p>
                        <div className={styles.helpContacts}>
                            <div className={styles.helpItem}>
                                <span className={styles.helpIcon}>📞</span>
                                <span>Helpdesk IT: {helpdeskPhone}</span>
                            </div>
                            <div className={styles.helpItem}>
                                <span className={styles.helpIcon}>📧</span>
                                <span>{helpdeskEmail}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.acknowledgeBtn}
                        onClick={onClose}
                    >
                        Saya Mengerti
                    </button>
                </div>

                {/* Government Badge */}
                <div className={styles.govBadge}>
                    <span>ANRI Security Monitoring System</span>
                    <span>•</span>
                    <span>Arsip Nasional Republik Indonesia</span>
                </div>
            </div>
        </div>
    );
}
