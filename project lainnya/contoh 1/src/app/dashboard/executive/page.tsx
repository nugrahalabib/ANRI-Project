"use client";

import DashboardLayout from "@/components/DashboardLayout";
import styles from "./page.module.css";

const STATS = [
    { label: "Total Documents", value: "12,847", change: "+124", trend: "up" },
    { label: "Active Alerts", value: "3", change: "-2", trend: "down" },
    { label: "Compliance Score", value: "94.2%", change: "+1.2%", trend: "up" },
    { label: "RFID Active", value: "247", change: "0", trend: "neutral" },
];

const RECENT_ACTIVITIES = [
    { type: "alert", message: "Document ANRI-X8K9M2 entered unauthorized zone", time: "10 min ago", severity: "critical" },
    { type: "audit", message: "User Siti Rahmawati accessed Security Console", time: "25 min ago", severity: "info" },
    { type: "policy", message: "DNS Block policy triggered for USR-042", time: "1 hour ago", severity: "warning" },
    { type: "system", message: "RFID Reader RDR-1004 went offline", time: "2 hours ago", severity: "warning" },
    { type: "compliance", message: "Weekly compliance report generated", time: "3 hours ago", severity: "info" },
];

const ZONE_STATUS = [
    { name: "Ruang Arsip Rahasia", status: "alert", docs: 45, readers: 2 },
    { name: "Ruang Arsip Utama", status: "normal", docs: 128, readers: 3 },
    { name: "Ruang Baca Publik", status: "normal", docs: 15, readers: 1 },
    { name: "Gudang Penyimpanan", status: "warning", docs: 89, readers: 2 },
];

export default function ExecutiveDashboard() {
    return (
        <DashboardLayout
            title="Executive Dashboard"
            subtitle="Strategic Overview & KPI Monitoring"
        >
            <div className={styles.container}>
                {/* Stats Grid */}
                <section className={styles.statsGrid}>
                    {STATS.map((stat) => (
                        <div key={stat.label} className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <span className={`${styles.statChange} ${styles[stat.trend]}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className={styles.statValue}>{stat.value}</div>
                        </div>
                    ))}
                </section>

                {/* Main Content Grid */}
                <div className={styles.mainGrid}>
                    {/* Recent Activity */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Recent Activity</h2>
                            <button className={styles.viewAllBtn}>View All</button>
                        </div>
                        <div className={styles.activityList}>
                            {RECENT_ACTIVITIES.map((activity, index) => (
                                <div key={index} className={styles.activityItem}>
                                    <div className={`${styles.activityDot} ${styles[activity.severity]}`} />
                                    <div className={styles.activityContent}>
                                        <p>{activity.message}</p>
                                        <span className={styles.activityTime}>{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Zone Overview */}
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Zone Status</h2>
                            <button className={styles.viewAllBtn}>Manage Zones</button>
                        </div>
                        <div className={styles.zoneList}>
                            {ZONE_STATUS.map((zone, index) => (
                                <div key={index} className={styles.zoneItem}>
                                    <div className={`${styles.zoneStatus} ${styles[zone.status]}`} />
                                    <div className={styles.zoneInfo}>
                                        <span className={styles.zoneName}>{zone.name}</span>
                                        <span className={styles.zoneStats}>
                                            {zone.docs} docs • {zone.readers} readers
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Quick Actions */}
                <section className={styles.quickActions}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actionGrid}>
                        <button className={styles.actionBtn}>
                            <span>📄</span>
                            <span>Search Document</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <span>📊</span>
                            <span>Generate Report</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <span>🔍</span>
                            <span>Audit Trail</span>
                        </button>
                        <button className={styles.actionBtn}>
                            <span>⚙️</span>
                            <span>System Status</span>
                        </button>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
