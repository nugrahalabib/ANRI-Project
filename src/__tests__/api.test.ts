// API Integration Tests
// Run with: npx jest src/__tests__/api.test.ts

import { NextRequest } from 'next/server';

// Mock Prisma client
jest.mock('@/lib/db/prisma', () => ({
    prisma: {
        document: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
        },
        anomalyAlert: {
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
        },
        documentMovement: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        auditLog: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            findFirst: jest.fn(),
        },
        riskPosture: {
            findFirst: jest.fn(),
        },
        policyViolation: {
            count: jest.fn(),
        },
    },
}));

describe('Dashboard Stats API', () => {
    it('should return aggregated statistics', async () => {
        const { prisma } = require('@/lib/db/prisma');

        // Setup mocks
        prisma.document.count.mockResolvedValue(150);
        prisma.anomalyAlert.findMany.mockResolvedValue([{ documentId: '1' }, { documentId: '2' }]);
        prisma.anomalyAlert.count.mockResolvedValue(7);
        prisma.documentMovement.count.mockResolvedValue(1284);
        prisma.policyViolation.count.mockResolvedValue(23);
        prisma.riskPosture.findFirst.mockResolvedValue({
            overallScore: 42,
            documentRisk: 35,
            digitalRisk: 52,
            complianceRisk: 18,
        });

        // Import and test
        const { GET } = await import('@/app/api/dashboard/stats/route');
        const request = new NextRequest('http://localhost:3000/api/dashboard/stats');

        const response = await GET(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.documents.total).toBe(150);
        expect(data.data.alerts.open).toBe(7);
    });
});

describe('Documents API', () => {
    it('should list documents with pagination', async () => {
        const { prisma } = require('@/lib/db/prisma');

        const mockDocuments = [
            { id: '1', rfidTag: 'ANRI-001', title: 'Test Doc 1', classification: 'PUBLIC' },
            { id: '2', rfidTag: 'ANRI-002', title: 'Test Doc 2', classification: 'SECRET' },
        ];

        prisma.document.findMany.mockResolvedValue(mockDocuments);
        prisma.document.count.mockResolvedValue(2);
        prisma.documentMovement.findMany.mockResolvedValue([]);

        const { GET } = await import('@/app/api/documents/route');
        const request = new NextRequest('http://localhost:3000/api/documents?page=1&limit=20');

        const response = await GET(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(2);
        expect(data.pagination.total).toBe(2);
    });

    it('should filter documents by classification', async () => {
        const { prisma } = require('@/lib/db/prisma');

        const mockDocuments = [
            { id: '1', rfidTag: 'ANRI-001', title: 'Secret Doc', classification: 'SECRET' },
        ];

        prisma.document.findMany.mockResolvedValue(mockDocuments);
        prisma.document.count.mockResolvedValue(1);
        prisma.documentMovement.findMany.mockResolvedValue([]);

        const { GET } = await import('@/app/api/documents/route');
        const request = new NextRequest('http://localhost:3000/api/documents?classification=SECRET');

        const response = await GET(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].classification).toBe('SECRET');
    });
});

describe('Alerts API', () => {
    it('should list alerts with severity filter', async () => {
        const { prisma } = require('@/lib/db/prisma');

        const mockAlerts = [
            {
                id: '1',
                alertType: 'UNAUTHORIZED_ZONE',
                severity: 'CRITICAL',
                status: 'OPEN',
                riskScore: 0.85,
                document: { id: 'd1', rfidTag: 'ANRI-001', title: 'Test' },
            },
        ];

        prisma.anomalyAlert.findMany.mockResolvedValue(mockAlerts);
        prisma.anomalyAlert.count.mockResolvedValue(1);

        const { GET } = await import('@/app/api/alerts/route');
        const request = new NextRequest('http://localhost:3000/api/alerts?severity=CRITICAL');

        const response = await GET(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data[0].severity).toBe('CRITICAL');
    });

    it('should update alert status', async () => {
        const { prisma } = require('@/lib/db/prisma');

        prisma.anomalyAlert.update.mockResolvedValue({
            id: '1',
            status: 'RESOLVED',
            resolvedAt: new Date(),
        });

        const { PATCH } = await import('@/app/api/alerts/route');
        const request = new NextRequest('http://localhost:3000/api/alerts', {
            method: 'PATCH',
            body: JSON.stringify({
                id: '1',
                status: 'RESOLVED',
                resolvedBy: 'user-1',
                resolutionNotes: 'False alarm',
            }),
        });

        const response = await PATCH(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.status).toBe('RESOLVED');
    });
});

describe('Audit Trail API', () => {
    it('should create audit log with cryptographic signature', async () => {
        const { prisma } = require('@/lib/db/prisma');

        prisma.auditLog.findFirst.mockResolvedValue(null);
        prisma.auditLog.create.mockResolvedValue({
            id: 'log-1',
            action: 'DOCUMENT_ACCESSED',
            entityType: 'Document',
            entityId: 'doc-1',
            signature: 'abc123...',
        });

        const { POST } = await import('@/app/api/audit/route');
        const request = new NextRequest('http://localhost:3000/api/audit', {
            method: 'POST',
            body: JSON.stringify({
                action: 'DOCUMENT_ACCESSED',
                entityType: 'Document',
                entityId: 'doc-1',
                userId: 'user-1',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.signature).toBeDefined();
    });
});
