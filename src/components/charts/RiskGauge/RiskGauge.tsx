'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './RiskGauge.module.css';

// Dynamic import for ApexCharts (client-side only)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface RiskGaugeProps {
    value: number; // 0-100
    title?: string;
    subtitle?: string;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function RiskGauge({
    value,
    title,
    subtitle,
    showLabels = true,
    size = 'md',
}: RiskGaugeProps) {
    const getColor = (val: number): string => {
        if (val < 30) return '#10b981'; // Green
        if (val < 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const getLabel = (val: number): string => {
        if (val < 30) return 'Low Risk';
        if (val < 60) return 'Medium Risk';
        if (val < 80) return 'High Risk';
        return 'Critical';
    };

    const sizeConfig = {
        sm: { height: 150, fontSize: '18px', labelSize: '10px' },
        md: { height: 200, fontSize: '24px', labelSize: '12px' },
        lg: { height: 280, fontSize: '32px', labelSize: '14px' },
    };

    const config = sizeConfig[size];
    const color = getColor(value);

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'radialBar',
            sparkline: { enabled: true },
            animations: {
                enabled: true,
                speed: 800,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    size: '65%',
                    background: 'transparent',
                },
                track: {
                    background: '#1c3a5e',
                    strokeWidth: '100%',
                    margin: 0,
                },
                dataLabels: {
                    name: {
                        show: showLabels,
                        fontSize: config.labelSize,
                        fontWeight: 500,
                        color: '#9ca3af',
                        offsetY: -10,
                    },
                    value: {
                        show: true,
                        fontSize: config.fontSize,
                        fontWeight: 700,
                        color: '#f3f4f6',
                        offsetY: 5,
                        formatter: (val: number) => `${Math.round(val)}%`,
                    },
                },
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                gradientToColors: [color],
                stops: [0, 100],
            },
        },
        colors: [color],
        stroke: {
            lineCap: 'round',
        },
        labels: [getLabel(value)],
    };

    return (
        <div className={styles.container}>
            {title && <h3 className={styles.title}>{title}</h3>}
            <div className={styles.chart}>
                <Chart
                    type="radialBar"
                    options={options}
                    series={[value]}
                    height={config.height}
                />
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

export default RiskGauge;
