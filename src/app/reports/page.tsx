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

    const handleGenerateReport = async () => {
        if (!selectedTemplate) return;

        setIsGenerating(true);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        setSelectedTemplate(null);
        alert('Report generated successfully! Check your downloads folder.');
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
                                                <button className={styles.actionBtn} title="Download">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                </button>
                                                <button className={styles.actionBtn} title="View">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button className={styles.actionBtn} title="Delete">
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
