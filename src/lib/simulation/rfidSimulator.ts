// RFID Data Simulation Module
// Generates realistic simulated data for development and testing

import { prisma } from '@/lib/db/prisma';
import { DocumentClassification, ReaderType, SecurityLevel } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface SimulationConfig {
    movementsPerHour: number;
    anomalyRate: number; // 0-1, percentage of movements that should be anomalous
    documentCount: number;
    zoneCount: number;
}

const defaultConfig: SimulationConfig = {
    movementsPerHour: 10,
    anomalyRate: 0.15,
    documentCount: 50,
    zoneCount: 8,
};

// Sample zone configurations
const zoneTemplates = [
    { name: 'Ruang Arsip Utama', code: 'ARCH-01', securityLevel: 'STANDARD' as SecurityLevel, floor: 'Lantai 1', building: 'Gedung A' },
    { name: 'Ruang Arsip Rahasia', code: 'ARCH-SEC', securityLevel: 'HIGH_SECURITY' as SecurityLevel, floor: 'Lantai B1', building: 'Gedung A' },
    { name: 'Ruang Baca Publik', code: 'READ-01', securityLevel: 'PUBLIC' as SecurityLevel, floor: 'Lantai 1', building: 'Gedung B' },
    { name: 'Kantor Kearsipan', code: 'OFF-01', securityLevel: 'STANDARD' as SecurityLevel, floor: 'Lantai 2', building: 'Gedung A' },
    { name: 'Ruang Digitalisasi', code: 'DIG-01', securityLevel: 'RESTRICTED' as SecurityLevel, floor: 'Lantai 2', building: 'Gedung B' },
    { name: 'Gudang Penyimpanan', code: 'STOR-01', securityLevel: 'RESTRICTED' as SecurityLevel, floor: 'Lantai B2', building: 'Gedung A' },
    { name: 'Ruang Rapat', code: 'MEET-01', securityLevel: 'STANDARD' as SecurityLevel, floor: 'Lantai 3', building: 'Gedung A' },
    { name: 'Lobby Utama', code: 'LOBBY', securityLevel: 'PUBLIC' as SecurityLevel, floor: 'Lantai 1', building: 'Gedung A' },
];

const organizationUnits = [
    'Bidang Preservasi',
    'Bidang Akuisisi',
    'Bidang Pelayanan',
    'Bidang Sistem Informasi',
    'Sekretariat',
    'Inspektorat',
];

const documentTitles = [
    'Arsip Kepegawaian',
    'Surat Keputusan',
    'Laporan Tahunan',
    'Notulensi Rapat',
    'Dokumen Keuangan',
    'Arsip Sejarah',
    'Perjanjian Kerjasama',
    'Dokumen Regulasi',
    'Arsip Foto',
    'Dokumen Teknis',
];

/**
 * Generate a random RFID tag
 */
