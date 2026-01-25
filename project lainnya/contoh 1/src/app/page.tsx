"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to login after 3 seconds
        const timer = setTimeout(() => {
            router.push("/login");
        }, 3000);
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
                    <p>for the National Archives of the Republic of Indonesia</p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📍</span>
                        <span>RFID Document Tracking</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🔐</span>
                        <span>AI Threat Detection</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📊</span>
                        <span>Compliance Monitoring</span>
                    </div>
                </div>

                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Redirecting to login...</span>
                </div>

                <button
                    className={styles.loginBtn}
                    onClick={() => router.push("/login")}
                >
                    Enter Platform
                </button>
            </div>
        </main>
    );
}
