'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, hasPermission, logout } = useAuth();
    const [isResetting, setIsResetting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const canManageSystem = hasPermission('system:config');

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleResetData = async () => {
        if (resetConfirmText !== 'RESET') {
            showToast('Ketik "RESET" untuk konfirmasi', 'error');
            return;
        }

        setIsResetting(true);

        try {
            const response = await fetch('/api/reset-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok) {
                showToast(`✓ Data berhasil di-reset. ${data.message || ''}`, 'success');
                setShowResetModal(false);
                setResetConfirmText('');
            } else {
                showToast(data.error || 'Gagal reset data', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <DashboardLayout title="Pengaturan Sistem" subtitle="Konfigurasi dan manajemen platform ANRI">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>⚙️ Pengaturan Sistem</h1>
                    <p>Konfigurasi dan manajemen platform ANRI</p>
                </div>

                {/* System Information */}
                <Card className={styles.section}>
                    <h2>📊 Informasi Sistem</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Versi Platform</span>
                            <span className={styles.infoValue}>v1.0.0 (Presidential Demo)</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Status Sistem</span>
                            <span className={styles.infoValue}>
                                <span className={styles.statusOnline}>● Online</span>
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Database</span>
                            <span className={styles.infoValue}>SQLite (Demo Mode)</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>User Aktif</span>
                            <span className={styles.infoValue}>{user?.name || '-'}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Role</span>
                            <span className={styles.infoValue}>{user?.role?.replace(/_/g, ' ') || '-'}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Last Backup</span>
                            <span className={styles.infoValue}>2025-01-25 23:00 WIB</span>
                        </div>
                    </div>
                </Card>

                {/* Demo Mode Banner */}
                <Card className={`${styles.section} ${styles.demoBanner}`}>
                    <div className={styles.demoContent}>
                        <span className={styles.demoIcon}>🎬</span>
                        <div>
                            <h3>Mode Demo Presiden</h3>
                            <p>Platform ini berjalan dalam mode demo untuk presentasi kepada Presiden Republik Indonesia</p>
                        </div>
                    </div>
                </Card>

                {/* Logout Section */}
                <Card className={styles.section}>
                    <h2>🚪 Keluar Sistem</h2>
                    <p className={styles.logoutText}>
                        Klik tombol di bawah untuk keluar dari sistem dan kembali ke halaman login.
                    </p>
                    <div className={styles.logoutActions}>
                        <Button
                            variant="danger"
                            onClick={logout}
                        >
                            🚪 Logout
                        </Button>
                    </div>
                </Card>

                {/* Reset Data Section - Admin Only */}
                {canManageSystem && (
                    <Card className={`${styles.section} ${styles.dangerZone}`}>
                        <h2>⚠️ Kontrol Demo</h2>
                        <p className={styles.dangerText}>
                            Fitur ini akan mereset semua data ke kondisi awal demo.
                            Gunakan setelah setiap sesi presentasi untuk memulai ulang.
                        </p>
                        <div className={styles.resetActions}>
                            <Button
                                variant="danger"
                                onClick={() => setShowResetModal(true)}
                            >
                                🔄 Reset Data Demo
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Access Control Info */}
                <Card className={styles.section}>
                    <h2>🔐 Kontrol Akses (RBAC)</h2>
                    <div className={styles.accessTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Dashboard</th>
                                    <th>Fitur Utama</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span className={styles.roleTag}>EXECUTIVE</span></td>
                                    <td>Executive Dashboard</td>
                                    <td>KPI, Risk Overview, Reports</td>
                                </tr>
                                <tr>
                                    <td><span className={styles.roleTag}>IT_SECURITY</span></td>
                                    <td>Security Console</td>
                                    <td>Alerts, Violations, Policies, Zones</td>
                                </tr>
                                <tr>
                                    <td><span className={styles.roleTag}>COMPLIANCE_OFFICER</span></td>
                                    <td>Compliance Center</td>
                                    <td>Audit, Regulations, Reports</td>
                                </tr>
                                <tr>
                                    <td><span className={styles.roleTag}>SYSTEM_ADMIN</span></td>
                                    <td>All Dashboards</td>
                                    <td>Full Access + Settings</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Reset Modal */}
                {showResetModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>⚠️ Reset Data Demo</h3>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setShowResetModal(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <p>
                                    Tindakan ini akan <strong>menghapus SEMUA perubahan</strong> dan
                                    mengembalikan data ke kondisi awal demo.
                                </p>
                                <div className={styles.resetList}>
                                    <p>Data yang akan di-reset:</p>
                                    <ul>
                                        <li>✓ Alerts dan status</li>
                                        <li>✓ Approval requests</li>
                                        <li>✓ Document movements</li>
                                        <li>✓ Policy violations</li>
                                        <li>✓ Audit logs</li>
                                        <li>✓ Session data</li>
                                    </ul>
                                </div>
                                <div className={styles.confirmInput}>
                                    <label>Ketik <strong>"RESET"</strong> untuk konfirmasi:</label>
                                    <input
                                        type="text"
                                        value={resetConfirmText}
                                        onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                                        placeholder="RESET"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowResetModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleResetData}
                                    disabled={isResetting || resetConfirmText !== 'RESET'}
                                >
                                    {isResetting ? 'Mereset...' : 'Reset Data'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toastMessage && (
                    <div className={`${styles.toast} ${styles[`toast${toastType.charAt(0).toUpperCase() + toastType.slice(1)}`]}`}>
                        {toastMessage}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
