'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

// Approval request type matching backend response
interface ApprovalRequest {
    id: string;
    requestNumber: string;
    type: string;
    requesterId: string;
    subject: string;
    description: string;
    priority: 'URGENT' | 'NORMAL' | 'LOW';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
    createdAt: string;
    approvedAt?: string;
    notes?: string;
    requester: {
        id: string;
        name: string;
        department: string;
    };
    approvedBy?: {
        id: string;
        name: string;
    };
    metadata: {
        documentId: string;
        documentTitle: string;
        rfidTag: string;
        classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
        fromZoneName: string;
        toZoneName: string;
    } | null;
}

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
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionResult, setActionResult] = useState<{ type: 'approved' | 'rejected' | 'escalated'; id: string } | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/approvals?limit=50');
            const json = await res.json();
            if (json.success) {
                setRequests(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch approvals', error);
        } finally {
            setLoading(false);
        }
    };

    const pendingForMe = requests.filter(r => r.status === 'PENDING');

    // For demo purposes, we assume "My Requests" are requests made by the current user
    // In a real app we'd compare with session user ID, but the API returns all for now.
    // We can filter where requester.name contains "Demo" or just show all for now.
    const myRequestsFiltered = requests; // TODO: Filter by current user ID if available

    const filteredRequests = filter === 'pending'
        ? pendingForMe
        : filter === 'my'
            ? myRequestsFiltered
            : requests;

    const formatTime = (dateStr: string) => {
        if (!isClient) return '...';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return date.toLocaleDateString('id-ID');
    };

    const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
        if (!selectedRequest) return;

        try {
            const res = await fetch('/api/approvals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRequest.id,
                    action,
                    notes: approvalNotes
                })
            });

            const json = await res.json();

            if (json.success) {
                setActionResult({
                    type: action === 'APPROVED' ? 'approved' : 'rejected',
                    id: selectedRequest.requestNumber
                });

                // Refresh list
                await fetchRequests();

                setShowApprovalModal(false);
                setSelectedRequest(null);
                setApprovalNotes('');

                setTimeout(() => setActionResult(null), 3000);
            } else {
                alert(json.error || 'Gagal memproses permintaan');
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('Terjadi kesalahan sistem');
        }
    };

    const handleApprove = () => handleAction('APPROVED');
    const handleReject = () => {
        if (!approvalNotes) return alert('Mohon isi catatan untuk penolakan');
        handleAction('REJECTED');
    };

    const handleEscalate = () => {
        alert('Fitur eskalasi belum tersedia untuk demo ini.');
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
                                            <code className={styles.requestId}>{request.requestNumber}</code>
                                            <StatusBadge status={classificationColors[request.metadata?.classification || 'PUBLIC']} label={request.metadata?.classification || 'PUBLIC'} />
                                            <StatusBadge status={statusColors[request.status]} label={request.status} />
                                            {request.priority === 'URGENT' && (
                                                <span className={styles.urgentBadge}>⚡ URGENT</span>
                                            )}
                                        </div>
                                        <span className={styles.requestTime}>{formatTime(request.createdAt)}</span>
                                    </div>

                                    {/* Document Info */}
                                    <div className={styles.documentInfo}>
                                        <h3 className={styles.documentTitle}>{request.metadata?.documentTitle || request.subject}</h3>
                                        <code className={styles.rfidTag}>{request.metadata?.rfidTag}</code>
                                    </div>

                                    {/* Movement Path */}
                                    <div className={styles.movementPath}>
                                        <span className={styles.fromZone}>{request.metadata?.fromZoneName || '?'}</span>
                                        <span className={styles.arrow}>→</span>
                                        <span className={styles.toZone}>{request.metadata?.toZoneName || '?'}</span>
                                    </div>

                                    {/* Requester Info */}
                                    <div className={styles.requesterInfo}>
                                        <span>👤 {request.requester.name}</span>
                                        <span>{request.requester.department}</span>
                                    </div>

                                    {/* Approval Chain Progress - Simplified */}
                                    {/* <div className={styles.approvalChain}>
                                        <span className={styles.chainLabel}>Status:</span>
                                        <span className={styles.statusText}>{request.status}</span>
                                     </div> */}
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
                                            <code>{selectedRequest.metadata?.rfidTag}</code>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Classification</span>
                                            <StatusBadge status={classificationColors[selectedRequest.metadata?.classification || 'PUBLIC']} label={selectedRequest.metadata?.classification || 'PUBLIC'} />
                                        </div>
                                    </div>
                                    <p className={styles.docTitle}>{selectedRequest.metadata?.documentTitle || selectedRequest.subject}</p>
                                </div>

                                {/* Movement Section */}
                                <div className={styles.modalSection}>
                                    <h3>📍 Pemindahan</h3>
                                    <div className={styles.movementDetail}>
                                        <div className={styles.zoneBox}>
                                            <span className={styles.zoneLabel}>Dari</span>
                                            <span className={styles.zoneName}>{selectedRequest.metadata?.fromZoneName || '-'}</span>
                                        </div>
                                        <span className={styles.movementArrow}>→</span>
                                        <div className={styles.zoneBox}>
                                            <span className={styles.zoneLabel}>Ke</span>
                                            <span className={styles.zoneName}>{selectedRequest.metadata?.toZoneName || '-'}</span>
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
                                    </div>
                                </div>

                                {/* Justification */}
                                <div className={styles.modalSection}>
                                    <h3>📝 Justifikasi</h3>
                                    <p className={styles.justification}>{selectedRequest.description}</p>
                                </div>

                                {/* Approval Chain - Simplified for API */}
                                <div className={styles.modalSection}>
                                    <h3>🔗 Status Persetujuan</h3>
                                    <div className={styles.chainTimeline}>
                                        <div className={`${styles.timelineStep} ${styles.approved}`}>
                                            <div className={styles.stepIndicator}>
                                                ✓
                                            </div>
                                            <div className={styles.stepContent}>
                                                <strong>Pemohon</strong>
                                                <span>{selectedRequest.requester.name}</span>
                                                <span className={styles.stepTime}>{formatTime(selectedRequest.createdAt)}</span>
                                            </div>
                                        </div>

                                        {selectedRequest.status !== 'PENDING' && selectedRequest.approvedBy && (
                                            <div className={`${styles.timelineStep} ${styles[selectedRequest.status.toLowerCase()]}`}>
                                                <div className={styles.stepIndicator}>
                                                    {selectedRequest.status === 'APPROVED' ? '✓' : '✗'}
                                                </div>
                                                <div className={styles.stepContent}>
                                                    <strong>{selectedRequest.approvedBy.name}</strong>
                                                    <span>Approver</span>
                                                    {selectedRequest.approvedAt && (
                                                        <span className={styles.stepTime}>
                                                            {formatTime(selectedRequest.approvedAt)}
                                                        </span>
                                                    )}
                                                    {selectedRequest.notes && (
                                                        <p className={styles.stepNotes}>&quot;{selectedRequest.notes}&quot;</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedRequest.status === 'PENDING' && (
                                            <div className={`${styles.timelineStep} ${styles.pending}`}>
                                                <div className={styles.stepIndicator}>○</div>
                                                <div className={styles.stepContent}>
                                                    <strong>Menunggu Persetujuan</strong>
                                                    <span>Security Officer / Executive</span>
                                                </div>
                                            </div>
                                        )}
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
