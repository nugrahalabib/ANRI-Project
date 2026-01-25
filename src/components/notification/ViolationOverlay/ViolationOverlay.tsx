'use client';

import React, { useState, useEffect } from 'react';
import styles from './ViolationOverlay.module.css';

export interface ViolationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    violation: {
        policyName: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        message: string;
        helpdeskContact: string;
        timestamp: Date;
    } | null;
}

export function ViolationOverlay({ isOpen, onClose, violation }: ViolationOverlayProps) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (isOpen && violation?.severity !== 'CRITICAL') {
            setCountdown(10);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen, violation?.severity, onClose]);

    if (!isOpen || !violation) return null;

    const severityConfig = {
        LOW: {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            ),
            title: 'Aktivitas Tercatat',
            color: 'info',
        },
        MEDIUM: {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            ),
            title: 'Peringatan Kebijakan',
            color: 'warning',
        },
        HIGH: {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            title: 'Pelanggaran Kebijakan',
            color: 'high',
        },
        CRITICAL: {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            ),
            title: 'Pelanggaran Kritis',
            color: 'critical',
        },
    };

    const config = severityConfig[violation.severity];

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${styles[config.color]}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerIcon}>{config.icon}</div>
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>{config.title}</h2>
                        <span className={styles.policyName}>{violation.policyName}</span>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <p className={styles.message}>{violation.message}</p>

                    <div className={styles.details}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Waktu Terdeteksi</span>
                            <span className={styles.detailValue}>
                                {violation.timestamp.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Tingkat Severitas</span>
                            <span className={`${styles.detailValue} ${styles[`severity${violation.severity}`]}`}>
                                {violation.severity}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Helpdesk Info */}
                <div className={styles.helpdesk}>
                    <div className={styles.helpdeskIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </div>
                    <div className={styles.helpdeskContent}>
                        <span className={styles.helpdeskLabel}>Butuh bantuan? Hubungi IT Helpdesk:</span>
                        <span className={styles.helpdeskContact}>{violation.helpdeskContact}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {violation.severity === 'CRITICAL' ? (
                        <p className={styles.criticalWarning}>
                            Akses Anda telah ditangguhkan. Hubungi IT Helpdesk untuk melanjutkan.
                        </p>
                    ) : (
                        <>
                            <button className={styles.acknowledgeBtn} onClick={onClose}>
                                Saya Mengerti
                            </button>
                            <span className={styles.countdown}>
                                Menutup otomatis dalam {countdown} detik
                            </span>
                        </>
                    )}
                </div>

                {/* ANRI Branding */}
                <div className={styles.branding}>
                    <span>ANRI Sovereign Risk Intelligence Platform</span>
                </div>
            </div>
        </div>
    );
}

export default ViolationOverlay;
