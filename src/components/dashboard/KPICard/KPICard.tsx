'use client';

import React from 'react';
import styles from './KPICard.module.css';

export type TrendDirection = 'up' | 'down' | 'stable';
export type KPIStatus = 'normal' | 'warning' | 'critical';

export interface KPICardProps {
    title: string;
    value: string | number;
    unit?: string;
    description?: string;
    trend?: {
        direction: TrendDirection;
        value: string;
        period?: string;
    };
    status?: KPIStatus;
    icon?: React.ReactNode;
    sparkline?: number[];
}

export function KPICard({
    title,
    value,
    unit,
    description,
    trend,
    status = 'normal',
    icon,
    sparkline,
}: KPICardProps) {
    // Safe value formatting - handle NaN, null, undefined
    const formatValue = (val: string | number): string => {
        if (val === null || val === undefined) return '—';
        if (typeof val === 'string') return val;
        if (isNaN(val) || !isFinite(val)) return '—';
        return val.toLocaleString();
    };

    const getTrendIcon = (direction: TrendDirection) => {
        switch (direction) {
            case 'up':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                );
            case 'down':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                        <polyline points="17 18 23 18 23 12" />
                    </svg>
                );
            case 'stable':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                );
        }
    };

    const renderSparkline = () => {
        if (!sparkline || sparkline.length < 2) return null;

        const max = Math.max(...sparkline);
        const min = Math.min(...sparkline);
        const range = max - min || 1;
        const width = 80;
        const height = 30;

        const points = sparkline.map((val, i) => {
            const x = (i / (sparkline.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className={styles.sparkline}>
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        );
    };

    return (
        <div className={`${styles.card} ${styles[status]}`}>
            <div className={styles.header}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <span className={styles.title}>{title}</span>
            </div>

            <div className={styles.body}>
                <div className={styles.valueSection}>
                    <span className={styles.value}>{formatValue(value)}</span>
                    {unit && <span className={styles.unit}>{unit}</span>}
                </div>

                {renderSparkline()}
            </div>

            <div className={styles.footer}>
                {description && <span className={styles.description}>{description}</span>}

                {trend && (
                    <div className={`${styles.trend} ${styles[`trend${trend.direction.charAt(0).toUpperCase() + trend.direction.slice(1)}`]}`}>
                        <span className={styles.trendIcon}>{getTrendIcon(trend.direction)}</span>
                        <span className={styles.trendValue}>{trend.value}</span>
                        {trend.period && <span className={styles.trendPeriod}>{trend.period}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default KPICard;
