'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

// Approval request data structure
interface ApprovalRequest {
    id: string;
    document: {
        rfidTag: string;
        title: string;
        classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
    };
    requester: {
        id: string;
        name: string;
        department: string;
        role: string;
    };
    movement: {
        fromZone: string;
        toZone: string;
    };
    justification: string;
    requestedAt: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
    priority: 'URGENT' | 'NORMAL' | 'LOW';
    approvalChain: {
        level: number;
        approver: string;
        role: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
        approvedAt?: Date;
        notes?: string;
    }[];
    currentLevel: number;
}

// Sample approval requests
const approvalRequests: ApprovalRequest[] = [
    {
        id: 'APR-2024-0045',
        document: {
            rfidTag: 'ANRI-X8K9M2',
            title: 'Arsip Rahasia Kepegawaian 2024-001',
            classification: 'SECRET',
        },
        requester: {
            id: 'USR-042',
            name: 'Dewi Lestari',
            department: 'Bidang Preservasi',
            role: 'Arsiparis Muda',
        },
        movement: {
            fromZone: 'Ruang Arsip Rahasia',
            toZone: 'Ruang Digitalisasi',
        },
        justification: 'Digitalisasi dokumen untuk backup arsip sesuai program kerja Q1 2024. Sudah ada disposisi Kepala Bidang.',
        requestedAt: new Date(Date.now() - 30 * 60000),
        status: 'PENDING',
        priority: 'URGENT',
        approvalChain: [
            { level: 1, approver: 'Ahmad Wijaya', role: 'Kepala Seksi', status: 'APPROVED', approvedAt: new Date(Date.now() - 15 * 60000), notes: 'Setuju, sesuai program kerja.' },
            { level: 2, approver: 'Dr. Siti Rahmawati', role: 'Kepala Bidang', status: 'PENDING' },
            { level: 3, approver: 'Security Officer', role: 'IT Security', status: 'PENDING' },
        ],
        currentLevel: 2,
    },
    {
        id: 'APR-2024-0044',
        document: {
            rfidTag: 'ANRI-P3Q7R1',
            title: 'SK Pengangkatan Pegawai 2024-015',
            classification: 'RESTRICTED',
        },
        requester: {
            id: 'USR-089',
            name: 'Budi Santoso',
            department: 'Sekretariat',
            role: 'Staff Administrasi',
        },
        movement: {
            fromZone: 'Kantor Kearsipan',
            toZone: 'Ruang Rapat Utama',
        },
        justification: 'Diperlukan untuk rapat koordinasi dengan Inspektorat. Akan dikembalikan hari yang sama.',
        requestedAt: new Date(Date.now() - 2 * 3600000),
        status: 'PENDING',
        priority: 'NORMAL',
        approvalChain: [
            { level: 1, approver: 'Rina Wulandari', role: 'Kepala Seksi', status: 'PENDING' },
            { level: 2, approver: 'Security Officer', role: 'IT Security', status: 'PENDING' },
        ],
        currentLevel: 1,
    },
    {
        id: 'APR-2024-0043',
        document: {
            rfidTag: 'ANRI-M5N8V4',
            title: 'Laporan Keuangan Q4 2024',
            classification: 'RESTRICTED',
        },
        requester: {
            id: 'USR-023',
            name: 'Ahmad Fauzi',
            department: 'Bidang Keuangan',
            role: 'Analis Keuangan',
        },
        movement: {
            fromZone: 'Ruang Digitalisasi',
            toZone: 'Kantor Kearsipan',
        },
        justification: 'Pengembalian dokumen setelah proses verifikasi selesai.',
        requestedAt: new Date(Date.now() - 6 * 3600000),
        status: 'APPROVED',
        priority: 'LOW',
        approvalChain: [
            { level: 1, approver: 'Hendra Wijaya', role: 'Kepala Seksi', status: 'APPROVED', approvedAt: new Date(Date.now() - 4 * 3600000), notes: 'OK' },
            { level: 2, approver: 'Security Officer', role: 'IT Security', status: 'APPROVED', approvedAt: new Date(Date.now() - 3 * 3600000) },
        ],
        currentLevel: 2,
    },
    {
        id: 'APR-2024-0042',
        document: {
            rfidTag: 'ANRI-J7H2B5',
            title: 'Arsip Sejarah Kemerdekaan 1945',
            classification: 'SECRET',
        },
        requester: {
            id: 'USR-156',
            name: 'Eko Prasetyo',
            department: 'Bidang Preservasi',
            role: 'Arsiparis Muda',
        },
        movement: {
            fromZone: 'Ruang Arsip Rahasia',
            toZone: 'Ruang Baca Publik',
        },
        justification: 'Diperlukan untuk pameran publik HUT RI.',
        requestedAt: new Date(Date.now() - 24 * 3600000),
        status: 'REJECTED',
        priority: 'NORMAL',
        approvalChain: [
            { level: 1, approver: 'Ahmad Wijaya', role: 'Kepala Seksi', status: 'APPROVED', approvedAt: new Date(Date.now() - 23 * 3600000) },
            { level: 2, approver: 'Dr. Siti Rahmawati', role: 'Kepala Bidang', status: 'REJECTED', approvedAt: new Date(Date.now() - 22 * 3600000), notes: 'Dokumen asli tidak boleh dipindahkan ke zona publik. Gunakan salinan digital.' },
        ],
        currentLevel: 2,
    },
];

