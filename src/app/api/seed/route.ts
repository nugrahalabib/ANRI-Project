// Comprehensive Seed API Route - Presidential Demo
// Creates 1000+ realistic records across all use cases

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

function randomDate(daysAgo: number): Date {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function generateSignature(data: string): string {
    return crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
}

function generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// DATA DEFINITIONS
const usersData = [
    { email: 'budi.santoso@anri.go.id', name: 'Dr. Ir. Budi Santoso, M.Sc.', role: 'EXECUTIVE' as const, department: 'Direktorat Utama' },
    { email: 'ahmad.fauzi@anri.go.id', name: 'Ahmad Fauzi, S.Kom.', role: 'IT_SECURITY' as const, department: 'Unit IT' },
    { email: 'citra.dewi@anri.go.id', name: 'Citra Dewi, S.H., M.H.', role: 'COMPLIANCE_OFFICER' as const, department: 'Kepatuhan' },
    { email: 'rina.wulandari@anri.go.id', name: 'Rina Wulandari, S.T.', role: 'SYSTEM_ADMIN' as const, department: 'Unit IT' },
    { email: 'hendra.wijaya@anri.go.id', name: 'Hendra Wijaya, S.Ars.', role: 'COMPLIANCE_OFFICER' as const, department: 'Preservasi' },
    { email: 'maya.kusuma@anri.go.id', name: 'Maya Kusuma, S.Kom., CISSP', role: 'IT_SECURITY' as const, department: 'NSOC' },
    { email: 'dimas.pratama@anri.go.id', name: 'Dimas Pratama, A.Md.', role: 'COMPLIANCE_OFFICER' as const, department: 'Kearsipan' },
    { email: 'siti.nurhaliza@anri.go.id', name: 'Prof. Dr. Siti Nurhaliza, M.A.', role: 'EXECUTIVE' as const, department: 'Manajemen' },
    { email: 'agus.setiawan@anri.go.id', name: 'Agus Setiawan, S.Kom.', role: 'IT_SECURITY' as const, department: 'Unit IT' },
    { email: 'putri.handayani@anri.go.id', name: 'Putri Handayani, S.E., Ak.', role: 'COMPLIANCE_OFFICER' as const, department: 'Audit' },
];

const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY' as const, floor: 'Lantai 2', building: 'Gedung A', description: 'Penyimpanan arsip RAHASIA' },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED' as const, floor: 'Lantai 1', building: 'Gedung A', description: 'Ruang digitalisasi' },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan', securityLevel: 'STANDARD' as const, floor: 'Lantai 1', building: 'Gedung B', description: 'Kantor kearsipan' },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY' as const, floor: 'Lantai 3', building: 'Gedung B', description: 'Ruang rapat VIP' },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan', securityLevel: 'RESTRICTED' as const, floor: 'Basement', building: 'Gedung C', description: 'Gudang arsip' },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC' as const, floor: 'Lantai Dasar', building: 'Gedung A', description: 'Lobby' },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC' as const, floor: 'Lantai 1', building: 'Gedung A', description: 'Ruang baca' },
    { code: 'ZONA-S1', name: 'Ruang Server', securityLevel: 'HIGH_SECURITY' as const, floor: 'Basement', building: 'Gedung C', description: 'Data center' },
];

const rfidReadersData = [
    { readerId: 'RDR-1001', name: 'Portal Utama', type: 'PORTAL' as const, zoneCode: 'ZONA-L1', isOnline: true },
    { readerId: 'RDR-1002', name: 'Fixed Arsip', type: 'FIXED' as const, zoneCode: 'ZONA-A1', isOnline: true },
    { readerId: 'RDR-1003', name: 'Mobile Digitalisasi', type: 'MOBILE' as const, zoneCode: 'ZONA-A2', isOnline: true },
    { readerId: 'RDR-1004', name: 'Portal Gudang', type: 'PORTAL' as const, zoneCode: 'ZONA-C1', isOnline: false },
    { readerId: 'RDR-1005', name: 'Fixed Kearsipan', type: 'FIXED' as const, zoneCode: 'ZONA-B1', isOnline: true },
    { readerId: 'RDR-1006', name: 'Portal VIP', type: 'PORTAL' as const, zoneCode: 'ZONA-B2', isOnline: true },
    { readerId: 'RDR-1007', name: 'Fixed Baca', type: 'FIXED' as const, zoneCode: 'ZONA-R1', isOnline: true },
    { readerId: 'RDR-1008', name: 'Portal Server', type: 'PORTAL' as const, zoneCode: 'ZONA-S1', isOnline: true },
];

