'use client';

import React from 'react';
import styles from './ViolationOverlay.module.css';
import { Button, StatusBadge } from '@/components/ui';

/**
 * ViolationOverlay Component
 * 
 * A transparent, user-facing notification that appears when a policy violation occurs.
 * Explains the policy breach and provides helpdesk contacts as per Module B requirements.
 * 
 * This is the "User Notification Overlay" specified in the brief for transparency.
 */

export interface ViolationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onAcknowledge: () => void;
    violation: {
        policyId: string;
        policyName: string;
        action: 'BLOCK' | 'WARN' | 'SUSPEND_ACCESS' | 'ISOLATE_DEVICE';
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        message: string;
        target: string;
        timestamp: Date;
        incidentRef: string;
    };
    helpdeskContact?: {
        phone: string;
        email: string;
        extension: string;
    };
}

const actionLabels: Record<string, { label: string; icon: string }> = {
    BLOCK: { label: 'ACCESS BLOCKED', icon: '🚫' },
    WARN: { label: 'WARNING', icon: '⚠️' },
    SUSPEND_ACCESS: { label: 'ACCESS SUSPENDED', icon: '🔒' },
    ISOLATE_DEVICE: { label: 'DEVICE ISOLATED', icon: '💻' },
};

const defaultHelpdesk = {
    phone: '+62-21-7805851',
    email: 'helpdesk@anri.go.id',
    extension: '1234',
};

export const ViolationOverlay: React.FC<ViolationOverlayProps> = ({
    isOpen,
    onClose,
    onAcknowledge,
    violation,
    helpdeskContact = defaultHelpdesk,
}) => {
    if (!isOpen) return null;

    const actionInfo = actionLabels[violation.action];
    const isCritical = violation.action === 'BLOCK' || violation.action === 'ISOLATE_DEVICE' || violation.action === 'SUSPEND_ACCESS';

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${isCritical ? styles.critical : styles.warning}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🛡️</span>
                        <span className={styles.logoText}>ANRI Security</span>
                    </div>
                    <h1 className={styles.actionTitle}>
                        {actionInfo.icon} {actionInfo.label}
                    </h1>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Policy Info */}
                    <div className={styles.policyInfo}>
                        <div className={styles.policyHeader}>
                            <span className={styles.policyLabel}>Policy Violation Detected</span>
                            <StatusBadge status={violation.severity.toLowerCase() as any} label={violation.severity} />
                        </div>
                        <h2 className={styles.policyName}>{violation.policyName}</h2>
                        <code className={styles.policyId}>{violation.policyId}</code>
                    </div>

                    {/* Explanation Message */}
                    <div className={styles.messageBox}>
                        <p className={styles.message}>{violation.message}</p>
                    </div>

                    {/* Target Info */}
                    <div className={styles.targetSection}>
                        <div className={styles.targetRow}>
                            <span className={styles.targetLabel}>Target:</span>
                            <code className={styles.targetValue}>{violation.target}</code>
                        </div>
                        <div className={styles.targetRow}>
                            <span className={styles.targetLabel}>Timestamp:</span>
                            <span className={styles.targetValue}>
                                {violation.timestamp.toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </span>
                        </div>
                        <div className={styles.targetRow}>
                            <span className={styles.targetLabel}>Incident Reference:</span>
                            <code className={styles.targetValue}>{violation.incidentRef}</code>
                        </div>
                    </div>

                    {/* Incident Logged Notice */}
                    <div className={styles.loggedNotice}>
                        <span className={styles.loggedIcon}>📋</span>
                        <span>Insiden ini telah dicatat dan akan ditinjau oleh Tim Keamanan.</span>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.helpdesk}>
                        <p className={styles.helpdeskTitle}>Butuh bantuan? Hubungi IT Helpdesk:</p>
                        <div className={styles.helpdeskContacts}>
                            <span>📞 {helpdeskContact.phone} (ext. {helpdeskContact.extension})</span>
                            <span>✉️ {helpdeskContact.email}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button variant="primary" onClick={onAcknowledge}>
                            Acknowledge & Close
                        </Button>
                        {violation.action === 'WARN' && (
                            <Button variant="ghost" onClick={onClose}>
                                Continue Anyway
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViolationOverlay;
