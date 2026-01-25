"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Demo users for testing
const DEMO_USERS = [
    { email: "admin@anri.go.id", password: "admin123", role: "SYSTEM_ADMIN", name: "Admin System" },
    { email: "executive@anri.go.id", password: "exec123", role: "EXECUTIVE", name: "Direktur Utama" },
    { email: "security@anri.go.id", password: "sec123", role: "IT_SECURITY", name: "Siti Rahmawati" },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = DEMO_USERS.find(u => u.email === email && u.password === password);

        if (user) {
            // Store user in localStorage for demo
            localStorage.setItem("anri_user", JSON.stringify(user));
            router.push("/dashboard/executive");
        } else {
            setError("Email atau password salah");
        }

        setLoading(false);
    };

    const handleQuickLogin = (user: typeof DEMO_USERS[0]) => {
        setEmail(user.email);
        setPassword(user.password);
    };

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
                            "Login to Platform"
                        )}
                    </button>
                </form>

                <div className={styles.quickLogin}>
                    <p>Quick Login (Demo):</p>
                    <div className={styles.quickButtons}>
                        {DEMO_USERS.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => handleQuickLogin(user)}
                                className={styles.quickBtn}
                            >
                                {user.role.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <p>© 2024 Arsip Nasional Republik Indonesia</p>
                    <p>Secure Access Portal v1.0</p>
                </div>
            </div>
        </main>
    );
}
