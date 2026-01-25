'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import styles from './page.module.css';

// Report templates - These are static configuration, fetched from database in future

const reportTemplates = [
    {
        id: 'monthly-compliance',
        name: 'Monthly Compliance Report',
        description: 'Comprehensive monthly overview of compliance metrics, policy violations, and audit trail summary.',
        icon: '📊',
        category: 'Compliance',
        lastGenerated: new Date(Date.now() - 7 * 24 * 3600000),
    },
    {
        id: 'incident-summary',
        name: 'Incident Summary Report',
        description: 'Detailed analysis of security incidents including AI explanations and resolution status.',
        icon: '🚨',
        category: 'Security',
        lastGenerated: new Date(Date.now() - 2 * 24 * 3600000),
    },
    {
        id: 'document-movement',
        name: 'Document Movement Report',
        description: 'Track all document movements across zones with risk scores and anomaly flags.',
        icon: '📁',
        category: 'Document Intelligence',
        lastGenerated: new Date(Date.now() - 1 * 24 * 3600000),
    },
    {
        id: 'audit-trail',
        name: 'Audit Trail Export',
        description: 'Complete audit log export with cryptographic verification and chain integrity status.',
        icon: '📝',
        category: 'Governance',
        lastGenerated: null,
    },
    {
        id: 'policy-violations',
        name: 'Policy Violations Report',
        description: 'Summary of all policy violations including DNS blocks, content restrictions, and enforcement actions.',
        icon: '⚠️',
        category: 'Policy',
        lastGenerated: new Date(Date.now() - 14 * 24 * 3600000),
    },
    {
        id: 'executive-briefing',
        name: 'Executive Briefing',
        description: 'High-level risk posture summary designed for executive leadership review.',
        icon: '📈',
        category: 'Executive',
        lastGenerated: new Date(Date.now() - 30 * 24 * 3600000),
    },
];

// Recent reports
const recentReports = [
    {
        id: 'r1',
        name: 'Monthly Compliance Report - December 2024',
        template: 'monthly-compliance',
        generatedAt: new Date(Date.now() - 7 * 24 * 3600000),
        generatedBy: 'Citra Dewi',
        format: 'PDF',
        size: '2.4 MB',
    },
    {
        id: 'r2',
        name: 'Incident Summary - Week 52',
        template: 'incident-summary',
        generatedAt: new Date(Date.now() - 2 * 24 * 3600000),
        generatedBy: 'Ahmad Fauzi',
        format: 'PDF',
        size: '1.8 MB',
    },
    {
        id: 'r3',
        name: 'Document Movement Report - Q4 2024',
        template: 'document-movement',
        generatedAt: new Date(Date.now() - 1 * 24 * 3600000),
        generatedBy: 'System',
        format: 'XLSX',
        size: '5.2 MB',
    },
];

