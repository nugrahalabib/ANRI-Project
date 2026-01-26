'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { AIAssistant } from '@/components/ai/AIAssistant/AIAssistant';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export function DashboardLayout({ title, subtitle, actions, children }: DashboardLayoutProps) {
    const [isClient, setIsClient] = useState(false);
    const [clock, setClock] = useState<Date | null>(null);

    useEffect(() => {
        setIsClient(true);
        setClock(new Date());
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date | null) => {
        if (!date) return '--:--:--';
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className={styles.layout}>
            <Sidebar />
            <div className={styles.main}>
                {/* Demo Mode Banner */}
                <div className={styles.demoBanner}>
                    <span className={styles.demoIcon}>🧪</span>
                    <span className={styles.demoText}>DEMO MODE</span>
                    <span className={styles.demoDivider}>|</span>
                    <span className={styles.demoClock}>
                        {isClient ? formatTime(clock) : '--:--:--'}
                    </span>
                    <span className={styles.demoDivider}>|</span>
                    <span className={styles.demoNote}>Simulated Data • Not Production</span>
                </div>
                <Header title={title} subtitle={subtitle} actions={actions} />
                <main className={styles.content}>{children}</main>
            </div>

            {/* Global AI Assistant */}
            <AIAssistant />
        </div>
    );
}

export default DashboardLayout;

