'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import styles from './page.module.css';

interface UserBehavior {
    userId: string;
    name: string;
    department: string;
    totalRequests: number;
    blockedRequests: number;
    riskScore: number;
    topCategories: { category: string; count: number }[];
    anomalyCount: number;
    lastActivity: string;
}

interface TrendData {
    hour: number;
    requests: number;
    blocked: number;
}

export default function BehavioralAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [userBehaviors, setUserBehaviors] = useState<UserBehavior[]>([]);
    const [hourlyTrend, setHourlyTrend] = useState<TrendData[]>([]);
    const [topBlockedDomains, setTopBlockedDomains] = useState<{ domain: string; count: number }[]>([]);

    useEffect(() => {
        // Simulate loading behavioral data
        setTimeout(() => {
            setUserBehaviors(generateMockUserBehaviors());
            setHourlyTrend(generateHourlyTrend());
            setTopBlockedDomains(generateTopBlocked());
            setLoading(false);
        }, 500);
    }, [timeRange]);

    function generateMockUserBehaviors(): UserBehavior[] {
        const users = [
            { id: '1', name: 'Budi Santoso', dept: 'IT' },
            { id: '2', name: 'Siti Rahayu', dept: 'HR' },
            { id: '3', name: 'Ahmad Wijaya', dept: 'Finance' },
            { id: '4', name: 'Dewi Lestari', dept: 'Archives' },
            { id: '5', name: 'Rudi Hermawan', dept: 'Security' },
            { id: '6', name: 'Maya Putri', dept: 'IT' },
            { id: '7', name: 'Eko Prasetyo', dept: 'Operations' },
        ];

        return users.map(u => ({
            userId: u.id,
            name: u.name,
            department: u.dept,
            totalRequests: Math.floor(Math.random() * 500) + 100,
            blockedRequests: Math.floor(Math.random() * 20),
            riskScore: Math.floor(Math.random() * 100),
            topCategories: [
                { category: 'WORK', count: Math.floor(Math.random() * 200) + 50 },
                { category: 'SOCIAL_MEDIA', count: Math.floor(Math.random() * 50) },
                { category: 'NEWS', count: Math.floor(Math.random() * 30) },
            ],
            anomalyCount: Math.floor(Math.random() * 5),
            lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        })).sort((a, b) => b.riskScore - a.riskScore);
    }

    function generateHourlyTrend(): TrendData[] {
        return Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            requests: Math.floor(Math.random() * 100) + (i >= 8 && i <= 17 ? 200 : 20),
            blocked: Math.floor(Math.random() * 10) + (i >= 8 && i <= 17 ? 5 : 0),
        }));
    }

    function generateTopBlocked(): { domain: string; count: number }[] {
        return [
            { domain: 'facebook.com', count: 45 },
            { domain: 'youtube.com', count: 38 },
            { domain: 'instagram.com', count: 32 },
            { domain: 'tiktok.com', count: 28 },
            { domain: 'twitter.com', count: 21 },
            { domain: 'gambling-site.com', count: 15 },
            { domain: 'streaming-illegal.xyz', count: 8 },
        ];
    }

    const getRiskColor = (score: number) => {
        if (score >= 70) return '#ef4444';
        if (score >= 40) return '#fbbf24';
        return '#4ade80';
    };

    const getRiskLabel = (score: number) => {
        if (score >= 70) return 'High Risk';
        if (score >= 40) return 'Medium';
        return 'Low Risk';
    };

    const stats = {
        totalUsers: userBehaviors.length,
        highRisk: userBehaviors.filter(u => u.riskScore >= 70).length,
        anomalies: userBehaviors.reduce((sum, u) => sum + u.anomalyCount, 0),
        blockedTotal: userBehaviors.reduce((sum, u) => sum + u.blockedRequests, 0),
    };

    if (loading) {
        return (
            <DashboardLayout title="Behavioral Analytics" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Analyzing user behavior patterns...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Behavioral Analytics"
            subtitle="AI-Powered Internet Usage Pattern Analysis"
            actions={
                <div className={styles.timeFilter}>
                    {['24h', '7d', '30d'].map(t => (
                        <button
                            key={t}
                            className={`${styles.timeBtn} ${timeRange === t ? styles.active : ''}`}
                            onClick={() => setTimeRange(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            }
        >
            <div className={styles.container}>
                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.totalUsers}</span>
                        <span className={styles.statLabel}>Monitored Users</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.danger}`}>
                        <span className={styles.statValue}>{stats.highRisk}</span>
                        <span className={styles.statLabel}>High Risk Users</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <span className={styles.statValue}>{stats.anomalies}</span>
                        <span className={styles.statLabel}>Anomalies Detected</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.blockedTotal}</span>
                        <span className={styles.statLabel}>Blocked Requests</span>
                    </div>
                </section>

                {/* Charts Row */}
                <section className={styles.chartsRow}>
                    {/* Hourly Activity Pattern */}
                    <Card className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3>📊 Hourly Activity Pattern</h3>
                            <span className={styles.chartHint}>Shows request distribution across 24 hours</span>
                        </div>
                        <div className={styles.hourlyChart}>
                            {hourlyTrend.map((h, idx) => {
                                const maxRequests = Math.max(...hourlyTrend.map(t => t.requests));
                                const height = (h.requests / maxRequests) * 100;
                                const blockedHeight = (h.blocked / maxRequests) * 100;

                                return (
                                    <div key={idx} className={styles.hourBar}>
                                        <div className={styles.barStack}>
                                            <div
                                                className={styles.barBlocked}
                                                style={{ height: `${blockedHeight}%` }}
                                                title={`${h.blocked} blocked`}
                                            />
                                            <div
                                                className={styles.barNormal}
                                                style={{ height: `${height - blockedHeight}%` }}
                                                title={`${h.requests} total`}
                                            />
                                        </div>
                                        <span className={styles.hourLabel}>
                                            {h.hour.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.chartLegend}>
                            <span><span className={styles.legendDot} style={{ background: '#3b82f6' }} /> Normal</span>
                            <span><span className={styles.legendDot} style={{ background: '#ef4444' }} /> Blocked</span>
                        </div>
                    </Card>

                    {/* Top Blocked Domains */}
                    <Card className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3>🚫 Top Blocked Domains</h3>
                            <span className={styles.chartHint}>Most frequently blocked sites</span>
                        </div>
                        <div className={styles.blockedList}>
                            {topBlockedDomains.map((d, idx) => (
                                <div key={d.domain} className={styles.blockedItem}>
                                    <span className={styles.blockedRank}>#{idx + 1}</span>
                                    <span className={styles.blockedDomain}>{d.domain}</span>
                                    <div className={styles.blockedBar}>
                                        <div
                                            className={styles.blockedProgress}
                                            style={{ width: `${(d.count / topBlockedDomains[0].count) * 100}%` }}
                                        />
                                    </div>
                                    <span className={styles.blockedCount}>{d.count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* User Risk Table */}
                <Card className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h3>👤 User Risk Assessment</h3>
                        <span className={styles.tableHint}>Sorted by risk score (AI-calculated)</span>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Department</th>
                                    <th>Risk Score</th>
                                    <th>Total Requests</th>
                                    <th>Blocked</th>
                                    <th>Anomalies</th>
                                    <th>Top Category</th>
                                    <th>Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userBehaviors.map(user => (
                                    <tr key={user.userId} className={user.riskScore >= 70 ? styles.highRiskRow : ''}>
                                        <td className={styles.userName}>{user.name}</td>
                                        <td>{user.department}</td>
                                        <td>
                                            <div className={styles.riskCell}>
                                                <div className={styles.riskBar}>
                                                    <div
                                                        className={styles.riskProgress}
                                                        style={{
                                                            width: `${user.riskScore}%`,
                                                            background: getRiskColor(user.riskScore)
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ color: getRiskColor(user.riskScore) }}>
                                                    {user.riskScore}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{user.totalRequests}</td>
                                        <td className={user.blockedRequests > 10 ? styles.highBlocked : ''}>
                                            {user.blockedRequests}
                                        </td>
                                        <td>
                                            {user.anomalyCount > 0 && (
                                                <span className={styles.anomalyBadge}>
                                                    ⚠️ {user.anomalyCount}
                                                </span>
                                            )}
                                            {user.anomalyCount === 0 && <span className={styles.noAnomaly}>-</span>}
                                        </td>
                                        <td>{user.topCategories[0]?.category || '-'}</td>
                                        <td className={styles.timeCell}>
                                            {new Date(user.lastActivity).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* AI Insights */}
                <Card className={styles.insightsCard}>
                    <div className={styles.insightsHeader}>
                        <h3>🤖 AI Behavioral Insights</h3>
                    </div>
                    <div className={styles.insightsGrid}>
                        <div className={styles.insightItem}>
                            <span className={styles.insightIcon}>📈</span>
                            <div className={styles.insightContent}>
                                <h4>Peak Activity Pattern</h4>
                                <p>Highest internet usage detected between <strong>09:00-11:00</strong> and <strong>14:00-16:00</strong>. This aligns with normal work patterns.</p>
                            </div>
                        </div>
                        <div className={styles.insightItem}>
                            <span className={styles.insightIcon}>⚠️</span>
                            <div className={styles.insightContent}>
                                <h4>Anomaly Alert</h4>
                                <p><strong>{stats.highRisk} users</strong> showing higher than baseline social media access. Recommend policy review for these individuals.</p>
                            </div>
                        </div>
                        <div className={styles.insightItem}>
                            <span className={styles.insightIcon}>🔒</span>
                            <div className={styles.insightContent}>
                                <h4>Security Recommendation</h4>
                                <p>Consider blocking <strong>gambling-site.com</strong> at DNS level. Multiple access attempts detected from different users.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