export default function ReportsPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleGenerateReport = async () => {
        if (!selectedTemplate) return;

        setIsGenerating(true);
        try {
            // Fetch real data based on template type
            let data: Record<string, unknown>[] = [];
            let filename = '';
            let headers: string[] = [];

            switch (selectedTemplate) {
                case 'audit-trail':
                    const auditRes = await fetch('/api/audit?limit=1000');
                    const auditJson = await auditRes.json();
                    data = auditJson.data || [];
                    headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User', 'IP Address', 'Signature'];
                    filename = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
                    break;
                case 'policy-violations':
                    const violRes = await fetch('/api/violations?limit=1000');
                    const violJson = await violRes.json();
                    data = violJson.data || [];
                    headers = ['Timestamp', 'User', 'Policy', 'Target', 'Action', 'Severity', 'Device'];
                    filename = `policy-violations-${new Date().toISOString().slice(0, 10)}.csv`;
                    break;
                case 'document-movement':
                    const docRes = await fetch('/api/documents?limit=500');
                    const docJson = await docRes.json();
                    data = docJson.data || [];
                    headers = ['RFID Tag', 'Title', 'Classification', 'Current Zone', 'Movement Count', 'Risk Score'];
                    filename = `document-movement-${new Date().toISOString().slice(0, 10)}.csv`;
                    break;
                default:
                    showToast('Template ini belum tersedia untuk ekspor otomatis.');
                    setIsGenerating(false);
                    return;
            }

            if (data.length === 0) {
                showToast('Tidak ada data untuk diekspor.');
                setIsGenerating(false);
                return;
            }

            // Generate CSV
            const csvRows = [headers.join(',')];
            data.forEach((row: Record<string, unknown>) => {
                const values = headers.map(h => {
                    const key = h.toLowerCase().replace(/ /g, '');
                    let val = row[key] || row[h] || '-';
                    if (typeof val === 'object') val = JSON.stringify(val);
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvRows.push(values.join(','));
            });

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);

            showToast(`✅ Report "${filename}" berhasil diunduh!`);
        } catch (error) {
            console.error('Report generation failed:', error);
            showToast('❌ Gagal membuat laporan. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
            setSelectedTemplate(null);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout
            title="Reports"
            subtitle="Generate Compliance & Analytics Reports"
        >
            <div className={styles.container}>
                {/* Toast */}
                {toast && <div className={styles.toast}>{toast}</div>}
                {/* Report Templates */}
                <section>
                    <h2 className={styles.sectionTitle}>Report Templates</h2>
                    <div className={styles.templatesGrid}>
                        {reportTemplates.map(template => (
                            <div
                                key={template.id}
                                className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.selected : ''}`}
                                onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                            >
                                <div className={styles.templateIcon}>{template.icon}</div>
                                <div className={styles.templateContent}>
                                    <h3 className={styles.templateName}>{template.name}</h3>
                                    <p className={styles.templateDesc}>{template.description}</p>
                                    <div className={styles.templateMeta}>
                                        <span className={styles.templateCategory}>{template.category}</span>
                                        {template.lastGenerated && (
                                            <span className={styles.templateLast}>
                                                Last: {formatDate(template.lastGenerated)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Generate Report Modal/Form */}
                {selectedTemplate && (
                    <Card header="Generate Report">
                        <div className={styles.generateForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className={styles.dateInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className={styles.dateInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>Format</label>
                                    <select className={styles.formatSelect}>
                                        <option value="pdf">PDF</option>
                                        <option value="xlsx">Excel (XLSX)</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSelectedTemplate(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleGenerateReport}
                                    isLoading={isGenerating}
                                >
                                    Generate Report
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Recent Reports */}
                <section>
                    <h2 className={styles.sectionTitle}>Recent Reports</h2>
                    <Card noPadding>
                        <table className={styles.reportsTable}>
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>Generated</th>
                                    <th>By</th>
                                    <th>Format</th>
                                    <th>Size</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReports.map(report => (
                                    <tr key={report.id}>
                                        <td>
                                            <span className={styles.reportName}>{report.name}</span>
                                        </td>
                                        <td className={styles.reportDate}>
                                            {formatDate(report.generatedAt)}
                                        </td>
                                        <td className={styles.reportBy}>{report.generatedBy}</td>
                                        <td>
                                            <span className={`${styles.formatBadge} ${styles[report.format.toLowerCase()]}`}>
                                                {report.format}
                                            </span>
                                        </td>
                                        <td className={styles.reportSize}>{report.size}</td>
                                        <td>
                                            <div className={styles.reportActions}>
                                                <button className={styles.actionBtn} title="Download" onClick={() => showToast('⚠️ Fitur download tersedia untuk laporan yang baru di-generate.')}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </button>
                                                <button className={styles.actionBtn} title="View" onClick={() => showToast('⚠️ Preview hanya tersedia untuk laporan PDF.')}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button className={styles.actionBtn} title="Delete" onClick={() => showToast('⚠️ Hapus laporan tidak tersedia di mode demo.')}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </section>

                {/* Scheduled Reports */}
                <section>
                    <h2 className={styles.sectionTitle}>Scheduled Reports</h2>
                    <Card>
                        <div className={styles.scheduledList}>
                            <div className={styles.scheduledItem}>
                                <div className={styles.scheduledInfo}>
                                    <span className={styles.scheduledName}>Monthly Compliance Report</span>
                                    <span className={styles.scheduledSchedule}>Every 1st of month at 08:00 WIB</span>
                                </div>
                                <div className={styles.scheduledActions}>
                                    <span className={styles.scheduledStatus}>Active</span>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                            <div className={styles.scheduledItem}>
                                <div className={styles.scheduledInfo}>
                                    <span className={styles.scheduledName}>Weekly Incident Summary</span>
                                    <span className={styles.scheduledSchedule}>Every Monday at 09:00 WIB</span>
                                </div>
                                <div className={styles.scheduledActions}>
                                    <span className={styles.scheduledStatus}>Active</span>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                            <div className={styles.addScheduled}>
                                <Button variant="secondary" size="sm">
                                    + Add Scheduled Report
                                </Button>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </DashboardLayout>
    );
}