const documentsData = [
    // SECRET (10)
    { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET' as const, orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P3Q7R1', title: 'Dokumen Intelijen Keamanan Negara', classification: 'SECRET' as const, orgUnit: 'BIN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-K2L4W9', title: 'SK Presiden No. 45/2024', classification: 'SECRET' as const, orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-M5N8V4', title: 'Perjanjian Bilateral Pertahanan', classification: 'SECRET' as const, orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-J7H2F6', title: 'Laporan Audit BPK Khusus', classification: 'SECRET' as const, orgUnit: 'BPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-T9Y3B5', title: 'Strategi Nasional Cybersecurity', classification: 'SECRET' as const, orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-R4S8D2', title: 'Arsip Rapat Kabinet Terbatas', classification: 'SECRET' as const, orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-G6E1C7', title: 'Dokumen Investigasi KPK', classification: 'SECRET' as const, orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-U8I5O3', title: 'Rencana Operasi Militer', classification: 'SECRET' as const, orgUnit: 'TNI', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-Z1A4Q9', title: 'Negosiasi Perdagangan FTA', classification: 'SECRET' as const, orgUnit: 'Kemendag', zoneCode: 'ZONA-A1' },
    // RESTRICTED (20)
    { rfidTag: 'ANRI-B2C5D8', title: 'SK Pengangkatan Eselon III', classification: 'RESTRICTED' as const, orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-E3F6G9', title: 'Laporan Keuangan Q4 2024', classification: 'RESTRICTED' as const, orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H4I7J1', title: 'Perjanjian Kerjasama UNESCO', classification: 'RESTRICTED' as const, orgUnit: 'Humas', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-K5L8M2', title: 'Dokumen Tender Renovasi', classification: 'RESTRICTED' as const, orgUnit: 'Bagian Umum', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-N6O9P3', title: 'Arsip Rapat Koordinasi', classification: 'RESTRICTED' as const, orgUnit: 'Sekretariat', zoneCode: 'ZONA-B2' },
    { rfidTag: 'ANRI-Q7R1S4', title: 'Laporan Evaluasi Kinerja', classification: 'RESTRICTED' as const, orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-T8U2V5', title: 'Dokumen SOP', classification: 'RESTRICTED' as const, orgUnit: 'Organisasi', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-W9X3Y6', title: 'Arsip Sengketa Kepegawaian', classification: 'RESTRICTED' as const, orgUnit: 'Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-A1B4C7', title: 'Laporan Inventarisasi Aset', classification: 'RESTRICTED' as const, orgUnit: 'Keuangan', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-D2E5F8', title: 'Perencanaan Strategis 2025', classification: 'RESTRICTED' as const, orgUnit: 'Perencanaan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-G3H6I9', title: 'SK Mutasi Pegawai', classification: 'RESTRICTED' as const, orgUnit: 'Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-J4K7L1', title: 'Kontrak Pengadaan Server', classification: 'RESTRICTED' as const, orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-M5N8O2', title: 'Laporan Audit Internal', classification: 'RESTRICTED' as const, orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-P6Q9R3', title: 'Dokumen Akreditasi Lab', classification: 'RESTRICTED' as const, orgUnit: 'Lab Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-S7T1U4', title: 'Arsip Whistleblower', classification: 'RESTRICTED' as const, orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-V8W2X5', title: 'MoU Arsip Belanda', classification: 'RESTRICTED' as const, orgUnit: 'Kerjasama', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-Y9Z3A6', title: 'Laporan SDM 2024', classification: 'RESTRICTED' as const, orgUnit: 'Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-B1C4D7', title: 'Sertifikasi ISO 27001', classification: 'RESTRICTED' as const, orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-E2F5G8', title: 'SK Tunjangan Kinerja', classification: 'RESTRICTED' as const, orgUnit: 'Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H3I6J9', title: 'Perjanjian Hibah Jepang', classification: 'RESTRICTED' as const, orgUnit: 'Kerjasama', zoneCode: 'ZONA-A2' },
    // PUBLIC (20)
    { rfidTag: 'ANRI-K4L7M1', title: 'Pengumuman CPNS 2024', classification: 'PUBLIC' as const, orgUnit: 'Kepegawaian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-N5O8P2', title: 'Surat Edaran No. 01/2024', classification: 'PUBLIC' as const, orgUnit: 'Sekretariat', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Q6R9S3', title: 'Laporan Tahunan 2023', classification: 'PUBLIC' as const, orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-T7U1V4', title: 'Pedoman Kearsipan', classification: 'PUBLIC' as const, orgUnit: 'Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-W8X2Y5', title: 'Katalog Arsip Kolonial', classification: 'PUBLIC' as const, orgUnit: 'Preservasi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Z9A3B6', title: 'Majalah Arsip Nasional', classification: 'PUBLIC' as const, orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-C1D4E7', title: 'Prosiding Konferensi', classification: 'PUBLIC' as const, orgUnit: 'Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-F2G5H8', title: 'Brosur Layanan ANRI', classification: 'PUBLIC' as const, orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-I3J6K9', title: 'Peraturan ANRI No. 5', classification: 'PUBLIC' as const, orgUnit: 'Hukum', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-L4M7N1', title: 'Standar Deskripsi Arsip', classification: 'PUBLIC' as const, orgUnit: 'Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-O5P8Q2', title: 'Panduan Digitalisasi', classification: 'PUBLIC' as const, orgUnit: 'Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-R6S9T3', title: 'Katalog Pameran', classification: 'PUBLIC' as const, orgUnit: 'Layanan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-U7V1W4', title: 'Survei Kepuasan 2024', classification: 'PUBLIC' as const, orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-X8Y2Z5', title: 'Direktori Kearsipan', classification: 'PUBLIC' as const, orgUnit: 'Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-A9B3C6', title: 'Modul Pelatihan', classification: 'PUBLIC' as const, orgUnit: 'Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-D1E4F7', title: 'Jurnal Kearsipan', classification: 'PUBLIC' as const, orgUnit: 'Kajian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-G2H5I8', title: 'Daftar Arsip Statis', classification: 'PUBLIC' as const, orgUnit: 'Akuisisi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-J3K6L9', title: 'Formulir Permohonan', classification: 'PUBLIC' as const, orgUnit: 'Layanan', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-M4N7O1', title: 'Kalender Event', classification: 'PUBLIC' as const, orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-P5Q8R2', title: 'Infografis Statistik', classification: 'PUBLIC' as const, orgUnit: 'Pusat Data', zoneCode: 'ZONA-R1' },
];

