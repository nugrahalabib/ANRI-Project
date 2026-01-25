// API Route: Documents CRUD
// Provides document listing, search, and management

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const classification = searchParams.get('classification');
        const zoneId = searchParams.get('zoneId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where: any = {
            isActive: true,
        };

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { rfidTag: { contains: search } },
                { description: { contains: search } },
            ];
        }

        if (classification && classification !== 'all') {
            where.classification = classification;
        }

        if (zoneId) {
            where.currentZoneId = zoneId;
        }

        // Fetch documents with relations
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                include: {
                    currentZone: {
                        select: { id: true, name: true, code: true, securityLevel: true },
                    },
                    _count: {
                        select: { movements: true, anomalies: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.document.count({ where }),
        ]);

        // Get latest movement for each document
        const documentIds = documents.map(d => d.id);
        const latestMovements = await prisma.documentMovement.findMany({
            where: { documentId: { in: documentIds } },
            orderBy: { timestamp: 'desc' },
            distinct: ['documentId'],
            select: {
                documentId: true,
                timestamp: true,
                riskScore: true,
            },
        });

        const movementMap = new Map(latestMovements.map(m => [m.documentId, m]));

        // Enrich document data
        const enrichedDocuments = documents.map(doc => ({
            id: doc.id,
            rfidTag: doc.rfidTag,
            title: doc.title,
            description: doc.description,
            classification: doc.classification,
            organizationUnit: doc.organizationUnit,
            currentZone: doc.currentZone,
            movementCount: doc._count.movements,
            alertCount: doc._count.anomalies,
            lastMovement: movementMap.get(doc.id)?.timestamp || null,
            riskScore: movementMap.get(doc.id)?.riskScore || 0,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedDocuments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Documents fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { rfidTag, title, description, classification, organizationUnit, currentZoneId } = body;

        // Validate required fields
        if (!rfidTag || !title || !classification || !organizationUnit) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check for duplicate RFID tag
        const existing = await prisma.document.findUnique({
            where: { rfidTag },
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'RFID tag already exists' },
                { status: 409 }
            );
        }

        // Create document
        const document = await prisma.document.create({
            data: {
                rfidTag,
                title,
                description,
                classification,
                organizationUnit,
                currentZoneId,
            },
            include: {
                currentZone: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: document,
        }, { status: 201 });
    } catch (error) {
        console.error('Document create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create document' },
            { status: 500 }
        );
    }
}