// My requests (current user's)
const myRequests = approvalRequests.filter(r => r.requester.id === 'USR-042' || r.requester.id === 'USR-089');

const classificationColors: Record<string, 'normal' | 'warning' | 'critical'> = {
    PUBLIC: 'normal',
    RESTRICTED: 'warning',
    SECRET: 'critical',
};

const statusColors: Record<string, 'normal' | 'warning' | 'critical'> = {
    PENDING: 'warning',
    APPROVED: 'normal',
    REJECTED: 'critical',
    ESCALATED: 'warning',
};

const priorityLabels: Record<string, { label: string; color: string }> = {
    URGENT: { label: 'URGENT', color: '#dc2626' },
    NORMAL: { label: 'Normal', color: '#3d7ab8' },
    LOW: { label: 'Low', color: '#6b7280' },
};

export default function ApprovalsPage() {
    const [filter, setFilter] = useState<'pending' | 'all' | 'my'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [requests, setRequests] = useState(approvalRequests);
    const [actionResult, setActionResult] = useState<{ type: 'approved' | 'rejected' | 'escalated'; id: string } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const pendingForMe = requests.filter(r => r.status === 'PENDING');
    const myRequestsFiltered = requests.filter(r => r.requester.id === 'USR-042' || r.requester.id === 'USR-089');

    const filteredRequests = filter === 'pending'
        ? pendingForMe
        : filter === 'my'
            ? myRequestsFiltered
            : requests;

    const formatTime = (date: Date) => {
        if (!isClient) return '...'; // Prevent hydration mismatch
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return date.toLocaleDateString('id-ID');
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        // Update request status in state
        setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id
                ? { ...r, status: 'APPROVED' as const }
                : r
        ));
        setActionResult({ type: 'approved', id: selectedRequest.id });
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalNotes('');
        // Clear success message after 3 seconds
        setTimeout(() => setActionResult(null), 3000);
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        if (!approvalNotes) {
            return; // Don't close, let validation show
        }
        // Update request status in state
        setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id
                ? { ...r, status: 'REJECTED' as const }
                : r
        ));
        setActionResult({ type: 'rejected', id: selectedRequest.id });
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setApprovalNotes('');
        setTimeout(() => setActionResult(null), 3000);
    };

    const handleEscalate = () => {
        if (!selectedRequest) return;
        // Update request status in state
        setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id
                ? { ...r, status: 'ESCALATED' as const }
                : r
        ));
        setActionResult({ type: 'escalated', id: selectedRequest.id });
        setShowApprovalModal(false);
        setSelectedRequest(null);
        setTimeout(() => setActionResult(null), 3000);
    };

    return (
        <DashboardLayout
            title="Document Movement Approvals"
            subtitle="Persetujuan Berjenjang untuk Pemindahan Dokumen"
        >
            <div className={styles.container}>
                {/* Success Toast */}
                {actionResult && (
                    <div className={`${styles.toast} ${styles[actionResult.type]}`}>
                        <span className={styles.toastIcon}>
                            {actionResult.type === 'approved' ? '✓' : actionResult.type === 'rejected' ? '✕' : '↗'}
                        </span>
                        <span>
                            Request {actionResult.id} {
                                actionResult.type === 'approved' ? 'telah DISETUJUI' :
                                    actionResult.type === 'rejected' ? 'telah DITOLAK' :
                                        'telah DIESKALASI ke Security Officer'
                            }
                        </span>
                    </div>
                )}

                {/* Stats Bar */}
                <section className={styles.statsBar}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{pendingForMe.length}</span>
                        <span className={styles.statLabel}>Pending Approval</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{requests.filter(r => r.status === 'APPROVED').length}</span>
                        <span className={styles.statLabel}>Approved Today</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{requests.filter(r => r.status === 'REJECTED').length}</span>
                        <span className={styles.statLabel}>Rejected</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{requests.filter(r => r.priority === 'URGENT').length}</span>
                        <span className={styles.statLabel}>Urgent Requests</span>
                    </div>
                </section>

                {/* Filter Tabs */}
                <section className={styles.filterTabs}>
                    <button
                        className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending for Me ({pendingForMe.length})
                    </button>
                    <button
                        className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Requests
                    </button>
                    <button
                        className={`${styles.filterTab} ${filter === 'my' ? styles.active : ''}`}
                        onClick={() => setFilter('my')}
                    >
                        My Requests
                    </button>
                </section>

                {/* Requests List */}
                <section className={styles.requestsList}>
                    {filteredRequests.length === 0 ? (
                        <Card>
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📋</span>
                                <p>Tidak ada permintaan yang perlu ditinjau</p>
                            </div>
                        </Card>
                    ) : (
                        filteredRequests.map(request => (
                            <Card
                                key={request.id}
                                noPadding
                                variant={request.priority === 'URGENT' && request.status === 'PENDING' ? 'status-warning' : 'default'}
                            >
                                <div
                                    className={styles.requestCard}
                                    onClick={() => { setSelectedRequest(request); setShowApprovalModal(true); }}
                                >
                                    {/* Header */}
                                    <div className={styles.requestHeader}>
                                        <div className={styles.headerLeft}>
                                            <code className={styles.requestId}>{request.id}</code>
                                            <StatusBadge status={classificationColors[request.document.classification]} label={request.document.classification} />
                                            <StatusBadge status={statusColors[request.status]} label={request.status} />
                                            {request.priority === 'URGENT' && (
                                                <span className={styles.urgentBadge}>⚡ URGENT</span>
                                            )}
                                        </div>
                                        <span className={styles.requestTime}>{formatTime(request.requestedAt)}</span>
                                    </div>

                                    {/* Document Info */}
                                    <div className={styles.documentInfo}>
                                        <h3 className={styles.documentTitle}>{request.document.title}</h3>
                                        <code className={styles.rfidTag}>{request.document.rfidTag}</code>
                                    </div>

                                    {/* Movement Path */}
                                    <div className={styles.movementPath}>
                                        <span className={styles.fromZone}>{request.movement.fromZone}</span>
                                        <span className={styles.arrow}>→</span>
                                        <span className={styles.toZone}>{request.movement.toZone}</span>
                                    </div>

                                    {/* Requester Info */}
                                    <div className={styles.requesterInfo}>
                                        <span>👤 {request.requester.name}</span>
                                        <span>{request.requester.department}</span>
                                        <span>{request.requester.role}</span>
                                    </div>

                                    {/* Approval Chain Progress */}
                                    <div className={styles.approvalChain}>
                                        <span className={styles.chainLabel}>Approval Chain:</span>
                                        <div className={styles.chainSteps}>
                                            {request.approvalChain.map((step, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`${styles.chainStep} ${styles[step.status.toLowerCase()]}`}
                                                >
                                                    <span className={styles.stepNumber}>{step.level}</span>
                                                    <span className={styles.stepRole}>{step.role}</span>
                                                    <span className={styles.stepStatus}>
                                                        {step.status === 'APPROVED' && '✓'}
                                                        {step.status === 'REJECTED' && '✗'}
                                                        {step.status === 'PENDING' && '○'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </section>

                {/* Approval Modal */}
                {showApprovalModal && selectedRequest && (
                    <div className={styles.modalOverlay} onClick={() => setShowApprovalModal(false)}>
                        <div className={styles.approvalModal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Review Permintaan Pemindahan</h2>
                                <button className={styles.closeBtn} onClick={() => setShowApprovalModal(false)}>×</button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Document Section */}
                                <div className={styles.modalSection}>
                                    <h3>📄 Dokumen</h3>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>RFID Tag</span>
                                            <code>{selectedRequest.document.rfidTag}</code>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Classification</span>
                                            <StatusBadge status={classificationColors[selectedRequest.document.classification]} label={selectedRequest.document.classification} />
                                        </div>
                                    </div>
                                    <p className={styles.docTitle}>{selectedRequest.document.title}</p>
                                </div>

                                {/* Movement Section */}
                                <div className={styles.modalSection}>
                                    <h3>📍 Pemindahan</h3>
                                    <div className={styles.movementDetail}>
                                        <div className={styles.zoneBox}>
                                            <span className={styles.zoneLabel}>Dari</span>
                                            <span className={styles.zoneName}>{selectedRequest.movement.fromZone}</span>
                                        </div>
                                        <span className={styles.movementArrow}>→</span>
                                        <div className={styles.zoneBox}>
                                            <span className={styles.zoneLabel}>Ke</span>
                                            <span className={styles.zoneName}>{selectedRequest.movement.toZone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requester Section */}
                                <div className={styles.modalSection}>
                                    <h3>👤 Pemohon</h3>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Nama</span>
                                            <span>{selectedRequest.requester.name}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Unit</span>
                                            <span>{selectedRequest.requester.department}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Jabatan</span>
                                            <span>{selectedRequest.requester.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Justification */}
                                <div className={styles.modalSection}>
                                    <h3>📝 Justifikasi</h3>
                                    <p className={styles.justification}>{selectedRequest.justification}</p>
                                </div>

                                {/* Approval Chain */}
                                <div className={styles.modalSection}>
                                    <h3>🔗 Rantai Persetujuan</h3>
                                    <div className={styles.chainTimeline}>
                                        {selectedRequest.approvalChain.map((step, idx) => (
                                            <div key={idx} className={`${styles.timelineStep} ${styles[step.status.toLowerCase()]}`}>
                                                <div className={styles.stepIndicator}>
                                                    {step.status === 'APPROVED' && '✓'}
                                                    {step.status === 'REJECTED' && '✗'}
                                                    {step.status === 'PENDING' && (idx + 1)}
                                                </div>
                                                <div className={styles.stepContent}>
                                                    <strong>{step.approver}</strong>
                                                    <span>{step.role}</span>
                                                    {step.approvedAt && (
                                                        <span className={styles.stepTime}>
                                                            {formatTime(step.approvedAt)}
                                                        </span>
                                                    )}
                                                    {step.notes && (
                                                        <p className={styles.stepNotes}>"{step.notes}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Approval Notes (only for pending) */}
                                {selectedRequest.status === 'PENDING' && (
                                    <div className={styles.modalSection}>
                                        <h3>💬 Catatan Keputusan</h3>
                                        <textarea
                                            className={styles.notesInput}
                                            placeholder="Tambahkan catatan (wajib untuk penolakan)..."
                                            value={approvalNotes}
                                            onChange={e => setApprovalNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className={styles.modalFooter}>
                                    <Button variant="danger" onClick={handleReject}>
                                        ✗ Tolak
                                    </Button>
                                    <Button variant="secondary" onClick={handleEscalate}>
                                        ↑ Eskalasi
                                    </Button>
                                    <Button variant="primary" onClick={handleApprove}>
                                        ✓ Setujui
                                    </Button>
                                </div>
                            )}

                            {selectedRequest.status !== 'PENDING' && (
                                <div className={styles.modalFooter}>
                                    <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                                        Tutup
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
