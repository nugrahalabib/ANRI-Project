'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './TimelineChart.module.css';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface TimelineDataPoint {
    x: Date | string | number;
    y: number;
}

export interface TimelineChartProps {
    title?: string;
    data: TimelineDataPoint[];
    color?: string;
    showArea?: boolean;
    height?: number;
    yAxisLabel?: string;
}

export function TimelineChart({
    title,
    data,
    color = '#3d7ab8',
    showArea = true,
    height = 300,
    yAxisLabel,
}: TimelineChartProps) {
    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            zoom: {
                enabled: true,
            },
            animations: {
                enabled: true,
                speed: 800,
            },
            background: 'transparent',
            foreColor: '#9ca3af',
        },
        colors: [color],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: showArea ? 'gradient' : 'solid',
            gradient: {
                shadeIntensity: 1,
                type: 'vertical',
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100],
            },
        },
        grid: {
            borderColor: '#1c3a5e',
            strokeDashArray: 4,
            xaxis: {
                lines: { show: false },
            },
            yaxis: {
                lines: { show: true },
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px',
                },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM 'yy",
                    day: 'dd MMM',
                    hour: 'HH:mm',
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            title: {
                text: yAxisLabel,
                style: {
                    color: '#6b7280',
                    fontSize: '12px',
                },
            },
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px',
                },
            },
        },
        tooltip: {
            theme: 'dark',
            x: {
                format: 'dd MMM yyyy HH:mm',
            },
            style: {
                fontSize: '12px',
            },
        },
        markers: {
            size: 0,
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
    };

    const series = [
        {
            name: title || 'Value',
            data: data.map((d) => ({
                x: d.x instanceof Date ? d.x.getTime() : d.x,
                y: d.y,
            })),
        },
    ];

    return (
        <div className={styles.container}>
            {title && <h3 className={styles.title}>{title}</h3>}
            <div className={styles.chart}>
                <Chart type="area" options={options} series={series} height={height} />
            </div>
        </div>
    );
}

export default TimelineChart;
