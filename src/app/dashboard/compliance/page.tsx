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
    calculatedAt: string;
}

interface KPIMetric {
    id: string;
    category: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    period: string;
}

interface Violation {
    id: string;
    timestamp: string;
    severity: string;
    policy: { name: string } | null;
    user: { name: string } | null;
}

export default function ComplianceDashboard() {
    const [riskPosture, setRiskPosture] = useState<RiskPosture | null>(null);
    const [kpis, setKpis] = useState<KPIMetric[]>([]);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [riskRes, kpiRes, violationsRes] = await Promise.all([
                    fetch('/api/risk-posture'),
                    fetch('/api/kpi'),
                    fetch('/api/violations?limit=10'),
                ]);
                const riskData = await riskRes.json();
                const kpiData = await kpiRes.json();
                const violationsData = await violationsRes.json();

                if (riskData.success && riskData.data.latest) {
                    setRiskPosture(riskData.data.latest);
                }
                if (kpiData.success) {
                    setKpis(kpiData.data.slice(0, 12));
                }
                if (violationsData.success) {
                    setViolations(violationsData.data.slice(0, 5));
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

    // Calculate compliance score (inverse of risk)
    const complianceScore = riskPosture ? 100 - riskPosture.complianceRisk : 85;

    // Group KPIs by category
    const kpiByCategory = kpis.reduce((acc, kpi) => {
        if (!acc[kpi.category]) acc[kpi.category] = [];
        acc[kpi.category].push(kpi);
        return acc;
    }, {} as Record<string, KPIMetric[]>);

    const categoryLabels: Record<string, string> = {
        DOCUMENT_SECURITY: 'Document Security',
        POLICY_COMPLIANCE: 'Policy Compliance',
        INCIDENT_RESPONSE: 'Incident Response',
        AUDIT_READINESS: 'Audit Readiness',
        ACCESS_CONTROL: 'Access Control',
        DATA_PROTECTION: 'Data Protection',
        RISK_MANAGEMENT: 'Risk Management',
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
                {/* Overall Compliance Score */}
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
                            <span className={styles.riskValue}>{riskPosture?.documentRisk || 30}%</span>
                        </div>
                        <div className={styles.riskCard}>
                            <span className={styles.riskLabel}>Digital Risk</span>
                            <div className={styles.riskBar}>
                                <div className={styles.riskFill} style={{ width: `${riskPosture?.digitalRisk || 45}%`, background: getComplianceColor(100 - (riskPosture?.digitalRisk || 45)) }}></div>
                            </div>
                            <span className={styles.riskValue}>{riskPosture?.digitalRisk || 45}%</span>
                        </div>
                        <div className={styles.riskCard}>
                            <span className={styles.riskLabel}>Compliance Risk</span>
                            <div className={styles.riskBar}>
                                <div className={styles.riskFill} style={{ width: `${riskPosture?.complianceRisk || 15}%`, background: getComplianceColor(100 - (riskPosture?.complianceRisk || 15)) }}></div>
                            </div>
                            <span className={styles.riskValue}>{riskPosture?.complianceRisk || 15}%</span>
                        </div>
                    </div>
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
                                        const percentage = (kpi.value / kpi.target) * 100;
                                        return (
                                            <div key={kpi.id} className={styles.kpiItem}>
                                                <div className={styles.kpiHeader}>
                                                    <span className={styles.kpiName}>{kpi.name}</span>
                                                    <StatusBadge status={getComplianceStatus(percentage)} label={`${Math.round(percentage)}%`} size="sm" />
                                                </div>
                                                <div className={styles.kpiValue}>
                                                    {kpi.value}{kpi.unit} / {kpi.target}{kpi.unit}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Recent Violations */}
                <section className={styles.violationsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>⚠️ Recent Compliance Events</h2>
                        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/violations'}>View All</Button>
                    </div>
                    <Card noPadding>
                        <div className={styles.violationsList}>
                            {violations.map((v) => (
                                <div key={v.id} className={styles.violationItem}>
                                    <div className={styles.violationTime}>{formatDate(v.timestamp)}</div>
                                    <div className={styles.violationInfo}>
                                        <span className={styles.violationPolicy}>{v.policy?.name || 'Unknown Policy'}</span>
                                        <span className={styles.violationUser}>by {v.user?.name || 'Unknown'}</span>
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

                {/* Audit Info */}
                <section className={styles.auditInfo}>
                    <div className={styles.auditIcon}>🔐</div>
                    <div className={styles.auditContent}>
                        <h4>Audit Trail Verification</h4>
                        <p>All compliance records are cryptographically signed and chain-linked for tamper-proof regulatory compliance evidence.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
