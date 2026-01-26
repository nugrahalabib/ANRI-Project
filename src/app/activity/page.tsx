'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Activity {
    id: string;
    timestamp: string;
    userId: string;
    user: { id: string; name: string; department: string } | null;
    url: string;
    domain: string;
    category: string;
    action: 'ALLOW' | 'BLOCK' | 'WARN';
    policyId: string | null;
    policy: { id: string; name: string } | null;
    ipAddress: string;
    bytes: number;
    duration: number;
}

const categoryIcons: Record<string, string> = {
    'SOCIAL_MEDIA': '📱',
    'STREAMING': '🎬',
    'NEWS': '📰',
    'WORK': '💼',
    'GAMBLING': '🎰',
    'ADULT': '🔞',
    'MALWARE': '☠️',
    'UNKNOWN': '❓',
};

const actionColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    BLOCK: 'critical',
    WARN: 'warning',
    ALLOW: 'normal',
};

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: 'all', category: 'all', search: '' });
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchActivities = useCallback(async () => {
        try {
            // Since we don't have a real activity API yet, we'll generate mock data
            // In production, this would fetch from /api/activity
            const mockActivities: Activity[] = generateMockActivities();
            setActivities(mockActivities);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchActivities, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [autoRefresh, fetchActivities]);

    // Mock data generator (replace with real API in production)
    function generateMockActivities(): Activity[] {
        const users = [
            { id: '1', name: 'Budi Santoso', department: 'IT' },
            { id: '2', name: 'Siti Rahayu', department: 'HR' },
            { id: '3', name: 'Ahmad Wijaya', department: 'Finance' },
            { id: '4', name: 'Dewi Lestari', department: 'Archives' },
            { id: '5', name: 'Rudi Hermawan', department: 'Security' },
        ];

        const sites = [
            { url: 'https://mail.google.com/inbox', domain: 'mail.google.com', category: 'WORK', action: 'ALLOW' as const },
            { url: 'https://docs.google.com/document', domain: 'docs.google.com', category: 'WORK', action: 'ALLOW' as const },
            { url: 'https://facebook.com/feed', domain: 'facebook.com', category: 'SOCIAL_MEDIA', action: 'WARN' as const },
            { url: 'https://youtube.com/watch', domain: 'youtube.com', category: 'STREAMING', action: 'WARN' as const },
            { url: 'https://judionline.com', domain: 'judionline.com', category: 'GAMBLING', action: 'BLOCK' as const },
            { url: 'https://kompas.com/news', domain: 'kompas.com', category: 'NEWS', action: 'ALLOW' as const },
            { url: 'https://detik.com/hot', domain: 'detik.com', category: 'NEWS', action: 'ALLOW' as const },
            { url: 'https://twitter.com/home', domain: 'twitter.com', category: 'SOCIAL_MEDIA', action: 'WARN' as const },
            { url: 'https://malware-site.xyz', domain: 'malware-site.xyz', category: 'MALWARE', action: 'BLOCK' as const },
            { url: 'https://slack.com/messages', domain: 'slack.com', category: 'WORK', action: 'ALLOW' as const },
        ];

        const policies: Record<string, { id: string; name: string } | null> = {
            BLOCK: { id: 'p1', name: 'Block Prohibited Sites' },
            WARN: { id: 'p2', name: 'Social Media Warning' },
            ALLOW: null,
        };

        return Array.from({ length: 50 }, (_, i) => {
            const user = users[Math.floor(Math.random() * users.length)];
            const site = sites[Math.floor(Math.random() * sites.length)];
            const timestamp = new Date(Date.now() - Math.random() * 3600000 * 2); // Last 2 hours

            return {
                id: `act-${i}`,
                timestamp: timestamp.toISOString(),
                userId: user.id,
                user,
                url: site.url,
                domain: site.domain,
                category: site.category,
                action: site.action,
                policyId: policies[site.action]?.id || null,
                policy: policies[site.action],
                ipAddress: `192.168.1.${100 + Math.floor(Math.random() * 50)}`,
                bytes: Math.floor(Math.random() * 500000),
                duration: Math.floor(Math.random() * 300),
            };
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    const filteredActivities = activities.filter(a => {
        if (filter.action !== 'all' && a.action !== filter.action) return false;
        if (filter.category !== 'all' && a.category !== filter.category) return false;
        if (filter.search && !a.domain.toLowerCase().includes(filter.search.toLowerCase()) &&
            !a.user?.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: activities.length,
        allowed: activities.filter(a => a.action === 'ALLOW').length,
        warned: activities.filter(a => a.action === 'WARN').length,
        blocked: activities.filter(a => a.action === 'BLOCK').length,
    };

    const categories = [...new Set(activities.map(a => a.category))];

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return (
            <DashboardLayout title="Activity Monitor" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Connecting to network gateway...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Real-Time Activity Monitor"
            subtitle="Internet Usage & Policy Enforcement"
            actions={
                <div className={styles.headerActions}>
                    <span className={`${styles.liveIndicator} ${autoRefresh ? styles.active : ''}`}>
                        {autoRefresh ? '🔴 LIVE' : '⏸️ PAUSED'}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                        {autoRefresh ? 'Pause' : 'Resume'}
                    </Button>
                </div>
            }
        >
            <div className={styles.container}>
                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Requests</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.allowed}`}>
                        <span className={styles.statValue}>{stats.allowed}</span>
                        <span className={styles.statLabel}>Allowed</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.warned}`}>
                        <span className={styles.statValue}>{stats.warned}</span>
                        <span className={styles.statLabel}>Warned</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.blocked}`}>
                        <span className={styles.statValue}>{stats.blocked}</span>
                        <span className={styles.statLabel}>Blocked</span>
                    </div>
                </section>

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search domain or user..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={filter.action} onChange={(e) => setFilter({ ...filter, action: e.target.value })}>
                            <option value="all">All Actions</option>
                            <option value="ALLOW">Allowed</option>
                            <option value="WARN">Warned</option>
                            <option value="BLOCK">Blocked</option>
                        </select>
                        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{categoryIcons[c] || '❓'} {c.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.updateInfo}>
                        Last update: {lastUpdate.toLocaleTimeString('id-ID')}
                    </div>
                </section>

                {/* Activity Feed */}
                <Card noPadding className={styles.feedCard}>
                    <div className={styles.feedHeader}>
                        <h3>Network Activity Feed</h3>
                        <span className={styles.feedCount}>{filteredActivities.length} requests</span>
                    </div>
                    <div className={styles.feedList}>
                        {filteredActivities.slice(0, 50).map((activity) => (
                            <div
                                key={activity.id}
                                className={`${styles.feedItem} ${styles[activity.action.toLowerCase()]}`}
                            >
                                <div className={styles.feedTime}>
                                    {formatTime(activity.timestamp)}
                                </div>
                                <div className={styles.feedAction}>
                                    <StatusBadge
                                        status={actionColors[activity.action]}
                                        label={activity.action}
                                        size="sm"
                                    />
                                </div>
                                <div className={styles.feedUser}>
                                    <span className={styles.userName}>{activity.user?.name || 'Unknown'}</span>
                                    <span className={styles.userDept}>{activity.user?.department}</span>
                                </div>
                                <div className={styles.feedUrl}>
                                    <span className={styles.categoryIcon}>{categoryIcons[activity.category] || '❓'}</span>
                                    <span className={styles.domain}>{activity.domain}</span>
                                </div>
                                <div className={styles.feedMeta}>
                                    <span className={styles.bytes}>{formatBytes(activity.bytes)}</span>
                                    {activity.policy && (
                                        <span className={styles.policyTag}>🛡️ {activity.policy.name}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Category Distribution */}
                <section className={styles.categorySection}>
                    <h3>Activity by Category</h3>
                    <div className={styles.categoryGrid}>
                        {categories.map(cat => {
                            const count = activities.filter(a => a.category === cat).length;
                            const blocked = activities.filter(a => a.category === cat && a.action === 'BLOCK').length;
                            const percent = Math.round((count / activities.length) * 100);

                            return (
                                <div key={cat} className={styles.categoryCard}>
                                    <span className={styles.catIcon}>{categoryIcons[cat] || '❓'}</span>
                                    <div className={styles.catInfo}>
                                        <span className={styles.catName}>{cat.replace(/_/g, ' ')}</span>
                                        <span className={styles.catCount}>{count} requests ({percent}%)</span>
                                    </div>
                                    {blocked > 0 && (
                                        <span className={styles.catBlocked}>{blocked} blocked</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