const policyRulesData = [
    { name: 'Block Gambling Sites', description: 'Blokir judi online', category: 'DNS_BLOCK' as const, pattern: '*.bet365*,*.poker*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 10 },
    { name: 'Block Adult Content', description: 'Blokir konten dewasa', category: 'DNS_BLOCK' as const, pattern: '*.porn*,*.adult*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 10 },
    { name: 'Restrict Social Media', description: 'Batasi media sosial', category: 'URL_FILTER' as const, pattern: '*facebook*,*instagram*', action: 'WARN' as const, severity: 'MEDIUM' as const, priority: 50 },
    { name: 'Block Video Streaming', description: 'Blokir streaming', category: 'CONTENT_RESTRICTION' as const, pattern: '*netflix*,*youtube*', action: 'WARN' as const, severity: 'LOW' as const, priority: 60 },
    { name: 'Block Gaming Sites', description: 'Blokir gaming', category: 'TIME_RESTRICTION' as const, pattern: '*steam*,*epicgames*', action: 'BLOCK' as const, severity: 'HIGH' as const, priority: 30 },
    { name: 'Block Torrent', description: 'Blokir torrent', category: 'APPLICATION_CONTROL' as const, pattern: '*torrent*,*piratebay*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 10 },
    { name: 'Limit Downloads', description: 'Log download besar', category: 'BANDWIDTH_LIMIT' as const, pattern: '*.iso,*.zip', action: 'LOG_ONLY' as const, severity: 'LOW' as const, priority: 80 },
    { name: 'Block Crypto Mining', description: 'Blokir mining', category: 'APPLICATION_CONTROL' as const, pattern: '*coinhive*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 10 },
    { name: 'Block Proxy/VPN', description: 'Blokir proxy', category: 'APPLICATION_CONTROL' as const, pattern: '*vpn*,*proxy*', action: 'BLOCK' as const, severity: 'HIGH' as const, priority: 20 },
    { name: 'Block File Sharing', description: 'Blokir file sharing', category: 'URL_FILTER' as const, pattern: '*dropbox*,*mega*', action: 'WARN' as const, severity: 'MEDIUM' as const, priority: 40 },
    { name: 'Block Malware', description: 'Blokir malware', category: 'DNS_BLOCK' as const, pattern: '*.malware*,*.phishing*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 5 },
    { name: 'Restrict Job Sites', description: 'Batasi job portal', category: 'URL_FILTER' as const, pattern: '*jobstreet*,*indeed*', action: 'LOG_ONLY' as const, severity: 'LOW' as const, priority: 70 },
    { name: 'Block Webmail', description: 'Blokir webmail eksternal', category: 'URL_FILTER' as const, pattern: '*mail.google*,*outlook*', action: 'WARN' as const, severity: 'MEDIUM' as const, priority: 45 },
    { name: 'Block Shopping', description: 'Batasi e-commerce', category: 'CONTENT_RESTRICTION' as const, pattern: '*tokopedia*,*shopee*', action: 'LOG_ONLY' as const, severity: 'LOW' as const, priority: 75 },
    { name: 'Block Sports Betting', description: 'Blokir taruhan olahraga', category: 'DNS_BLOCK' as const, pattern: '*sbobet*,*maxbet*', action: 'BLOCK' as const, severity: 'CRITICAL' as const, priority: 10 },
];

export async function GET() {
    const startTime = Date.now();

    try {
        console.log('🚀 Starting comprehensive database seed...');

        // Clear existing data
        await prisma.auditLog.deleteMany();
        await prisma.policyViolation.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.anomalyAlert.deleteMany();
        await prisma.documentMovement.deleteMany();
        await prisma.documentBaseline.deleteMany();
        await prisma.document.deleteMany();
        await prisma.rFIDReader.deleteMany();
        await prisma.zoneAccessPermission.deleteMany();
        await prisma.zone.deleteMany();
        await prisma.policyRule.deleteMany();
        await prisma.deviceStatus.deleteMany();
        await prisma.kPIMetric.deleteMany();
        await prisma.riskPosture.deleteMany();
        await prisma.session.deleteMany();
        // Clear new compliance tables
        await prisma.complianceMetric.deleteMany();
        await prisma.auditSchedule.deleteMany();
        await prisma.policyAcknowledgment.deleteMany();
        await prisma.regulation.deleteMany();
        await prisma.user.deleteMany();

        // 1. Create Users
        const users: Record<string, { id: string }> = {};
        for (const userData of usersData) {
            const passwordHash = await bcrypt.hash('Demo2024!', 12);
            const user = await prisma.user.create({
                data: { ...userData, passwordHash, isActive: true },
            });
            users[userData.email] = { id: user.id };
        }

        // 2. Create Zones
        const zones: Record<string, { id: string }> = {};
        for (const zoneData of zonesData) {
            const zone = await prisma.zone.create({
                data: { ...zoneData, isActive: true },
            });
            zones[zoneData.code] = { id: zone.id };
        }

        // 3. Create RFID Readers
        const readers: Record<string, { id: string }> = {};
        for (const readerData of rfidReadersData) {
            const reader = await prisma.rFIDReader.create({
                data: {
                    readerId: readerData.readerId,
                    name: readerData.name,
                    type: readerData.type,
                    zoneId: zones[readerData.zoneCode].id,
                    isOnline: readerData.isOnline,
                    lastPing: readerData.isOnline ? new Date() : randomDate(1),
                },
            });
            readers[readerData.readerId] = { id: reader.id };
        }

        // 4. Create Documents with Baselines
        const documents: Record<string, { id: string; classification: string }> = {};
        for (const docData of documentsData) {
            const document = await prisma.document.create({
                data: {
                    rfidTag: docData.rfidTag,
                    title: docData.title,
                    description: `Dokumen: ${docData.title}`,
                    classification: docData.classification,
                    organizationUnit: docData.orgUnit,
                    currentZoneId: zones[docData.zoneCode].id,
                    isActive: true,
                },
            });

            const allowedZones = docData.classification === 'SECRET'
                ? JSON.stringify([zones['ZONA-A1'].id])
                : docData.classification === 'RESTRICTED'
                    ? JSON.stringify([zones['ZONA-A1'].id, zones['ZONA-A2'].id, zones['ZONA-B1'].id])
                    : JSON.stringify(Object.values(zones).map(z => z.id));

            await prisma.documentBaseline.create({
                data: {
                    documentId: document.id,
                    normalHoursStart: 8,
                    normalHoursEnd: 17,
                    allowedZones,
                    typicalMovementFreq: Math.random() * 3 + 0.5,
                    featureVector: JSON.stringify({}),
                    modelVersion: 'v1.2.0',
                    lastTrainedAt: randomDate(7),
                    confidenceScore: 0.85 + Math.random() * 0.14,
                },
            });

            documents[docData.rfidTag] = { id: document.id, classification: docData.classification };
        }

        // 5. Create Document Movements (100+)
        const zoneList = Object.values(zones);
        const readerList = Object.values(readers);
        const docList = Object.entries(documents);
        const movements: Array<{ id: string; isAnomaly: boolean; docId: string; classification: string; timestamp: Date }> = [];

        for (let i = 0; i < 120; i++) {
            const [, doc] = docList[Math.floor(Math.random() * docList.length)];
            const fromZone = zoneList[Math.floor(Math.random() * zoneList.length)];
            const toZone = zoneList[Math.floor(Math.random() * zoneList.length)];
            const reader = readerList[Math.floor(Math.random() * readerList.length)];
            const isAnomaly = Math.random() < 0.2;
            const timestamp = randomDate(30);

            const movement = await prisma.documentMovement.create({
                data: {
                    documentId: doc.id,
                    fromZoneId: fromZone.id,
                    toZoneId: toZone.id,
                    readerId: reader.id,
                    isAuthorized: !isAnomaly,
                    riskScore: isAnomaly ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
                    timestamp,
                },
            });
            movements.push({ id: movement.id, isAnomaly, docId: doc.id, classification: doc.classification, timestamp });
        }

        // 6. Create Anomaly Alerts with REALISTIC SCENARIOS for Presidential Demo
        const alertScenarios = [
            {
                type: 'UNAUTHORIZED_ZONE' as const,
                severity: 'CRITICAL' as const,
                explanation: 'PERINGATAN KEAMANAN TINGKAT TINGGI: Dokumen klasifikasi RAHASIA NEGARA terdeteksi di zona PUBLIK (Lobby Utama). Analisis pola menunjukkan deviasi 94% dari baseline perilaku normal. Sistem AI mendeteksi potensi percobaan eksfiltrasi data. Dokumen ini seharusnya tidak pernah meninggalkan Ruang Arsip Rahasia.',
                factors: [{ factor: 'Zone Security Mismatch', weight: 0.85 }, { factor: 'Classification Violation', weight: 0.92 }],
            },
            {
                type: 'UNAUTHORIZED_ZONE' as const,
                severity: 'CRITICAL' as const,
                explanation: 'ANOMALI TERDETEKSI: Dokumen investigasi KPK berpindah ke zona tanpa otorisasi. Korelasi temporal menunjukkan akses terjadi 15 menit setelah jam kerja berakhir. Confidence level: 96%. Rekomendasi: Immediate lockdown zona dan verifikasi identitas terakhir.',
                factors: [{ factor: 'Unauthorized Movement', weight: 0.96 }, { factor: 'Time-based Anomaly', weight: 0.78 }],
            },
            {
                type: 'AFTER_HOURS_ACCESS' as const,
                severity: 'HIGH' as const,
                explanation: 'AKSES DI LUAR JAM KERJA: Dokumen Strategi Nasional Cybersecurity diakses pada pukul 23:47 WIB. Tidak ada izin lembur tercatat. Pattern recognition mendeteksi 3 kejadian serupa dalam 14 hari terakhir oleh pengguna yang sama. Profil risiko insider threat: TINGGI.',
                factors: [{ factor: 'After-Hours Access', weight: 0.88 }, { factor: 'Repeated Pattern', weight: 0.72 }],
            },
            {
                type: 'AFTER_HOURS_ACCESS' as const,
                severity: 'HIGH' as const,
                explanation: 'ALERT: Arsip Rapat Kabinet Terbatas diakses pada dini hari (02:15 WIB). Lokasi akses: Ruang Server. Tidak ada jadwal maintenance terdaftar. Machine learning model mendeteksi anomali dengan confidence 91%. Aktivitas ini menunjukkan pola yang tidak konsisten dengan operasi normal.',
                factors: [{ factor: 'Unusual Time Access', weight: 0.91 }, { factor: 'Location Mismatch', weight: 0.67 }],
            },
            {
                type: 'UNUSUAL_FREQUENCY' as const,
                severity: 'HIGH' as const,
                explanation: 'FREKUENSI ANOMALI: Dokumen Perjanjian Bilateral Pertahanan mengalami 28 pergerakan dalam 24 jam terakhir. Baseline normal: 2 pergerakan/hari. Peningkatan 1400% mengindikasikan potensi duplikasi tidak sah atau scanning massal. Analisis dwell-time menunjukkan dokumen berada di zona non-designated selama 340% lebih lama dari normal.',
                factors: [{ factor: 'Frequency Spike', weight: 0.94 }, { factor: 'Dwell Time Anomaly', weight: 0.81 }],
            },
            {
                type: 'UNUSUAL_FREQUENCY' as const,
                severity: 'MEDIUM' as const,
                explanation: 'POLA TIDAK BIASA: Laporan Audit BPK Khusus diakses dengan frekuensi tinggi (18x dalam 12 jam). Analisis menunjukkan akses dari 4 device berbeda. Kemungkinan: koordinasi investigasi internal ATAU sharing kredensial tidak sah. Memerlukan verifikasi manual.',
                factors: [{ factor: 'Multi-device Access', weight: 0.76 }, { factor: 'High Frequency', weight: 0.82 }],
            },
            {
                type: 'PATTERN_DEVIATION' as const,
                severity: 'CRITICAL' as const,
                explanation: 'DEVIASI PERILAKU EKSTREM: SK Presiden No. 45/2024 menunjukkan pola pergerakan yang menyimpang 87% dari baseline. Dokumen berpindah melalui 7 zona dalam 2 jam - sangat tidak konsisten dengan prosedur penanganan dokumen RAHASIA. Neural network classifier mengidentifikasi ini sebagai potential data breach attempt.',
                factors: [{ factor: 'Behavioral Deviation', weight: 0.87 }, { factor: 'Multi-zone Traversal', weight: 0.79 }],
            },
            {
                type: 'RAPID_MOVEMENT' as const,
                severity: 'MEDIUM' as const,
                explanation: 'TRANSIT CEPAT: Dokumen MoU Arsip Belanda tercatat berpindah antar 5 zona dalam waktu 8 menit. Kecepatan pergerakan ini mengindikasikan: (1) Pengangkutan batch yang tidak terjadwal, ATAU (2) Bypass prosedur check-in/check-out. Anomaly score: 67%. Diperlukan konfirmasi petugas lapangan.',
                factors: [{ factor: 'Rapid Transit', weight: 0.67 }, { factor: 'Procedure Bypass', weight: 0.54 }],
            },
            {
                type: 'UNAUTHORIZED_ZONE' as const,
                severity: 'CRITICAL' as const,
                explanation: 'BREACH PROTOKOL: Dokumen Intelijen Keamanan Negara dari BIN terdeteksi di Ruang Baca Publik. Ini merupakan PELANGGARAN SERIUS protokol keamanan nasional. Sistem telah menginisiasi lockdown zona otomatis. Eskalasi ke BSSN direkomendasikan dalam 10 menit jika tidak ada resolusi.',
                factors: [{ factor: 'Critical Zone Violation', weight: 0.98 }, { factor: 'National Security Risk', weight: 0.95 }],
            },
            {
                type: 'AFTER_HOURS_ACCESS' as const,
                severity: 'CRITICAL' as const,
                explanation: 'AKSES MENCURIGAKAN: Rencana Operasi Militer TNI diakses pada pukul 04:30 WIB dari terminal yang biasanya tidak aktif. IP forensics menunjukkan koneksi dari subnet yang berbeda dari profil pengguna biasa. Deep learning anomaly detection confidence: 94%. IMMEDIATE ACTION REQUIRED.',
                factors: [{ factor: 'Suspicious IP Pattern', weight: 0.94 }, { factor: 'Terminal Anomaly', weight: 0.89 }],
            },
        ];

        const anomalyMovements = movements.filter(m => m.isAnomaly).slice(0, alertScenarios.length);

        for (let i = 0; i < anomalyMovements.length; i++) {
            const mov = anomalyMovements[i];
            const scenario = alertScenarios[i % alertScenarios.length];

            // Calculate risk score based on severity
            const riskScore = scenario.severity === 'CRITICAL'
                ? 0.80 + Math.random() * 0.18  // CRITICAL: 80-98%
                : scenario.severity === 'HIGH'
                    ? 0.60 + Math.random() * 0.20  // HIGH: 60-80%
                    : 0.40 + Math.random() * 0.20; // MEDIUM: 40-60%

            // Confidence correlates with risk - high risk means AI is more certain
            const confidence = Math.min(0.99, riskScore + (Math.random() * 0.10 - 0.05));

            await prisma.anomalyAlert.create({
                data: {
                    documentId: mov.docId,
                    movementId: mov.id,
                    alertType: scenario.type,
                    severity: scenario.severity,
                    riskScore,
                    explanation: scenario.explanation,
                    contributingFactors: JSON.stringify(scenario.factors),
                    confidence,
                    status: ['OPEN', 'INVESTIGATING', 'OPEN', 'OPEN'][Math.floor(Math.random() * 4)] as 'OPEN' | 'INVESTIGATING' | 'RESOLVED',
                    createdAt: mov.timestamp,
                },
            });
        }

        // 7. Create Policy Rules
        const policies: Record<string, { id: string; pattern: string; action: string; severity: string }> = {};
        for (const policyData of policyRulesData) {
            const policy = await prisma.policyRule.create({
                data: { ...policyData, isActive: true },
            });
            policies[policyData.name] = { id: policy.id, pattern: policyData.pattern, action: policyData.action, severity: policyData.severity };
        }

        // 8. Create Policy Violations (200+)
        const violationTargets = ['facebook.com', 'instagram.com', 'bet365.com', 'youtube.com', 'steam.com'];
        const userList = Object.values(users);
        const policyList = Object.values(policies);

        for (let i = 0; i < 220; i++) {
            const policy = policyList[Math.floor(Math.random() * policyList.length)];
            const user = userList[Math.floor(Math.random() * userList.length)];
            const target = violationTargets[Math.floor(Math.random() * violationTargets.length)];

            await prisma.policyViolation.create({
                data: {
                    policyId: policy.id,
                    userId: user.id,
                    deviceId: `WS-${String(Math.floor(Math.random() * 300) + 1).padStart(3, '0')}`,
                    ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                    requestUrl: `https://${target}/page`,
                    dnsQuery: target,
                    matchedPattern: policy.pattern.split(',')[0],
                    actionTaken: policy.action as 'BLOCK' | 'WARN' | 'LOG_ONLY' | 'SUSPEND_ACCESS' | 'ISOLATE_DEVICE',
                    severity: policy.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
                    userNotified: Math.random() > 0.3,
                    metadata: JSON.stringify({ browser: 'Chrome', os: 'Windows' }),
                    timestamp: randomDate(30),
                },
            });
        }

        // 9. Create Device Status (30)
        const deviceStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED', 'ISOLATED', 'OFFLINE'] as const;
        for (let i = 1; i <= 30; i++) {
            const status = deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)];
            await prisma.deviceStatus.create({
                data: {
                    deviceId: `WS-${String(i).padStart(3, '0')}`,
                    hostname: `ANRI-PC-${String(i).padStart(3, '0')}`,
                    ipAddress: `192.168.1.${100 + i}`,
                    macAddress: `00:1A:2B:${(i * 3).toString(16).toUpperCase().padStart(2, '0')}:${(i * 5).toString(16).toUpperCase().padStart(2, '0')}:${(i * 7).toString(16).toUpperCase().padStart(2, '0')}`,
                    status: status,
                    isolatedAt: status === 'ISOLATED' ? randomDate(5) : null,
                    isolationReason: status === 'ISOLATED' ? 'Multiple violations' : null,
                    lastSeen: status === 'OFFLINE' ? randomDate(3) : new Date(),
                },
            });
        }

        // 10. Create KPI Metrics (84)
        const kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'] as const;
        const baseValues: Record<string, number> = { MTTD: 5, MTTR: 60, COMPLIANCE_RATE: 88, ANOMALY_ACCURACY: 85, POLICY_VIOLATIONS: 150, DOCUMENT_RISK: 35, SYSTEM_HEALTH: 92 };

        for (let month = 0; month < 12; month++) {
            const period = `2024-${String(month + 1).padStart(2, '0')}`;
            for (const category of kpiCategories) {
                let value = baseValues[category] + (Math.random() - 0.5) * 10;
                if (['MTTD', 'MTTR', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK'].includes(category)) {
                    value = Math.max(value - month * 0.5, 2);
                } else {
                    value = Math.min(value + month * 0.5, 99);
                }

                await prisma.kPIMetric.create({
                    data: {
                        name: `${category} - ${period}`,
                        category: category,
                        value,
                        target: ['COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'SYSTEM_HEALTH'].includes(category) ? 95 : null,
                        trend: ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] as 'UP' | 'DOWN' | 'STABLE',
                        period,
                        calculatedAt: new Date(2024, month, 28),
                    },
                });
            }
        }

        // 11. Create Risk Posture (30 days)
        for (let day = 0; day < 30; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const improvement = (30 - day) * 0.3;

            await prisma.riskPosture.create({
                data: {
                    overallScore: Math.max(25 - improvement, 15) + Math.random() * 5,
                    documentRisk: Math.max(30 - improvement, 20) + Math.random() * 5,
                    digitalRisk: Math.max(35 - improvement, 18) + Math.random() * 5,
                    complianceRisk: Math.max(20 - improvement, 10) + Math.random() * 5,
                    criticalCount: Math.max(Math.floor(8 - improvement / 5), 2),
                    highCount: Math.max(Math.floor(15 - improvement / 3), 5),
                    mediumCount: Math.floor(25 + Math.random() * 10),
                    lowCount: Math.floor(40 + Math.random() * 20),
                    calculatedAt: date,
                },
            });
        }

        // 12. Create Audit Logs (500+)
        const actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN'];
        const entityTypes = ['Document', 'User', 'Zone', 'PolicyRule'];
        let previousHash = '';

        for (let i = 0; i < 520; i++) {
            const action = actions[Math.floor(Math.random() * actions.length)];
            const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
            const user = userList[Math.floor(Math.random() * userList.length)];
            const timestamp = randomDate(30);

            const logData = { action, entityType, timestamp: timestamp.toISOString() };
            const signature = generateSignature(JSON.stringify(logData));
            const currentHash = generateHash(JSON.stringify(logData) + previousHash);

            await prisma.auditLog.create({
                data: {
                    action,
                    entityType,
                    entityId: `ent-${Math.random().toString(36).substring(7)}`,
                    userId: user.id,
                    previousValue: action === 'UPDATE' ? JSON.stringify({ old: true }) : null,
                    newValue: action === 'UPDATE' ? JSON.stringify({ new: true }) : null,
                    metadata: JSON.stringify({ source: 'system' }),
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    signature,
                    previousHash: previousHash || null,
                    timestamp,
                },
            });

            previousHash = currentHash;
        }

        // 13. Create Regulations (Indonesian Government Regulations)
        const regulationsData = [
            { name: 'Undang-Undang Kearsipan', code: 'UU 43/2009', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Biro Hukum', status: 'COMPLIANT' as const },
            { name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres 95/2018', category: 'PRESIDENTIAL' as const, issuingBody: 'Presiden RI', ownerDepartment: 'Unit IT', status: 'PARTIAL' as const },
            { name: 'Information Security Management', code: 'ISO 27001:2022', category: 'INTERNATIONAL' as const, issuingBody: 'ISO/IEC', ownerDepartment: 'Unit IT Security', status: 'COMPLIANT' as const },
            { name: 'Manajemen Risiko Instansi Pemerintah', code: 'PP 60/2008', category: 'GOVERNMENT' as const, issuingBody: 'Pemerintah RI', ownerDepartment: 'Unit Kepatuhan', status: 'COMPLIANT' as const },
            { name: 'Pengamanan Informasi Pemerintah', code: 'Permen 59/2020', category: 'GOVERNMENT' as const, issuingBody: 'Kementerian PANRB', ownerDepartment: 'Unit IT Security', status: 'UNDER_REVIEW' as const },
            { name: 'Keterbukaan Informasi Publik', code: 'UU 14/2008', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Humas', status: 'COMPLIANT' as const },
            { name: 'Perlindungan Data Pribadi', code: 'UU 27/2022', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Unit Kepatuhan', status: 'PARTIAL' as const },
            { name: 'Standar Nasional Arsip', code: 'Perka ANRI 28/2020', category: 'GOVERNMENT' as const, issuingBody: 'ANRI', ownerDepartment: 'Kearsipan', status: 'COMPLIANT' as const },
            { name: 'Records Management', code: 'ISO 15489-1:2016', category: 'INTERNATIONAL' as const, issuingBody: 'ISO', ownerDepartment: 'Kearsipan', status: 'COMPLIANT' as const },
            { name: 'SOP Keamanan Gedung', code: 'SOP-SEC-001', category: 'INTERNAL' as const, issuingBody: 'ANRI', ownerDepartment: 'Unit Keamanan', status: 'COMPLIANT' as const },
        ];

        for (const regData of regulationsData) {
            await prisma.regulation.create({
                data: {
                    ...regData,
                    description: `Regulasi ${regData.name} yang diterbitkan oleh ${regData.issuingBody}`,
                    effectiveDate: randomDate(365 * 5),
                    lastReviewDate: randomDate(90),
                    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    isActive: true,
                },
            });
        }

        // 14. Create Audit Schedules
        const auditSchedulesData = [
            { name: 'Audit Internal Q4 2024', type: 'INTERNAL' as const, auditorName: 'Tim Inspektorat', auditorOrg: 'Inspektorat ANRI', status: 'COMPLETED' as const, findings: 3, criticalFindings: 0 },
            { name: 'Surveillance Audit ISO 27001', type: 'SURVEILLANCE' as const, auditorName: 'PT. Sucofindo', auditorOrg: 'ISO Certification Body', status: 'COMPLETED' as const, findings: 2, criticalFindings: 0 },
            { name: 'Audit BPK Semester II', type: 'EXTERNAL' as const, auditorName: 'Tim Auditor BPK', auditorOrg: 'BPK RI', status: 'COMPLETED' as const, findings: 5, criticalFindings: 1 },
            { name: 'Review Kepatuhan SPBE', type: 'INTERNAL' as const, auditorName: 'Tim Evaluasi SPBE', auditorOrg: 'Kementerian PANRB', status: 'IN_PROGRESS' as const, findings: 0, criticalFindings: 0 },
            { name: 'Audit Sertifikasi ISO 27001', type: 'CERTIFICATION' as const, auditorName: 'BSI Indonesia', auditorOrg: 'ISO Certification Body', status: 'SCHEDULED' as const, findings: 0, criticalFindings: 0 },
        ];

        for (let i = 0; i < auditSchedulesData.length; i++) {
            const auditData = auditSchedulesData[i];
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() - (auditSchedulesData.length - i - 1) * 30);

            await prisma.auditSchedule.create({
                data: {
                    ...auditData,
                    description: `${auditData.name} oleh ${auditData.auditorOrg}`,
                    scheduledDate,
                    completedDate: auditData.status === 'COMPLETED' ? scheduledDate : null,
                },
            });
        }

        // 15. Create Policy Acknowledgments (for each user and main policies)
        const mainPolicies = [
            { id: 'pol-001', name: 'Kebijakan Keamanan Informasi', version: 'v2.1' },
            { id: 'pol-002', name: 'Kebijakan Penggunaan Internet', version: 'v1.5' },
            { id: 'pol-003', name: 'Kebijakan Privasi Data', version: 'v3.0' },
            { id: 'pol-004', name: 'Kebijakan Anti-Korupsi', version: 'v1.2' },
            { id: 'pol-005', name: 'Kode Etik Pegawai', version: 'v2.0' },
        ];

        let acknowledgedCount = 0;
        for (const user of userList) {
            for (const policy of mainPolicies) {
                // 96% acknowledgment rate
                if (Math.random() < 0.96) {
                    await prisma.policyAcknowledgment.create({
                        data: {
                            userId: user.id,
                            policyId: policy.id,
                            policyName: policy.name,
                            policyVersion: policy.version,
                            acknowledgedAt: randomDate(90),
                            ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                            digitalSignature: generateSignature(`${user.id}:${policy.id}:${Date.now()}`),
                            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                            isValid: true,
                        },
                    });
                    acknowledgedCount++;
                }
            }
        }

        // 16. Create Compliance Metrics (monthly data for 6 months)
        const complianceCategories = [
            { category: 'POLICY_ACK', name: 'Policy Acknowledgment Rate', base: 94, target: 100, unit: '%' },
            { category: 'AUDIT_READY', name: 'Audit Readiness Score', base: 91, target: 95, unit: '%' },
            { category: 'REGULATION_COMPLIANCE', name: 'Regulation Compliance', base: 87, target: 100, unit: '%' },
            { category: 'TRAINING_COMPLETION', name: 'Training Completion Rate', base: 82, target: 90, unit: '%' },
            { category: 'INCIDENT_RESOLUTION', name: 'Incident Resolution Rate', base: 88, target: 95, unit: '%' },
            { category: 'DAYS_SINCE_AUDIT', name: 'Days Since Last Audit', base: 12, target: null, unit: 'days' },
        ];

        for (let month = 0; month < 6; month++) {
            const period = `2024-${String(month + 7).padStart(2, '0')}`;
            for (const cat of complianceCategories) {
                const improvement = month * 1.5;
                const value = cat.category === 'DAYS_SINCE_AUDIT'
                    ? 30 - month * 5  // Days decrease as we get closer to present
                    : Math.min(cat.base + improvement + (Math.random() - 0.5) * 3, 99);

                await prisma.complianceMetric.create({
                    data: {
                        name: cat.name,
                        category: cat.category,
                        value,
                        target: cat.target,
                        unit: cat.unit,
                        trend: month > 2 ? 'UP' : 'STABLE',
                        period,
                        calculatedAt: new Date(2024, month + 6, 28),
                    },
                });
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        const summary = {
            users: usersData.length,
            zones: zonesData.length,
            rfidReaders: rfidReadersData.length,
            documents: documentsData.length,
            movements: 120,
            anomalyAlerts: anomalyMovements.length,
            policyRules: policyRulesData.length,
            violations: 220,
            devices: 30,
            kpiMetrics: 84,
            riskPostures: 30,
            auditLogs: 520,
            regulations: regulationsData.length,
            auditSchedules: auditSchedulesData.length,
            policyAcknowledgments: acknowledgedCount,
            complianceMetrics: complianceCategories.length * 6,
        };

        const total = Object.values(summary).reduce((a, b) => a + b, 0);

        return NextResponse.json({
            success: true,
            message: '✅ Database seeded successfully for Presidential Demo!',
            summary,
            total,
            duration: `${duration}s`,
        });
    } catch (error) {
        console.error('❌ Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
