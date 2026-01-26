'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface ApprovalStep {
    id: string;
    level: number;
    roleRequired: string | null;
    approverId: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
    notes: string | null;
    decidedAt: string | null;
}

interface ApprovalRequest {
    id: string;
    requestNumber: string;
    type: string;
    requesterId: string;
    subject: string;
    description: string;
    priority: 'URGENT' | 'NORMAL' | 'LOW';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    currentLevel: number;
    requiredLevel: number;
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
    steps: ApprovalStep[];
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

const ITEMS_PER_PAGE = 10;

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/approvals?limit=100');
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

    // Filter requests
    const filteredRequests = requests.filter(r => {
        const matchSearch = search === '' ||
            r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
            r.metadata?.documentTitle?.toLowerCase().includes(search.toLowerCase()) ||
            r.metadata?.rfidTag?.toLowerCase().includes(search.toLowerCase()) ||
            r.requester.name.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;

        return matchSearch && matchStatus && matchPriority;
    });

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, priorityFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Stats
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const handleRowClick = (request: ApprovalRequest) => {
        setSelectedRequest(request);
        setApprovalNotes('');
        setShowModal(true);
    };

    const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
        if (!selectedRequest) return;
        if (action === 'REJECTED' && !approvalNotes) {
            setToast({ type: 'error', message: 'Catatan wajib diisi untuk penolakan' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        setActionLoading(true);
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
                setToast({
                    type: 'success',
                    message: `${selectedRequest.requestNumber} ${action === 'APPROVED' ? 'disetujui' : 'ditolak'}`
                });
                setShowModal(false);
                setSelectedRequest(null);
                await fetchRequests();
            } else {
                setToast({ type: 'error', message: json.error || 'Gagal memproses' });
            }
        } catch (error) {
            setToast({ type: 'error', message: 'Terjadi kesalahan sistem' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Document Approvals" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading approval requests...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Document Approvals" subtitle="Movement Approval Requests">
            <div className={styles.container}>
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.message}
                    </div>
                )}

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by request ID, document, or requester..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Priority</option>
                            <option value="URGENT">Urgent</option>
                            <option value="NORMAL">Normal</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                </section>

                {/* Stats */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Requests</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.pending}`}>
                        <span className={styles.statValue}>{stats.pending}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.approved}`}>
                        <span className={styles.statValue}>{stats.approved}</span>
                        <span className={styles.statLabel}>Approved</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.rejected}`}>
                        <span className={styles.statValue}>{stats.rejected}</span>
                        <span className={styles.statLabel}>Rejected</span>
                    </div>
                </section>

                {/* Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Document</th>
                                    <th>Movement</th>
                                    <th>Requester</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.emptyRow}>
                                            No approval requests found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className={`${styles.row} ${request.status === 'PENDING' && request.priority === 'URGENT' ? styles.urgentRow : ''}`}
                                            onClick={() => handleRowClick(request)}
                                        >
                                            <td>
                                                <span className={styles.requestId}>{request.requestNumber}</span>
                                            </td>
                                            <td>
                                                <div className={styles.docInfo}>
                                                    <span className={styles.docTitle}>{request.metadata?.documentTitle || request.subject}</span>
                                                    <div className={styles.docMeta}>
                                                        <code className={styles.rfidTag}>{request.metadata?.rfidTag}</code>
                                                        <StatusBadge
                                                            status={classificationColors[request.metadata?.classification || 'PUBLIC']}
                                                            label={request.metadata?.classification || 'PUBLIC'}
                                                            size="sm"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.movement}>
                                                    <span className={styles.zone}>{request.metadata?.fromZoneName || '?'}</span>
                                                    <span className={styles.arrow}>→</span>
                                                    <span className={styles.zone}>{request.metadata?.toZoneName || '?'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.requester}>
                                                    <span className={styles.requesterName}>{request.requester.name}</span>
                                                    <span className={styles.requesterDept}>{request.requester.department}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.priorityBadge} ${styles[request.priority.toLowerCase()]}`}>
                                                    {request.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status${request.status}`]}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.dateInfo}>
                                                    <span className={styles.date}>{formatDate(request.createdAt)}</span>
                                                    <span className={styles.time}>{getTimeAgo(request.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {request.status === 'PENDING' ? (
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={styles.approveBtn}
                                                            onClick={() => { setSelectedRequest(request); handleAction('APPROVED'); }}
                                                            title="Approve"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className={styles.rejectBtn}
                                                            onClick={() => handleRowClick(request)}
                                                            title="Review & Reject"
                                                        >
                                                            ✗
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className={styles.viewBtn}
                                                        onClick={() => handleRowClick(request)}
                                                    >
                                                        View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} requests
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹ Prev
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className={styles.pageEllipsis}>{page}</span>
                                )
                            ))}
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showModal && selectedRequest && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>
                                    <h2>Request Details</h2>
                                    <span className={styles.modalRequestId}>{selectedRequest.requestNumber}</span>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Document Section */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Document</h3>
                                    <div className={styles.sectionContent}>
                                        <div className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>Title</span>
                                            <span className={styles.fieldValue}>{selectedRequest.metadata?.documentTitle}</span>
                                        </div>
                                        <div className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>RFID Tag</span>
                                            <code className={styles.fieldCode}>{selectedRequest.metadata?.rfidTag}</code>
                                        </div>
                                        <div className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>Classification</span>
                                            <StatusBadge
                                                status={classificationColors[selectedRequest.metadata?.classification || 'PUBLIC']}
                                                label={selectedRequest.metadata?.classification || 'PUBLIC'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Movement Section */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Movement Request</h3>
                                    <div className={styles.movementBox}>
                                        <div className={styles.zoneCard}>
                                            <span className={styles.zoneLabel}>From</span>
                                            <span className={styles.zoneName}>{selectedRequest.metadata?.fromZoneName}</span>
                                        </div>
                                        <div className={styles.movementArrow}>→</div>
                                        <div className={styles.zoneCard}>
                                            <span className={styles.zoneLabel}>To</span>
                                            <span className={styles.zoneName}>{selectedRequest.metadata?.toZoneName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requester Section */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Requester</h3>
                                    <div className={styles.sectionContent}>
                                        <div className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>Name</span>
                                            <span className={styles.fieldValue}>{selectedRequest.requester.name}</span>
                                        </div>
                                        <div className={styles.fieldRow}>
                                            <span className={styles.fieldLabel}>Department</span>
                                            <span className={styles.fieldValue}>{selectedRequest.requester.department}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Justification */}
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Justification</h3>
                                    <p className={styles.justification}>{selectedRequest.description}</p>
                                </div>

                                {/* Status Info */}
                                {selectedRequest.status !== 'PENDING' && (
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Decision</h3>
                                        <div className={styles.sectionContent}>
                                            <div className={styles.fieldRow}>
                                                <span className={styles.fieldLabel}>Status</span>
                                                <span className={`${styles.statusBadge} ${styles[`status${selectedRequest.status}`]}`}>
                                                    {selectedRequest.status}
                                                </span>
                                            </div>
                                            {selectedRequest.approvedBy && (
                                                <div className={styles.fieldRow}>
                                                    <span className={styles.fieldLabel}>By</span>
                                                    <span className={styles.fieldValue}>{selectedRequest.approvedBy.name}</span>
                                                </div>
                                            )}
                                            {selectedRequest.approvedAt && (
                                                <div className={styles.fieldRow}>
                                                    <span className={styles.fieldLabel}>Date</span>
                                                    <span className={styles.fieldValue}>{formatDate(selectedRequest.approvedAt)} {formatTime(selectedRequest.approvedAt)}</span>
                                                </div>
                                            )}
                                            {selectedRequest.notes && (
                                                <div className={styles.fieldRow}>
                                                    <span className={styles.fieldLabel}>Notes</span>
                                                    <span className={styles.fieldValue}>{selectedRequest.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Notes for pending */}
                                {selectedRequest.status === 'PENDING' && (
                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>Decision Notes</h3>
                                        <textarea
                                            className={styles.notesInput}
                                            placeholder="Add notes (required for rejection)..."
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                {selectedRequest.status === 'PENDING' ? (
                                    <>
                                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={actionLoading}>
                                            Cancel
                                        </Button>
                                        <Button variant="danger" onClick={() => handleAction('REJECTED')} disabled={actionLoading}>
                                            Reject
                                        </Button>
                                        <Button variant="primary" onClick={() => handleAction('APPROVED')} disabled={actionLoading}>
                                            {actionLoading ? 'Processing...' : 'Approve'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                                        Close
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
