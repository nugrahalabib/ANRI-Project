'use client';

import React from 'react';
import { StatusBadge } from '@/components/ui';
import styles from './AlertFeed.module.css';

export interface Alert {
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description?: string;
    timestamp: string;
    documentId?: string;
    documentTitle?: string;
    aiExplanation?: string;
}

interface AlertFeedProps {
    alerts: Alert[];
    maxItems?: number;
    onAlertClick?: (alert: Alert) => void;
    showTimestamps?: boolean;
    loading?: boolean;
    emptyMessage?: string;
}

const severityMap: Record<string, 'normal' | 'warning' | 'critical'> = {
    LOW: 'normal',
    MEDIUM: 'warning',
    HIGH: 'critical',
    CRITICAL: 'critical',
};

const typeIcons: Record<string, React.ReactNode> = {
    UNAUTHORIZED_ZONE: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    AFTER_HOURS_ACCESS: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    UNUSUAL_FREQUENCY: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    POLICY_VIOLATION: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    default: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
};

/**
 * Live AlertFeed component for displaying real-time alerts
 */
export function AlertFeed({
    alerts,
    maxItems = 10,
    onAlertClick,
    showTimestamps = true,
    loading = false,
    emptyMessage = 'No alerts',
}: AlertFeedProps) {
    const displayedAlerts = alerts.slice(0, maxItems);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Loading alerts...
                </div>
            </div>
        );
    }

    if (displayedAlerts.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.feed}>
                {displayedAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`${styles.alertItem} ${styles[alert.severity.toLowerCase()]} ${onAlertClick ? styles.clickable : ''}`}
                        onClick={() => onAlertClick?.(alert)}
                    >
                        <div className={`${styles.alertIcon} ${styles[alert.severity.toLowerCase()]}`}>
                            {typeIcons[alert.type] || typeIcons.default}
                            {alert.severity === 'CRITICAL' && (
                                <span className={styles.pulse} />
                            )}
                        </div>
                        <div className={styles.alertContent}>
                            <div className={styles.alertHeader}>
                                <StatusBadge status={severityMap[alert.severity]} animate={alert.severity === 'CRITICAL'} label={alert.severity} />
                                {showTimestamps && (
                                    <span className={styles.timestamp}>{alert.timestamp}</span>
                                )}
                            </div>
                            <h4 className={styles.alertTitle}>{alert.title}</h4>
                            {alert.documentTitle && (
                                <span className={styles.documentInfo}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    {alert.documentTitle}
                                </span>
                            )}
                            {alert.aiExplanation && (
                                <p className={styles.explanation}>
                                    <strong>AI:</strong> {alert.aiExplanation}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {alerts.length > maxItems && (
                <div className={styles.moreIndicator}>
                    +{alerts.length - maxItems} more alerts
                </div>
            )}
        </div>
    );
}

export default AlertFeed;
