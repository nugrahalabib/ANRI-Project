'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <svg viewBox="0 0 100 100" className={styles.shield}>
            <path
              d="M50 5 L90 20 L90 50 C90 75 50 95 50 95 C50 95 10 75 10 50 L10 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M35 50 L45 60 L65 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>ANRI</h1>
        <p className={styles.subtitle}>Sovereign Risk Intelligence Platform</p>

        <div className={styles.description}>
          <p>Enterprise-grade AI monitoring and risk intelligence system</p>
          <p>for the <strong>National Archives of the Republic of Indonesia</strong></p>
        </div>

        {/* Use Cases - sesuai Proposal */}
        <div className={styles.useCases}>
          <div className={styles.useCase}>
            <div className={styles.useCaseHeader}>
              <span className={styles.useCaseIcon}>📍</span>
              <span className={styles.useCaseLabel}>USE CASE 1</span>
            </div>
            <h3>Intelligent Document Monitoring</h3>
            <p>RFID-based real-time tracking dengan AI-powered anomaly detection</p>
            <div className={styles.useCaseTags}>
              <span>RFID Tracking</span>
              <span>Zone Detection</span>
              <span>Movement Alerts</span>
            </div>
          </div>

          <div className={styles.useCase}>
            <div className={styles.useCaseHeader}>
              <span className={styles.useCaseIcon}>🌐</span>
              <span className={styles.useCaseLabel}>USE CASE 2</span>
            </div>
            <h3>Internet Activity Monitoring</h3>
            <p>Policy enforcement engine dengan behavioral profiling</p>
            <div className={styles.useCaseTags}>
              <span>DNS Blocking</span>
              <span>URL Filtering</span>
              <span>User Profiling</span>
            </div>
          </div>
        </div>

        {/* AI Badge */}
        <div className={styles.aiBadge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>AI-Powered XAI (Explainable AI) Analytics</span>
        </div>

        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Mengalihkan ke halaman login...</span>
        </div>

        <button
          className={styles.loginBtn}
          onClick={() => router.push('/login')}
        >
          Masuk ke Platform
        </button>

        {/* Government Footer */}
        <div className={styles.govFooter}>
          <span>Arsip Nasional Republik Indonesia</span>
          <span className={styles.divider}>•</span>
          <span>Kementerian Pendayagunaan Aparatur Negara</span>
        </div>
      </div>
    </main>
  );
}
