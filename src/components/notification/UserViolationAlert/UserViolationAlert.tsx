'use client';

import React, { useState, useEffect } from 'react';
import styles from './UserViolationAlert.module.css';

interface Violation {
    id: string;
    timestamp: string;
    policyName: string;
    domain: string;
    action: 'BLOCK' | 'WARN' | 'SUSPEND_ACCESS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
}

interface UserViolationAlertProps {
    violation?: Violation | null;
    onDismiss?: () => void;
    onAcknowledge?: (id: string) => void;
}

/**
 * User-facing violation alert component
 * Shows to end-users when they trigger a policy violation
 * 
 * Use Cases:
 * - BLOCK: Full-screen modal when access is blocked
 * - WARN: Toast notification with warning
 * - SUSPEND_ACCESS: Full-screen with countdown
 */
export function UserViolationAlert({ violation, onDismiss, onAcknowledge }: UserViolationAlertProps) {
    const [countdown, setCountdown] = useState(10);
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        if (!violation || violation.action !== 'SUSPEND_ACCESS') return;

        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [violation]);

    if (!violation) return null;

    const handleAcknowledge = () => {
        setAcknowledged(true);
        onAcknowledge?.(violation.id);
        setTimeout(() => {
            onDismiss?.();
        }, 500);
    };

    // WARN action - Toast style
    if (violation.action === 'WARN') {
        return (
            <div className={`${styles.toast} ${styles.warn}`}>
                <div className={styles.toastIcon}>⚠️</div>
                <div className={styles.toastContent}>
                    <h4>Peringatan Kebijakan</h4>
                    <p>Akses ke <strong>{violation.domain}</strong> dicatat oleh sistem monitoring.</p>
                    <span className={styles.toastTime}>
                        {new Date(violation.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                </div>
                <button className={styles.toastClose} onClick={onDismiss}>×</button>
            </div>
        );
    }

    // BLOCK or SUSPEND_ACCESS - Full modal
    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${styles[violation.action.toLowerCase()]}`}>
                <div className={styles.modalIcon}>
                    {violation.action === 'BLOCK' ? '🚫' : '⛔'}
                </div>

                <h2 className={styles.modalTitle}>
                    {violation.action === 'BLOCK'
                        ? 'Akses Diblokir'
                        : 'Akses Anda Ditangguhkan'}
                </h2>

                <div className={styles.modalMessage}>
                    <p>
                        <strong>Akses Anda dibatasi</strong> karena adanya pelanggaran kebijakan
                        yang terdeteksi oleh sistem pemantauan keamanan otomatis.
                    </p>
                </div>

                <div className={styles.violationDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Domain/URL:</span>
                        <span className={styles.detailValue}>{violation.domain}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Kebijakan:</span>
                        <span className={styles.detailValue}>{violation.policyName}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Waktu:</span>
                        <span className={styles.detailValue}>
                            {new Date(violation.timestamp).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Tingkat:</span>
                        <span className={`${styles.severity} ${styles[violation.severity.toLowerCase()]}`}>
                            {violation.severity}
                        </span>
                    </div>
                </div>

                {violation.action === 'SUSPEND_ACCESS' && countdown > 0 && (
                    <div className={styles.countdown}>
                        <span>Akses akan dikembalikan dalam</span>
                        <div className={styles.countdownTimer}>{countdown}</div>
                        <span>detik</span>
                    </div>
                )}

                <div className={styles.modalActions}>
                    <button
                        className={`${styles.acknowledgeBtn} ${acknowledged ? styles.acknowledged : ''}`}
                        onClick={handleAcknowledge}
                        disabled={acknowledged}
                    >
                        {acknowledged ? '✓ Diakui' : 'Saya Mengerti'}
                    </button>
                </div>

                <div className={styles.footer}>
                    <p>
                        Jika Anda merasa ini adalah kesalahan, silakan hubungi
                        <strong> Tim IT Security</strong> dengan menyertakan ID pelanggaran:
                    </p>
                    <code className={styles.violationId}>{violation.id}</code>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to simulate receiving violation alerts
 * In production, this would connect to WebSocket or polling
 */
export function useViolationAlerts() {
    const [currentViolation, setCurrentViolation] = useState<Violation | null>(null);
    const [history, setHistory] = useState<Violation[]>([]);

    const triggerViolation = (violation: Violation) => {
        setCurrentViolation(violation);
        setHistory(prev => [violation, ...prev]);
    };

    const dismissViolation = () => {
        setCurrentViolation(null);
    };

    const acknowledgeViolation = (id: string) => {
        setHistory(prev =>
            prev.map(v => v.id === id ? { ...v, acknowledged: true } as Violation : v)
        );
    };

    return {
        currentViolation,
        history,
        triggerViolation,
        dismissViolation,
        acknowledgeViolation,
    };
}

export default UserViolationAlert;
