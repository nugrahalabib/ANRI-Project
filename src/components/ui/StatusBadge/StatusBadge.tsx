import React from 'react';
import styles from './StatusBadge.module.css';

export type StatusType = 'normal' | 'warning' | 'critical' | 'low' | 'medium' | 'high' | 'info';

export interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    showDot?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
    className?: string;
}

const statusLabels: Record<StatusType, string> = {
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    info: 'Info',
};

export function StatusBadge({
    status,
    label,
    showDot = true,
    size = 'md',
    animate = false,
    className = '',
}: StatusBadgeProps) {
    const displayLabel = label || statusLabels[status];

    const classes = [
        styles.badge,
        styles[status],
        styles[size],
        animate ? styles.animate : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {showDot && <span className={styles.dot} />}
            <span className={styles.label}>{displayLabel}</span>
        </span>
    );
}

export default StatusBadge;
