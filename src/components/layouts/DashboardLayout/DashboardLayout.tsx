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
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                        {clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
