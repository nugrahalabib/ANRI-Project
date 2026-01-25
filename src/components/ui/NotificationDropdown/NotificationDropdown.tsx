'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './NotificationDropdown.module.css';

interface Notification {
    id: string;
    type: 'alert' | 'approval' | 'violation' | 'system';
    title: string;
    message: string;
    time: Date;
    read: boolean;
    link?: string;
}

// Sample notifications
const sampleNotifications: Notification[] = [
    {
        id: 'n1',
        type: 'alert',
        title: 'Critical Alert',
        message: 'Dokumen RAHASIA terdeteksi di zona publik',
        time: new Date(Date.now() - 5 * 60000),
        read: false,
        link: '/alerts',
    },
    {
        id: 'n2',
        type: 'approval',
        title: 'Pending Approval',
        message: 'Request pemindahan dokumen menunggu persetujuan',
        time: new Date(Date.now() - 15 * 60000),
        read: false,
        link: '/approvals',
    },
    {
        id: 'n3',
        type: 'violation',
        title: 'Policy Violation',
        message: 'Akses ke situs gambling terdeteksi - User: Budi Santoso',
        time: new Date(Date.now() - 30 * 60000),
        read: false,
        link: '/violations',
    },
    {
        id: 'n4',
        type: 'system',
        title: 'System Update',
        message: 'AI model updated - Accuracy improved to 87.5%',
        time: new Date(Date.now() - 2 * 3600000),
        read: true,
        link: '/dashboard/executive',
    },
    {
        id: 'n5',
        type: 'alert',
        title: 'After Hours Access',
        message: 'Dokumen diakses di luar jam kerja (23:45 WIB)',
        time: new Date(Date.now() - 4 * 3600000),
        read: true,
        link: '/alerts',
    },
];

const typeIcons: Record<string, string> = {
    alert: '🚨',
    approval: '✅',
    violation: '⚠️',
    system: '⚙️',
};

const typeColors: Record<string, string> = {
    alert: '#dc2626',
    approval: '#d4af37',
    violation: '#f59e0b',
    system: '#3d7ab8',
};

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(sampleNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString('id-ID');
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    // Simulate new notification periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const rand = Math.random();
            if (rand > 0.7) { // 30% chance every interval
                const newNotification: Notification = {
                    id: `n${Date.now()}`,
                    type: ['alert', 'approval', 'violation', 'system'][Math.floor(Math.random() * 4)] as any,
                    title: 'Real-time Update',
                    message: 'New activity detected in the system',
                    time: new Date(),
                    read: false,
                    link: '/alerts',
                };
                setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep max 10
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    className={styles.markAllBtn}
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className={styles.notificationList}>
                            {notifications.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span>🔔</span>
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <Link
                                        key={notification.id}
                                        href={notification.link || '#'}
                                        className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span
                                            className={styles.notificationIcon}
                                            style={{ color: typeColors[notification.type] }}
                                        >
                                            {typeIcons[notification.type]}
                                        </span>
                                        <div className={styles.notificationContent}>
                                            <span className={styles.notificationTitle}>
                                                {notification.title}
                                            </span>
                                            <span className={styles.notificationMessage}>
                                                {notification.message}
                                            </span>
                                            <span className={styles.notificationTime}>
                                                {formatTime(notification.time)}
                                            </span>
                                        </div>
                                        {!notification.read && (
                                            <span className={styles.unreadDot} />
                                        )}
                                    </Link>
                                ))
                            )}
                        </div>

                        <div className={styles.dropdownFooter}>
                            <Link
                                href="/alerts"
                                className={styles.viewAllBtn}
                                onClick={() => setIsOpen(false)}
                            >
                                View All Alerts →
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default NotificationDropdown;
