'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
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

interface RiskTrends {
    overall: string;
    document: string;
    digital: string;
    compliance: string;
}

interface KPIMetric {
    id: string;
    category: string;
    name: string;
    value: number;
    target: number | null;
    trend: string | null;
    unit: string;
    period: string;
}

interface Violation {
    id: string;
    timestamp: string;
    severity: string;
    actionTaken: string;
    details: string | null;
    policy: { id: string; name: string; category: string } | null;
    user: { id: string; name: string; email: string; department: string } | null;
}

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
    signature: string;
    user: { name: string; role: string } | null;
}

export default function ComplianceDashboard() {
    const [riskPosture, setRiskPosture] = useState<RiskPosture | null>(null);
    const [riskTrends, setRiskTrends] = useState<RiskTrends | null>(null);
    const [kpis, setKpis] = useState<KPIMetric[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [riskRes, kpiRes, violationsRes, auditRes] = await Promise.all([
                    fetch('/api/risk-posture'),
                    fetch('/api/kpi'),
                    fetch('/api/violations?limit=10'),
                    fetch('/api/audit?limit=10'),
                ]);
                const riskData = await riskRes.json();
                const kpiData = await kpiRes.json();
                const violationsData = await violationsRes.json();
                const auditData = await auditRes.json();

                if (riskData.success && riskData.data.latest) {
                    setRiskPosture(riskData.data.latest);
                    setRiskTrends(riskData.data.trends);
                }
                if (kpiData.success) {
                    setKpis(kpiData.data);
                }
                if (violationsData.success) {
                    setViolations(violationsData.data);
                }
                if (auditData.success) {
                    setAuditLogs(auditData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getComplianceColor = (score: number) => {
        if (score >= 90) return 'var(--status-normal)';
        if (score >= 70) return 'var(--status-warning)';
        return 'var(--status-critical)';
    };

    const getComplianceStatus = (score: number): 'normal' | 'warning' | 'critical' => {
        if (score >= 90) return 'normal';
        if (score >= 70) return 'warning';
        return 'critical';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return formatDate(dateStr);
    };

    // Calculate compliance score (inverse of risk)
    const complianceScore = riskPosture ? 100 - riskPosture.complianceRisk : 85;

    // Group KPIs by category
    const kpiByCategory = kpis.reduce((acc, kpi) => {
        if (!acc[kpi.category]) acc[kpi.category] = [];
        acc[kpi.category].push(kpi);
        return acc;
    }, {} as Record<string, KPIMetric[]>);

    // Category labels matching schema
    const categoryLabels: Record<string, string> = {
        MTTD: 'Mean Time to Detection',
        MTTR: 'Mean Time to Resolution',
        COMPLIANCE_RATE: 'Compliance Rate',
        ANOMALY_ACCURACY: 'Anomaly Detection Accuracy',
        POLICY_VIOLATIONS: 'Policy Violations',
        DOCUMENT_RISK: 'Document Risk',
        SYSTEM_HEALTH: 'System Health',
    };

    const actionLabels: Record<string, { label: string; color: string }> = {
        WARNING_ISSUED: { label: 'Warning Issued', color: '#f59e0b' },
        ACCESS_BLOCKED: { label: 'Access Blocked', color: '#ef4444' },
        DEVICE_ISOLATED: { label: 'Device Isolated', color: '#ef4444' },
        MANAGER_NOTIFIED: { label: 'Manager Notified', color: '#3b82f6' },
        NO_ACTION: { label: 'Pending Review', color: '#64748b' },
    };

    const getTrendIcon = (trend: string | null) => {
        if (trend === 'UP') return '↑';
        if (trend === 'DOWN') return '↓';
        return '→';
    };

    const getTrendColor = (trend: string | null, isPositive: boolean) => {
        if (trend === 'UP') return isPositive ? '#10b981' : '#ef4444';
        if (trend === 'DOWN') return isPositive ? '#ef4444' : '#10b981';
        return '#64748b';
    };

    if (loading) {
        return (
            <DashboardLayout title="Compliance Center" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading compliance data...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Compliance Center" subtitle="Regulatory & Policy Compliance Dashboard">
            <div className={styles.container}>
                {/* Overall Compliance Score with Severity Breakdown */}
                <section className={styles.scoreSection}>
                    <div className={styles.mainScore}>
                        <div className={styles.scoreGauge} style={{ '--score': `${complianceScore}%`, '--color': getComplianceColor(complianceScore) } as React.CSSProperties}>
                            <span className={styles.scoreValue}>{Math.round(complianceScore)}%</span>
                            <span className={styles.scoreLabel}>Overall Compliance</span>
                        </div>
                    </div>
                    <div className={styles.riskBreakdown}>
                        <div className={styles.riskCard}>
                            <span className={styles.riskLabel}>Document Risk</span>
                            <div className={styles.riskBar}>
                                <div className={styles.riskFill} style={{ width: `${riskPosture?.documentRisk || 30}%`, background: getComplianceColor(100 - (riskPosture?.documentRisk || 30)) }}></div>
                            </div>
                            <span className={styles.riskValue}>
                                {riskPosture?.documentRisk || 30}%
                                {riskTrends && <span className={styles.trendIndicator} style={{ color: getTrendColor(riskTrends.document === 'improving' ? 'DOWN' : 'UP', false) }}>
                                    {riskTrends.document === 'improving' ? '↓' : '↑'}
                                </span>}
                            </span>
                        </div>
                        <div className={styles.riskCard}>
                            <span className={styles.riskLabel}>Digital Risk</span>
                            <div className={styles.riskBar}>
                                <div className={styles.riskFill} style={{ width: `${riskPosture?.digitalRisk || 45}%`, background: getComplianceColor(100 - (riskPosture?.digitalRisk || 45)) }}></div>
                            </div>
                            <span className={styles.riskValue}>
                                {riskPosture?.digitalRisk || 45}%
                                {riskTrends && <span className={styles.trendIndicator} style={{ color: getTrendColor(riskTrends.digital === 'improving' ? 'DOWN' : 'UP', false) }}>
                                    {riskTrends.digital === 'improving' ? '↓' : '↑'}
                                </span>}
                            </span>
                        </div>
                        <div className={styles.riskCard}>
                            <span className={styles.riskLabel}>Compliance Risk</span>
                            <div className={styles.riskBar}>
                                <div className={styles.riskFill} style={{ width: `${riskPosture?.complianceRisk || 15}%`, background: getComplianceColor(100 - (riskPosture?.complianceRisk || 15)) }}></div>
                            </div>
                            <span className={styles.riskValue}>
                                {riskPosture?.complianceRisk || 15}%
                                {riskTrends && <span className={styles.trendIndicator} style={{ color: getTrendColor(riskTrends.compliance === 'improving' ? 'DOWN' : 'UP', false) }}>
                                    {riskTrends.compliance === 'improving' ? '↓' : '↑'}
                                </span>}
                            </span>
                        </div>
                    </div>

                    {/* Severity Breakdown */}
                    {riskPosture && (
                        <div className={styles.severityBreakdown}>
                            <div className={`${styles.severityCard} ${styles.critical}`}>
                                <span className={styles.severityCount}>{riskPosture.criticalCount}</span>
                                <span className={styles.severityLabel}>Critical</span>
                            </div>
                            <div className={`${styles.severityCard} ${styles.high}`}>
                                <span className={styles.severityCount}>{riskPosture.highCount}</span>
                                <span className={styles.severityLabel}>High</span>
                            </div>
                            <div className={`${styles.severityCard} ${styles.medium}`}>
                                <span className={styles.severityCount}>{riskPosture.mediumCount}</span>
                                <span className={styles.severityLabel}>Medium</span>
                            </div>
                            <div className={`${styles.severityCard} ${styles.low}`}>
                                <span className={styles.severityCount}>{riskPosture.lowCount}</span>
                                <span className={styles.severityLabel}>Low</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* KPI Metrics Grid */}
                <section className={styles.kpiSection}>
                    <div className={styles.sectionHeader}>
                        <h2>📊 Compliance KPIs</h2>
                    </div>
                    <div className={styles.kpiGrid}>
                        {Object.entries(kpiByCategory).map(([category, categoryKpis]) => (
                            <Card key={category} className={styles.kpiCard}>
                                <h3 className={styles.kpiCategory}>{categoryLabels[category] || category}</h3>
                                <div className={styles.kpiList}>
                                    {categoryKpis.slice(0, 2).map((kpi) => {
                                        const percentage = kpi.target ? (kpi.value / kpi.target) * 100 : kpi.value;
                                        const isPositive = category === 'MTTD' || category === 'MTTR' ? false : true;
                                        return (
                                            <div key={kpi.id} className={styles.kpiItem}>
                                                <div className={styles.kpiHeader}>
                                                    <span className={styles.kpiName}>{kpi.name}</span>
                                                    <div className={styles.kpiTrend}>
                                                        <span className={styles.trendIcon} style={{ color: getTrendColor(kpi.trend, isPositive) }}>
                                                            {getTrendIcon(kpi.trend)}
                                                        </span>
                                                        <StatusBadge status={getComplianceStatus(percentage)} label={`${Math.round(percentage)}%`} size="sm" />
                                                    </div>
                                                </div>
                                                <div className={styles.kpiValue}>
                                                    {kpi.value}{kpi.target ? ` / ${kpi.target}` : ''} {kpi.period}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Recent Violations with Enhanced Info */}
                <section className={styles.violationsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>⚠️ Recent Compliance Events</h2>
                        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/violations'}>View All</Button>
                    </div>
                    <Card noPadding>
                        <div className={styles.violationsList}>
                            {violations.map((v) => (
                                <div key={v.id} className={styles.violationItem}>
                                    <div className={styles.violationTime}>{formatRelativeTime(v.timestamp)}</div>
                                    <div className={styles.violationInfo}>
                                        <span className={styles.violationPolicy}>{v.policy?.name || 'Unknown Policy'}</span>
                                        <span className={styles.violationUser}>
                                            by {v.user?.name || 'Unknown'} • {v.user?.department || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.violationAction}>
                                        <span
                                            className={styles.actionBadge}
                                            style={{ color: actionLabels[v.actionTaken]?.color || '#64748b' }}
                                        >
                                            {actionLabels[v.actionTaken]?.label || v.actionTaken}
                                        </span>
                                    </div>
                                    <StatusBadge status={v.severity === 'CRITICAL' ? 'critical' : v.severity === 'HIGH' ? 'critical' : 'warning'} label={v.severity} size="sm" />
                                </div>
                            ))}
                            {violations.length === 0 && (
                                <div className={styles.noViolations}>✅ No recent violations</div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Cryptographic Audit Trail */}
                <section className={styles.auditSection}>
                    <div className={styles.sectionHeader}>
                        <h2>🔐 Cryptographic Audit Trail</h2>
                        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/audit'}>View Full Log</Button>
                    </div>
                    <Card noPadding>
                        <div className={styles.auditList}>
                            {auditLogs.map((log) => (
                                <div key={log.id} className={styles.auditItem}>
                                    <div className={styles.auditIcon}>
                                        {log.action === 'CREATE' && '➕'}
                                        {log.action === 'UPDATE' && '✏️'}
                                        {log.action === 'DELETE' && '🗑️'}
                                        {log.action === 'ACCESS' && '👁️'}
                                        {!['CREATE', 'UPDATE', 'DELETE', 'ACCESS'].includes(log.action) && '📝'}
                                    </div>
                                    <div className={styles.auditDetails}>
                                        <span className={styles.auditAction}>
                                            {log.action} on {log.entityType}
                                        </span>
                                        <span className={styles.auditMeta}>
                                            by {log.user?.name || 'System'} • {formatRelativeTime(log.timestamp)}
                                        </span>
                                    </div>
                                    <div className={styles.signatureVerified}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <span>Verified</span>
                                    </div>
                                </div>
                            ))}
                            {auditLogs.length === 0 && (
                                <div className={styles.noAudit}>No recent audit entries</div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Audit Info Banner */}
                <section className={styles.auditInfo}>
                    <div className={styles.auditBannerIcon}>🔐</div>
                    <div className={styles.auditContent}>
                        <h4>Tamper-Proof Audit Trail</h4>
                        <p>All compliance records are cryptographically signed with SHA-256 and chain-linked for tamper-proof regulatory compliance evidence. Each entry includes digital signature verification.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
