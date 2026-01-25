'use client';

import React, { useEffect, useRef } from 'react';
import styles from './HeatmapChart.module.css';

interface HeatmapData {
    x: string;
    y: string;
    value: number;
}

interface HeatmapChartProps {
    data: HeatmapData[];
    xLabels: string[];
    yLabels: string[];
    title?: string;
    colorScale?: {
        min: string;
        mid: string;
        max: string;
    };
    height?: number;
    showValues?: boolean;
    onCellClick?: (cell: HeatmapData) => void;
}

/**
 * HeatmapChart component for visualizing matrix data
 * Used for zone activity, time-based access patterns, etc.
 */
export function HeatmapChart({
    data,
    xLabels,
    yLabels,
    title,
    colorScale = {
        min: '#064e3b',
        mid: '#78350f',
        max: '#7f1d1d',
    },
    height = 300,
    showValues = true,
    onCellClick,
}: HeatmapChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const minValue = Math.min(...data.map(d => d.value), 0);

    const getColor = (value: number): string => {
        const normalized = (value - minValue) / (maxValue - minValue);

        if (normalized <= 0.5) {
            // Interpolate between min and mid
            const t = normalized * 2;
            return interpolateColor(colorScale.min, colorScale.mid, t);
        } else {
            // Interpolate between mid and max
            const t = (normalized - 0.5) * 2;
            return interpolateColor(colorScale.mid, colorScale.max, t);
        }
    };

    const interpolateColor = (color1: string, color2: string, t: number): string => {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);

        if (!c1 || !c2) return color1;

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    };

    const getCellValue = (x: string, y: string): number => {
        const cell = data.find(d => d.x === x && d.y === y);
        return cell?.value ?? 0;
    };

    const getTextColor = (value: number): string => {
        const normalized = (value - minValue) / (maxValue - minValue);
        return normalized > 0.6 ? 'var(--grey-100)' : 'var(--grey-300)';
    };

    return (
        <div className={styles.container}>
            {title && <h3 className={styles.title}>{title}</h3>}

            <div className={styles.chartWrapper} style={{ height }}>
                <div className={styles.yAxisLabels}>
                    {yLabels.map((label) => (
                        <div key={label} className={styles.yLabel}>
                            {label}
                        </div>
                    ))}
                </div>

                <div className={styles.grid}>
                    {yLabels.map((yLabel) => (
                        <div key={yLabel} className={styles.row}>
                            {xLabels.map((xLabel) => {
                                const value = getCellValue(xLabel, yLabel);
                                return (
                                    <div
                                        key={`${xLabel}-${yLabel}`}
                                        className={`${styles.cell} ${onCellClick ? styles.clickable : ''}`}
                                        style={{
                                            backgroundColor: getColor(value),
                                            color: getTextColor(value),
                                        }}
                                        onClick={() => onCellClick?.({ x: xLabel, y: yLabel, value })}
                                        title={`${yLabel} - ${xLabel}: ${value}`}
                                    >
                                        {showValues && value > 0 && (
                                            <span className={styles.cellValue}>{value}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.xAxisLabels}>
                {xLabels.map((label) => (
                    <div key={label} className={styles.xLabel}>
                        {label}
                    </div>
                ))}
            </div>

            <div className={styles.legend}>
                <span className={styles.legendLabel}>Low</span>
                <div className={styles.legendGradient} />
                <span className={styles.legendLabel}>High</span>
            </div>
        </div>
    );
}

export default HeatmapChart;
