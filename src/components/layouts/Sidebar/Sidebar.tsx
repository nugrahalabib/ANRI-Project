'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badgeKey?: string; // Optional key for dynamic badge
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

// Static navigation structure - badges will be overlayed dynamically
const navigationConfig: NavGroup[] = [
    {
        title: 'Dashboards',
        items: [
            {
                label: 'Executive Overview',
                href: '/dashboard/executive',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                ),
            },
            {
                label: 'Security Console',
                href: '/dashboard/security',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                ),
            },
            {
                label: 'Compliance Center',
                href: '/dashboard/compliance',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.62 1.98" />
                    </svg>
                ),
            },
        ],
    },
    {
        title: '📍 Use Case 1: Document Monitoring',
        items: [
            {
                label: 'Document Tracking',
                href: '/documents',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                ),
            },
            {
                label: 'Zone Management',
                href: '/zones',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                    </svg>
                ),
            },
            {
                label: 'Document Approvals',
                href: '/approvals',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                ),
                badgeKey: 'approvals',
            },
        ],
    },
    {
        title: '🌐 Use Case 2: Internet Monitoring',
        items: [
            {
                label: 'Policy Engine',
                href: '/policies',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                ),
            },
            {
                label: 'Active Alerts',
                href: '/alerts',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                ),
            },
            {
                label: 'Violations Log',
                href: '/violations',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                ),
            },
            {
                label: 'Device Inventory',
                href: '/devices',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                ),
            },
        ],
    },
    {
        title: 'Governance',
        items: [
            {
                label: 'Audit Trail',
                href: '/audit',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                ),
            },
            {
                label: 'Reports',
                href: '/reports',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                ),
            },
            {
                label: 'Users & Roles',
                href: '/users',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                ),
            },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [badges, setBadges] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await fetch('/api/approvals?status=PENDING&limit=100');
                const json = await res.json();
                if (json.success) {
                    setBadges(prev => ({ ...prev, approvals: json.data?.length || 0 }));
                }
            } catch (e) {
                console.error('Failed to fetch badge counts', e);
            }
        };
        fetchBadges();
        const interval = setInterval(fetchBadges, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 40 40" fill="none">
                        <rect width="40" height="40" rx="8" fill="url(#logoGradient)" />
                        <path d="M12 28V12h4l4 8 4-8h4v16h-4v-8l-4 8-4-8v8h-4z" fill="white" />
                        <defs>
                            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                                <stop stopColor="#3d7ab8" />
                                <stop offset="1" stopColor="#1c3a5e" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className={styles.logoText}>
                    <span className={styles.logoTitle}>ANRI</span>
                    <span className={styles.logoSubtitle}>Risk Intelligence</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navigationConfig.map((group: NavGroup, groupIdx: number) => (
                    <div key={groupIdx} className={styles.navGroup}>
                        <div className={styles.navGroupTitle}>{group.title}</div>
                        <ul className={styles.navList}>
                            {group.items.map((item: NavItem, itemIdx: number) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                const badgeValue = item.badgeKey ? badges[item.badgeKey] : undefined;
                                return (
                                    <li key={itemIdx}>
                                        <Link
                                            href={item.href}
                                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                        >
                                            <span className={styles.navIcon}>{item.icon}</span>
                                            <span className={styles.navLabel}>{item.label}</span>
                                            {badgeValue !== undefined && badgeValue > 0 && (
                                                <span className={styles.navBadge}>{badgeValue}</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.systemStatus}>
                    <span className={styles.statusDot}></span>
                    <span>System Online</span>
                </div>
                <div className={styles.version}>v1.0.0</div>
            </div>
        </aside>
    );
}

export default Sidebar;
