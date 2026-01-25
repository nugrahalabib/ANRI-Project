'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge } from '@/components/ui';
import styles from './page.module.css';

interface Incident {
    id: string;
    alertType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE' | 'ESCALATED';
    riskScore: number;
    explanation: string;
    createdAt: string;
    document: { title: string; rfidTag: string } | null;
}

const severityColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

const statusLabels: Record<string, string> = {
    OPEN: 'Open',
    INVESTIGATING: 'In Progress',
    RESOLVED: 'Closed',
    FALSE_POSITIVE: 'Dismissed',
    ESCALATED: 'Escalated',
};

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchIncidents();
    }, [filter]);

    const fetchIncidents = async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            params.append('limit', '100');

            const res = await fetch(`/api/alerts?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setIncidents(data.data);
            }
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stats = {
        total: incidents.length,
        open: incidents.filter(i => i.status === 'OPEN').length,
        investigating: incidents.filter(i => i.status === 'INVESTIGATING').length,
        resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    };

    return (
        <DashboardLayout title="Incident Management" subtitle="Security Incident Tracking & Response">
            <div className={styles.container}>
                {/* Stats */}
                <div className={styles.statsRow}>
                    <Card className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Total Incidents</div>
                    </Card>
                    <Card className={`${styles.statCard} ${styles.open}`}>
                        <div className={styles.statValue}>{stats.open}</div>
                        <div className={styles.statLabel}>Open</div>
                    </Card>
                    <Card className={`${styles.statCard} ${styles.investigating}`}>
                        <div className={styles.statValue}>{stats.investigating}</div>
                        <div className={styles.statLabel}>Investigating</div>
                    </Card>
                    <Card className={`${styles.statCard} ${styles.resolved}`}>
                        <div className={styles.statValue}>{stats.resolved}</div>
                        <div className={styles.statLabel}>Resolved</div>
                    </Card>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="ESCALATED">Escalated</option>
                    </select>
                </div>

                {/* Incidents Table */}
                <Card noPadding>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Incident ID</th>
                                <th>Type</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Risk Score</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className={styles.loading}>Loading incidents...</td></tr>
                            ) : incidents.length === 0 ? (
                                <tr><td colSpan={7} className={styles.empty}>No incidents found.</td></tr>
                            ) : (
                                incidents.map(incident => (
                                    <tr key={incident.id}>
                                        <td className={styles.mono}>INC-{incident.id.slice(0, 8)}</td>
                                        <td>{incident.alertType.replace(/_/g, ' ')}</td>
                                        <td>
                                            <StatusBadge
                                                status={severityColors[incident.severity]}
                                                label={incident.severity}
                                            />
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[incident.status.toLowerCase()]}`}>
                                                {statusLabels[incident.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.riskBar}>
                                                <div
                                                    className={styles.riskFill}
                                                    style={{
                                                        width: `${incident.riskScore * 100}%`,
                                                        background: incident.riskScore > 0.7 ? '#ef4444' : '#eab308'
                                                    }}
                                                />
                                                <span>{Math.round(incident.riskScore * 100)}%</span>
                                            </div>
                                        </td>
                                        <td className={styles.date}>{formatDate(incident.createdAt)}</td>
                                        <td>
                                            <Link href={`/incidents/${incident.id}`} className={styles.viewLink}>
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </DashboardLayout>
    );
}
