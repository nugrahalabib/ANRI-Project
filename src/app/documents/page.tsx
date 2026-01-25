'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Document {
    id: string;
    rfidTag: string;
    title: string;
    classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
    organizationUnit: string;
    currentZone: { id: string; name: string; code: string } | null;
    lastMovement: string | null;
    movementCount: number;
    riskScore: number;
    alertCount: number;
}

interface Zone {
    id: string;
    name: string;
    code: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Stats {
    total: number;
    secret: number;
    restricted: number;
    public: number;
    withAlerts: number;
}

const classificationColors: Record<string, string> = {
    PUBLIC: 'normal',
    RESTRICTED: 'warning',
    SECRET: 'critical',
};

const ITEMS_PER_PAGE = 10;

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [zoneFilter, setZoneFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 1 });
    const [stats, setStats] = useState<Stats>({ total: 0, secret: 0, restricted: 0, public: 0, withAlerts: 0 });

    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [detailDoc, setDetailDoc] = useState<Document | null>(null);
    const [requestDoc, setRequestDoc] = useState<Document | null>(null);
    const [targetZone, setTargetZone] = useState('');
    const [justification, setJustification] = useState('');
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestNumber, setRequestNumber] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);

    // Fetch stats (always get total counts regardless of filter)
    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/documents/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
        fetchStats();
    }, []);

    // Fetch documents with pagination
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    search,
                    classification: classFilter,
                    page: currentPage.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                });
                if (zoneFilter !== 'all') {
                    params.set('zoneId', zoneFilter);
                }

                const [docsRes, zonesRes] = await Promise.all([
                    fetch(`/api/documents?${params}`),
                    fetch('/api/zones'),
                ]);
                const docsData = await docsRes.json();
                const zonesData = await zonesRes.json();

                if (docsData.success) {
                    setDocuments(docsData.data);
                    setPagination(docsData.pagination);
                }
                if (zonesData.success) setZones(zonesData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [search, classFilter, zoneFilter, currentPage]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, classFilter, zoneFilter]);

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return `${Math.floor(diff / 1440)} hari lalu`;
    };

    const handleViewTimeline = (doc: Document) => {
        router.push(`/documents/${doc.id}/timeline`);
    };

    const handleViewDetails = (doc: Document) => {
        setDetailDoc(doc);
        setShowDetailModal(true);
    };

    const handleRequestMovement = (doc: Document) => {
        setRequestDoc(doc);
        setTargetZone('');
        setJustification('');
        setRequestSuccess(false);
        setShowRequestModal(true);
    };

    const submitRequest = async () => {
        if (!targetZone || !justification || !requestDoc) return;

        setRequestLoading(true);
        try {
            const res = await fetch('/api/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: requestDoc.id,
                    targetZoneId: targetZone,
                    justification,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setRequestNumber(data.data.requestNumber);
                setRequestSuccess(true);
                setTimeout(() => {
                    setShowRequestModal(false);
                    setRequestSuccess(false);
                }, 3000);
            } else {
                alert(data.error || 'Gagal membuat permintaan');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Terjadi kesalahan saat mengirim permintaan');
        } finally {
            setRequestLoading(false);
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const { totalPages } = pagination;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    if (loading && documents.length === 0) {
        return (
            <DashboardLayout title="Document Tracking" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading documents from database...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Document Tracking" subtitle="RFID-Based Physical Asset Monitoring">
            <div className={styles.container}>
                {/* Search and Filters */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by title or RFID tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Classifications</option>
                            <option value="PUBLIC">Public</option>
                            <option value="RESTRICTED">Restricted</option>
                            <option value="SECRET">Secret</option>
                        </select>
                        <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Zones</option>
                            {zones.map(z => (
                                <option key={z.id} value={z.id}>{z.name}</option>
                            ))}
                        </select>
                        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 4 }}>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Document
                        </Button>
                    </div>
                </section>

                {/* Stats Cards - Always shows TOTAL counts */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Documents</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.secret}</span>
                        <span className={styles.statLabel}>Secret</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.restricted}</span>
                        <span className={styles.statLabel}>Restricted</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.withAlerts}</span>
                        <span className={styles.statLabel}>With Alerts</span>
                    </div>
                </section>

                {/* Document Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>RFID Tag</th>
                                    <th>Document Title</th>
                                    <th>Classification</th>
                                    <th>Current Zone</th>
                                    <th>Last Movement</th>
                                    <th>Risk Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyRow}>
                                            No documents found matching your criteria
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            className={`${styles.row} ${doc.alertCount > 0 ? styles.alertRow : ''}`}
                                            onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                                        >
                                            <td><span className={styles.rfidTag}>{doc.rfidTag}</span></td>
                                            <td>
                                                <div className={styles.docInfo}>
                                                    <span className={styles.docTitle}>{doc.title}</span>
                                                    <span className={styles.docUnit}>{doc.organizationUnit}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={classificationColors[doc.classification] as 'critical' | 'warning' | 'normal'} label={doc.classification} size="sm" />
                                            </td>
                                            <td className={styles.zoneCell}>{doc.currentZone?.name || 'Unknown'}</td>
                                            <td>
                                                <div className={styles.movementInfo}>
                                                    <span>{formatTime(doc.lastMovement)}</span>
                                                    <span className={styles.movementCount}>{doc.movementCount} movements</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.riskScore}>
                                                    <div className={styles.riskBar}>
                                                        <div className={styles.riskFill} style={{ width: `${doc.riskScore * 100}%`, background: doc.riskScore > 0.7 ? 'var(--status-critical)' : doc.riskScore > 0.4 ? 'var(--status-warning)' : 'var(--status-normal)' }} />
                                                    </div>
                                                    <span>{Math.round(doc.riskScore * 100)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.actionBtn} title="View Timeline" onClick={(e) => { e.stopPropagation(); handleViewTimeline(doc); }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                    </button>
                                                    <button className={styles.actionBtn} title="View Details" onClick={(e) => { e.stopPropagation(); handleViewDetails(doc); }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </button>
                                                    <button className={`${styles.actionBtn} ${styles.requestBtn}`} title="Request Movement" onClick={(e) => { e.stopPropagation(); handleRequestMovement(doc); }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} documents
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
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage === pagination.totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Legend */}
                <section className={styles.legend}>
                    <h4>Classification Legend:</h4>
                    <div className={styles.legendItems}>
                        <div className={styles.legendItem}><StatusBadge status="normal" label="PUBLIC" size="sm" /><span>Open access documents</span></div>
                        <div className={styles.legendItem}><StatusBadge status="warning" label="RESTRICTED" size="sm" /><span>Limited access, authorized personnel only</span></div>
                        <div className={styles.legendItem}><StatusBadge status="critical" label="SECRET" size="sm" /><span>Highly sensitive, strict access control</span></div>
                    </div>
                </section>
            </div>

            {/* Document Detail Modal */}
            {showDetailModal && detailDoc && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Document Details</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>RFID Tag</span><code className={styles.detailValue}>{detailDoc.rfidTag}</code></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Classification</span><StatusBadge status={classificationColors[detailDoc.classification] as 'critical' | 'warning' | 'normal'} label={detailDoc.classification} /></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Title</span><span className={styles.detailValue}>{detailDoc.title}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Organization Unit</span><span className={styles.detailValue}>{detailDoc.organizationUnit}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Current Zone</span><span className={styles.detailValue}>{detailDoc.currentZone?.name || 'Unknown'}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Movement Count</span><span className={styles.detailValue}>{detailDoc.movementCount} movements</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Risk Score</span><span className={`${styles.detailValue} ${detailDoc.riskScore > 0.7 ? styles.critical : detailDoc.riskScore > 0.4 ? styles.warning : ''}`}>{Math.round(detailDoc.riskScore * 100)}%</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Last Movement</span><span className={styles.detailValue}>{formatTime(detailDoc.lastMovement)}</span></div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                            <Button variant="primary" onClick={() => { setShowDetailModal(false); handleViewTimeline(detailDoc); }}>View Timeline</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Movement Modal */}
            {showRequestModal && requestDoc && (
                <div className={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Request Document Movement</h2>
                            <button className={styles.closeBtn} onClick={() => setShowRequestModal(false)}>×</button>
                        </div>
                        {requestSuccess ? (
                            <div className={styles.successMessage}>
                                <span className={styles.successIcon}>✓</span>
                                <h3>Permintaan Berhasil Dikirim!</h3>
                                <p>Request ID: <strong>{requestNumber}</strong></p>
                                <p>Lihat status di halaman <strong>Approvals</strong></p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.modalBody}>
                                    <div className={styles.formGroup}>
                                        <label>Document</label>
                                        <div className={styles.docPreview}><code>{requestDoc.rfidTag}</code><span>{requestDoc.title}</span></div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Current Zone</label>
                                        <input type="text" value={requestDoc.currentZone?.name || 'Unknown'} disabled />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Target Zone *</label>
                                        <select value={targetZone} onChange={(e) => setTargetZone(e.target.value)}>
                                            <option value="">-- Select Target Zone --</option>
                                            {zones.filter(z => z.id !== requestDoc.currentZone?.id).map(z => (
                                                <option key={z.id} value={z.id}>{z.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Justification *</label>
                                        <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Jelaskan alasan pemindahan dokumen ini..." rows={3} />
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <Button variant="secondary" onClick={() => setShowRequestModal(false)} disabled={requestLoading}>Cancel</Button>
                                    <Button variant="primary" onClick={submitRequest} disabled={!targetZone || !justification || requestLoading}>
                                        {requestLoading ? 'Mengirim...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Add Document Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Register New Document</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}><label>RFID Tag</label><input type="text" placeholder="ANRI-XXXXXX" /></div>
                            <div className={styles.formGroup}><label>Document Title</label><input type="text" placeholder="Enter document title..." /></div>
                            <div className={styles.formGroup}>
                                <label>Classification</label>
                                <select><option value="PUBLIC">Public</option><option value="RESTRICTED">Restricted</option><option value="SECRET">Secret</option></select>
                            </div>
                            <div className={styles.formGroup}><label>Organization Unit</label><input type="text" placeholder="e.g. Bidang Preservasi" /></div>
                            <div className={styles.formGroup}>
                                <label>Initial Zone</label>
                                <select>{zones.map(z => (<option key={z.id} value={z.id}>{z.name}</option>))}</select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => { setShowAddModal(false); }}>Register Document</Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
