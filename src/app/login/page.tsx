'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

// Demo users for quick login display
const DEMO_USERS = [
    {
        email: 'admin@anri.go.id',
        password: 'admin123',
        role: 'SYSTEM_ADMIN',
        name: 'Rudi Hermawan, S.Kom',
        description: 'Kelola sistem, user, dan konfigurasi platform'
    },
    {
        email: 'direktur@anri.go.id',
        password: 'direktur123',
        role: 'EXECUTIVE',
        name: 'Dr. Ir. Budi Santoso, M.Sc.',
        description: 'Ringkasan risiko dan dashboard eksekutif'
    },
    {
        email: 'security@anri.go.id',
        password: 'security123',
        role: 'IT_SECURITY',
        name: 'Siti Rahmawati, S.T.',
        description: 'Respons alert dan pantau keamanan'
    },
    {
        email: 'compliance@anri.go.id',
        password: 'compliance123',
        role: 'COMPLIANCE_OFFICER',
        name: 'Ahmad Wijaya, S.E., Ak.',
        description: 'Audit kepatuhan dan pelanggaran'
    },
];

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard/executive');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success && result.redirectUrl) {
            router.push(result.redirectUrl);
        } else {
            setError(result.error || 'Email atau password salah');
            setLoading(false);
        }
    };

    const handleQuickLogin = (user: typeof DEMO_USERS[0]) => {
        setEmail(user.email);
        setPassword(user.password);
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <main className={styles.main}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Memuat...</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
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
                    <h1>ANRI</h1>
                    <p>Sovereign Risk Intelligence Platform</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@anri.go.id"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Authenticating...
                            </>
                        ) : (
                            'Masuk ke Platform'
                        )}
                    </button>
                </form>

                <div className={styles.quickLogin}>
                    <p>Quick Login (demo accounts, simulated data):</p>
                    <div className={styles.roleCards}>
                        {DEMO_USERS.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => handleQuickLogin(user)}
                                className={styles.roleCard}
                                type="button"
                            >
                                <span className={styles.roleName}>
                                    {user.role.replace(/_/g, ' ')}
                                </span>
                                <span className={styles.roleDesc}>
                                    {user.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>Prototype by Spead AI for an ANRI procurement process</p>
                    <p>Simulated data · not an official ANRI system</p>
                </div>
            </div>
        </main>
    );
}

