'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts';
import { KPICard } from '@/components/dashboard';
import { Card, Button, StatusBadge } from '@/components/ui';
import styles from './page.module.css';

interface RiskPosture {
    overallScore: number;
    documentRisk: number;
    digitalRisk: number;
    complianceRisk: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    calculatedAt: string;
}

interface Violation {
    id: string;
    timestamp: string;
    severity: string;
    actionTaken: string;
    policy: { id: string; name: string; category: string } | null;
    user: { id: string; name: string; department: string } | null;
}

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    timestamp: string;
    user: { name: string } | null;
}

// Compliance regulations
const regulations = [
    { id: '1', name: 'Undang-Undang Kearsipan', code: 'UU No. 43/2009', status: 'compliant' },
    { id: '2', name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres 95/2018', status: 'action' },
    { id: '3', name: 'Information Security Management', code: 'ISO 27001', status: 'compliant' },
    { id: '4', name: 'Manajemen Risiko Instansi', code: 'PP 60/2008', status: 'compliant' },
    { id: '5', name: 'Pengamanan Informasi Pemerintah', code: 'Permen 59/2020', status: 'action' },
];

export default function ComplianceDashboard() {
    const [riskPosture, setRiskPosture] = useState<RiskPosture | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [riskRes, violationsRes, auditRes] = await Promise.all([
                    fetch('/api/risk-posture'),
                    fetch('/api/violations?limit=10'),
                    fetch('/api/audit?limit=5'),
                ]);
                const riskData = await riskRes.json();
                const violationsData = await violationsRes.json();
                const auditData = await auditRes.json();

                if (riskData.success && riskData.data.latest) {
                    setRiskPosture(riskData.data.latest);
                }
                if (violationsData.success) {
                    setViolations(violationsData.data);
                }
                if (auditData.success) {
                    setAuditLogs(auditData.data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} menit yang lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${Math.floor(hours / 24)} hari yang lalu`;
    };

    if (loading) {
        return (
            <DashboardLayout title="Compliance Center" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading compliance data...</div>
                </div>
            </DashboardLayout>
        );
    }

    // KPI Data matching Executive style
    const complianceIndex = riskPosture ? Math.round(100 - riskPosture.complianceRisk) : 88;
    const openFindings = riskPosture ? (riskPosture.criticalCount + riskPosture.highCount) : 5;
    const policyAck = 96;
    const auditReadiness = 94;
    const regulationsCovered = 87;
    const lastAuditDays = 12;

    const kpiData = {
        complianceIndex: {
            value: complianceIndex,
            unit: '%',
            trend: { direction: 'up' as const, value: '2%', period: 'vs last month' },
            description: 'Regulatory Compliance Index',
            sparkline: [82, 84, 85, 86, 87, 88, complianceIndex],
        },
        openFindings: {
            value: openFindings,
            unit: '',
            trend: { direction: 'down' as const, value: '3', period: 'vs last month' },
            description: 'Open Audit Findings',
            sparkline: [12, 10, 9, 8, 7, 6, openFindings],
        },
        policyAck: {
            value: policyAck,
            unit: '%',
            trend: { direction: 'up' as const, value: '4%', period: 'vs last month' },
            description: 'Staff Policy Acknowledgment',
            sparkline: [88, 90, 91, 93, 94, 95, policyAck],
        },
        auditReadiness: {
            value: auditReadiness,
            unit: '%',
            trend: { direction: 'up' as const, value: '3%', period: 'vs last month' },
            description: 'External Audit Readiness',
            sparkline: [85, 87, 89, 91, 92, 93, auditReadiness],
        },
        regulationsCovered: {
            value: regulationsCovered,
            unit: '%',
            trend: { direction: 'stable' as const, value: '0%', period: 'no change' },
            description: 'Regulations Fully Covered',
            sparkline: [85, 85, 86, 86, 87, 87, regulationsCovered],
        },
        lastAudit: {
            value: lastAuditDays,
            unit: 'days',
            trend: { direction: 'stable' as const, value: '', period: 'since last audit' },
            description: 'Days Since Last Audit',
            sparkline: [30, 25, 20, 18, 15, 13, lastAuditDays],
        },
    };

    // Pending actions from violations
    const pendingActions = violations.slice(0, 4).map(v => {
        const hoursAgo = Math.floor((Date.now() - new Date(v.timestamp).getTime()) / 3600000);
        return {
            id: v.id,
            title: v.policy?.name || 'Policy Review Required',
            department: v.user?.department || 'IT',
            dueText: hoursAgo > 24 ? 'Overdue' : 'Due: Today',
            isOverdue: hoursAgo > 24,
            severity: v.severity,
        };
    });

    return (
        <DashboardLayout title="Compliance Center" subtitle="Regulatory Compliance & Audit Dashboard">
            <div className={styles.container}>
                {/* KPI Cards Row - 3 Column Grid like Executive */}
                <section className={styles.kpiGrid}>
                    <KPICard
                        title="Compliance"
                        value={kpiData.complianceIndex.value}
                        unit={kpiData.complianceIndex.unit}
                        description={kpiData.complianceIndex.description}
                        trend={kpiData.complianceIndex.trend}
                        status="normal"
                        sparkline={kpiData.complianceIndex.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>}
                    />
                    <KPICard
                        title="Open Findings"
                        value={kpiData.openFindings.value}
                        description={kpiData.openFindings.description}
                        trend={kpiData.openFindings.trend}
                        status={openFindings > 10 ? 'critical' : openFindings > 5 ? 'warning' : 'normal'}
                        sparkline={kpiData.openFindings.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                    />
                    <KPICard
                        title="Policy Ack"
                        value={kpiData.policyAck.value}
                        unit={kpiData.policyAck.unit}
                        description={kpiData.policyAck.description}
                        trend={kpiData.policyAck.trend}
                        status="normal"
                        sparkline={kpiData.policyAck.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><polyline points="9 15 11 17 15 13" /></svg>}
                    />
                    <KPICard
                        title="Audit Ready"
                        value={kpiData.auditReadiness.value}
                        unit={kpiData.auditReadiness.unit}
                        description={kpiData.auditReadiness.description}
                        trend={kpiData.auditReadiness.trend}
                        status="normal"
                        sparkline={kpiData.auditReadiness.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                    />
                    <KPICard
                        title="Regulations"
                        value={kpiData.regulationsCovered.value}
                        unit={kpiData.regulationsCovered.unit}
                        description={kpiData.regulationsCovered.description}
                        trend={kpiData.regulationsCovered.trend}
                        status="normal"
                        sparkline={kpiData.regulationsCovered.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>}
                    />
                    <KPICard
                        title="Last Audit"
                        value={kpiData.lastAudit.value}
                        unit={kpiData.lastAudit.unit}
                        description={kpiData.lastAudit.description}
                        trend={kpiData.lastAudit.trend}
                        status="normal"
                        sparkline={kpiData.lastAudit.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                    />
                </section>

                {/* Main Grid - Like Executive Layout */}
                <section className={styles.mainGrid}>
                    {/* Regulatory List Card */}
                    <Card header="Regulatory Framework">
                        <div className={styles.regulationsList}>
                            {regulations.map((reg) => (
                                <div key={reg.id} className={styles.regulationItem}>
                                    <div className={styles.regulationInfo}>
                                        <span className={styles.regulationName}>{reg.name}</span>
                                        <span className={styles.regulationCode}>{reg.code}</span>
                                    </div>
                                    <StatusBadge
                                        status={reg.status === 'compliant' ? 'normal' : 'warning'}
                                        label={reg.status === 'compliant' ? 'Compliant' : 'Action Required'}
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Pending Actions Card */}
                    <Card header="Pending Actions">
                        <div className={styles.actionsList}>
                            {pendingActions.length === 0 ? (
                                <div className={styles.noActions}>✅ All actions completed</div>
                            ) : (
                                pendingActions.map((action) => (
                                    <div key={action.id} className={styles.actionItem}>
                                        <div className={styles.actionHeader}>
                                            <span className={`${styles.actionDot} ${action.isOverdue ? styles.overdue : styles.warning}`} />
                                            <span className={styles.actionDue}>{action.dueText}</span>
                                        </div>
                                        <div className={styles.actionContent}>
                                            <span className={styles.actionTitle}>{action.title}</span>
                                            <span className={styles.actionDept}>{action.department}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className={styles.actionsFooter}>
                            <Link href="/violations">
                                <Button variant="secondary" size="sm">View All Actions →</Button>
                            </Link>
                        </div>
                    </Card>
                </section>

                {/* Recent Audit Activity */}
                <section className={styles.auditSection}>
                    <Card header="Recent Audit Activity">
                        <div className={styles.auditList}>
                            {auditLogs.length === 0 ? (
                                <div className={styles.noAudit}>No recent audit activity</div>
                            ) : (
                                auditLogs.map((log) => (
                                    <div key={log.id} className={styles.auditItem}>
                                        <div className={styles.auditHeader}>
                                            <StatusBadge status="normal" label={log.action} />
                                            <span className={styles.auditTime}>{formatTimeAgo(log.timestamp)}</span>
                                        </div>
                                        <div className={styles.auditContent}>
                                            <span className={styles.auditEntity}>{log.entityType}</span>
                                            <span className={styles.auditUser}>by {log.user?.name || 'System'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </section>

                {/* Info Banner - Like XAI Banner in Executive */}
                <section className={styles.infoBanner}>
                    <div className={styles.infoIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                    </div>
                    <div className={styles.infoContent}>
                        <h4>Audit Trail Integrity</h4>
                        <p>All compliance records are cryptographically signed and chain-linked for tamper-proof regulatory evidence. Each entry includes digital signature verification for external auditors.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