function generateRFIDTag(): string {
    const prefix = 'ANRI';
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${random}`;
}

/**
 * Generate a random reader ID
 */
function generateReaderID(): string {
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `RDR-${random}`;
}

/**
 * Initialize zones in database
 */
export async function initializeZones(): Promise<string[]> {
    const zoneIds: string[] = [];

    for (const template of zoneTemplates) {
        const existing = await prisma.zone.findUnique({
            where: { code: template.code },
        });

        if (existing) {
            zoneIds.push(existing.id);
        } else {
            const zone = await prisma.zone.create({
                data: {
                    id: uuidv4(),
                    ...template,
                },
            });
            zoneIds.push(zone.id);
        }
    }

    return zoneIds;
}

/**
 * Initialize RFID readers for zones
 */
export async function initializeReaders(zoneIds: string[]): Promise<string[]> {
    const readerIds: string[] = [];
    const readerTypes: ReaderType[] = ['FIXED', 'MOBILE', 'PORTAL'];

    for (const zoneId of zoneIds) {
        // Create 1-2 readers per zone
        const readerCount = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < readerCount; i++) {
            const readerId = generateReaderID();

            const existing = await prisma.rFIDReader.findUnique({
                where: { readerId },
            });

            if (!existing) {
                const reader = await prisma.rFIDReader.create({
                    data: {
                        readerId,
                        name: `Reader ${readerId}`,
                        type: readerTypes[Math.floor(Math.random() * readerTypes.length)],
                        zoneId,
                        isOnline: Math.random() > 0.1, // 90% online
                        lastPing: new Date(),
                    },
                });
                readerIds.push(reader.id);
            }
        }
    }

    return readerIds;
}

/**
 * Create sample documents
 */
export async function createSampleDocuments(
    zoneIds: string[],
    count: number = 50
): Promise<string[]> {
    const documentIds: string[] = [];
    const classifications: DocumentClassification[] = ['PUBLIC', 'RESTRICTED', 'SECRET'];
    const classificationWeights = [0.5, 0.35, 0.15]; // 50% public, 35% restricted, 15% secret

    for (let i = 0; i < count; i++) {
        const random = Math.random();
        let classification: DocumentClassification = 'PUBLIC';
        let cumulative = 0;

        for (let j = 0; j < classifications.length; j++) {
            cumulative += classificationWeights[j];
            if (random < cumulative) {
                classification = classifications[j];
                break;
            }
        }

        const titleBase = documentTitles[Math.floor(Math.random() * documentTitles.length)];
        const year = 2020 + Math.floor(Math.random() * 5);
        const number = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

        const document = await prisma.document.create({
            data: {
                rfidTag: generateRFIDTag(),
                title: `${titleBase} ${year}/${number}`,
                description: `Dokumen ${titleBase.toLowerCase()} tahun ${year}`,
                classification,
                organizationUnit: organizationUnits[Math.floor(Math.random() * organizationUnits.length)],
                currentZoneId: zoneIds[Math.floor(Math.random() * zoneIds.length)],
            },
        });

        documentIds.push(document.id);
    }

    return documentIds;
}

/**
 * Simulate a single document movement
 */
export async function simulateMovement(
    documentId: string,
    zoneIds: string[],
    isAnomaly: boolean = false
): Promise<void> {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { currentZone: true },
    });

    if (!document) return;

    const fromZoneId = document.currentZoneId;
    let toZoneId: string;

    if (isAnomaly) {
        // For anomalies, pick a zone that might be inappropriate
        // E.g., SECRET document going to PUBLIC zone
        const publicZones = await prisma.zone.findMany({
            where: { securityLevel: 'PUBLIC' },
            select: { id: true },
        });

        if (publicZones.length > 0 && document.classification === 'SECRET') {
            toZoneId = publicZones[Math.floor(Math.random() * publicZones.length)].id;
        } else {
            toZoneId = zoneIds[Math.floor(Math.random() * zoneIds.length)];
        }
    } else {
        // Normal movement - pick a random different zone
        const otherZones = zoneIds.filter((z) => z !== fromZoneId);
        toZoneId = otherZones[Math.floor(Math.random() * otherZones.length)];
    }

    // Get a reader from the target zone
    const readers = await prisma.rFIDReader.findMany({
        where: { zoneId: toZoneId, isOnline: true },
        select: { id: true },
    });

    if (readers.length === 0) return;

    const readerId = readers[Math.floor(Math.random() * readers.length)].id;

    // Create the movement record
    await prisma.documentMovement.create({
        data: {
            documentId,
            fromZoneId,
            toZoneId,
            readerId,
            isAuthorized: !isAnomaly,
            riskScore: isAnomaly ? Math.random() * 0.5 + 0.3 : Math.random() * 0.2,
        },
    });

    // Update document's current zone
    await prisma.document.update({
        where: { id: documentId },
        data: { currentZoneId: toZoneId },
    });
}

/**
 * Run continuous simulation
 */
export async function runSimulation(
    durationMinutes: number = 60,
    config: Partial<SimulationConfig> = {}
): Promise<{ movementsCreated: number; anomaliesCreated: number }> {
    const cfg = { ...defaultConfig, ...config };

    // Initialize zones and readers
    const zoneIds = await initializeZones();
    await initializeReaders(zoneIds);

    // Get or create documents
    let documentIds = (await prisma.document.findMany({ select: { id: true } })).map((d) => d.id);

    if (documentIds.length < cfg.documentCount) {
        const newIds = await createSampleDocuments(zoneIds, cfg.documentCount - documentIds.length);
        documentIds = [...documentIds, ...newIds];
    }

    // Calculate movements
    const totalMovements = Math.floor((durationMinutes / 60) * cfg.movementsPerHour);
    let movementsCreated = 0;
    let anomaliesCreated = 0;

    for (let i = 0; i < totalMovements; i++) {
        const docId = documentIds[Math.floor(Math.random() * documentIds.length)];
        const isAnomaly = Math.random() < cfg.anomalyRate;

        await simulateMovement(docId, zoneIds, isAnomaly);

        movementsCreated++;
        if (isAnomaly) anomaliesCreated++;
    }

    return { movementsCreated, anomaliesCreated };
}

/**
 * Generate historical data for the past N days
 */
export async function generateHistoricalData(days: number = 30): Promise<void> {
    const zoneIds = await initializeZones();
    await initializeReaders(zoneIds);

    let documentIds = (await prisma.document.findMany({ select: { id: true } })).map((d) => d.id);

    if (documentIds.length < 50) {
        const newIds = await createSampleDocuments(zoneIds, 50);
        documentIds = [...documentIds, ...newIds];
    }

    // Generate movements spread over the past N days
    const now = new Date();
    const movementsPerDay = Math.floor(Math.random() * 20) + 10; // 10-30 movements per day

    for (let day = 0; day < days; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);

        for (let m = 0; m < movementsPerDay; m++) {
            const docId = documentIds[Math.floor(Math.random() * documentIds.length)];
            const isAnomaly = Math.random() < 0.1; // 10% anomaly rate for historical

            // Random hour between 8 and 18 (business hours)
            const hour = Math.floor(Math.random() * 10) + 8;
            const minute = Math.floor(Math.random() * 60);
            date.setHours(hour, minute, 0, 0);

            const document = await prisma.document.findUnique({
                where: { id: docId },
            });

            if (!document) continue;

            const fromZoneId = document.currentZoneId;
            const otherZones = zoneIds.filter((z) => z !== fromZoneId);
            const toZoneId = otherZones[Math.floor(Math.random() * otherZones.length)];

            const readers = await prisma.rFIDReader.findMany({
                where: { zoneId: toZoneId },
                select: { id: true },
            });

            if (readers.length === 0) continue;

            await prisma.documentMovement.create({
                data: {
                    documentId: docId,
                    fromZoneId,
                    toZoneId,
                    readerId: readers[0].id,
                    isAuthorized: !isAnomaly,
                    riskScore: isAnomaly ? Math.random() * 0.5 + 0.3 : Math.random() * 0.2,
                    timestamp: date,
                },
            });
        }
    }
}
