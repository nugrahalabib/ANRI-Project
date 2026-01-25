"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./DashboardLayout.module.css";

interface User {
    email: string;
    role: string;
    name: string;
}

const NAV_ITEMS = [
    { href: "/dashboard/executive", label: "Executive Dashboard", icon: "📊", roles: ["SYSTEM_ADMIN", "EXECUTIVE"] },
    { href: "/dashboard/security", label: "Security Console", icon: "🔐", roles: ["SYSTEM_ADMIN", "IT_SECURITY"] },
    { href: "/dashboard/compliance", label: "Compliance", icon: "✅", roles: ["SYSTEM_ADMIN", "COMPLIANCE_OFFICER"] },
    { href: "/documents", label: "Documents", icon: "📄", roles: ["SYSTEM_ADMIN", "ARCHIVIST", "COMPLIANCE_OFFICER"] },
    { href: "/zones", label: "Zones", icon: "🏢", roles: ["SYSTEM_ADMIN", "IT_SECURITY", "ARCHIVIST"] },
    { href: "/alerts", label: "Alerts", icon: "🚨", roles: ["SYSTEM_ADMIN", "IT_SECURITY"] },
    { href: "/violations", label: "Violations", icon: "⚠️", roles: ["SYSTEM_ADMIN", "IT_SECURITY", "COMPLIANCE_OFFICER"] },
    { href: "/audit", label: "Audit Trail", icon: "📜", roles: ["SYSTEM_ADMIN", "COMPLIANCE_OFFICER"] },
    { href: "/users", label: "Users & Roles", icon: "👥", roles: ["SYSTEM_ADMIN"] },
    { href: "/policies", label: "Policies", icon: "📋", roles: ["SYSTEM_ADMIN", "IT_SECURITY"] },
    { href: "/reports", label: "Reports", icon: "📈", roles: ["SYSTEM_ADMIN", "EXECUTIVE", "COMPLIANCE_OFFICER"] },
];

export default function DashboardLayout({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("anri_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("anri_user");
        router.push("/login");
    };

    const filteredNavItems = NAV_ITEMS.filter(
        item => !user || item.roles.includes(user.role)
    );

    if (!user) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <svg viewBox="0 0 100 100" className={styles.logoIcon}>
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
                        {sidebarOpen && <span>ANRI</span>}
                    </div>
                </div>

                <nav className={styles.nav}>
                    {filteredNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        {sidebarOpen && (
                            <div className={styles.userDetails}>
                                <span className={styles.userName}>{user.name}</span>
                                <span className={styles.userRole}>{user.role.replace("_", " ")}</span>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                        🚪
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                    <div className={styles.headerContent}>
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <div className={styles.headerActions}>
                        <span className={styles.timestamp}>
                            {new Date().toLocaleString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </header>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
