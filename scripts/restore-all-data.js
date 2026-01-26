// FULL DATA RESTORE SCRIPT - Restores ALL data
require('dotenv/config');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
});

const prisma = new PrismaClient({ adapter });

function randomDate(daysAgo) {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function generateRFIDTag() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tag = 'ANRI-';
    for (let i = 0; i < 6; i++) {
        tag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tag;
}

function generateSignature(data) {
    return crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
}

function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// ============= DATA =============
const usersData = [
    { email: 'budi.santoso@anri.go.id', name: 'Dr. Ir. Budi Santoso, M.Sc.', role: 'EXECUTIVE', department: 'Direktorat Utama' },
    { email: 'ahmad.fauzi@anri.go.id', name: 'Ahmad Fauzi, S.Kom.', role: 'IT_SECURITY', department: 'Unit IT' },
    { email: 'citra.dewi@anri.go.id', name: 'Citra Dewi, S.H., M.H.', role: 'COMPLIANCE_OFFICER', department: 'Kepatuhan & Audit' },
    { email: 'rina.wulandari@anri.go.id', name: 'Rina Wulandari, S.T.', role: 'SYSTEM_ADMIN', department: 'Unit IT' },
    { email: 'hendra.wijaya@anri.go.id', name: 'Hendra Wijaya, S.Ars.', role: 'COMPLIANCE_OFFICER', department: 'Preservasi Arsip' },
    { email: 'maya.kusuma@anri.go.id', name: 'Maya Kusuma, S.Kom., CISSP', role: 'IT_SECURITY', department: 'NSOC' },
    { email: 'dimas.pratama@anri.go.id', name: 'Dimas Pratama, A.Md.', role: 'COMPLIANCE_OFFICER', department: 'Kearsipan Dinamis' },
    { email: 'siti.nurhaliza@anri.go.id', name: 'Prof. Dr. Siti Nurhaliza, M.A.', role: 'EXECUTIVE', department: 'Manajemen Eksekutif' },
    { email: 'agus.setiawan@anri.go.id', name: 'Agus Setiawan, S.Kom.', role: 'IT_SECURITY', department: 'Unit IT' },
    { email: 'putri.handayani@anri.go.id', name: 'Putri Handayani, S.E., Ak.', role: 'COMPLIANCE_OFFICER', department: 'Audit Internal' },
    { email: 'presiden@anri.go.id', name: 'Presiden Republik Indonesia', role: 'EXECUTIVE', department: 'VIP Demo' },
];

const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 2', building: 'Gedung A - Arsip Pusat', description: 'Penyimpanan arsip dengan klasifikasi RAHASIA' },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang pemindaian dan digitalisasi dokumen' },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan', securityLevel: 'STANDARD', floor: 'Lantai 1', building: 'Gedung B - Administrasi', description: 'Kantor utama unit kearsipan dinamis' },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 3', building: 'Gedung B - Administrasi', description: 'Ruang rapat untuk pertemuan tingkat tinggi' },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan', securityLevel: 'RESTRICTED', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Gudang penyimpanan arsip inaktif' },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC', floor: 'Lantai Dasar', building: 'Gedung A - Arsip Pusat', description: 'Area lobby dan resepsionis' },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang baca untuk pengunjung' },
    { code: 'ZONA-S1', name: 'Ruang Server', securityLevel: 'HIGH_SECURITY', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Data center dan server room' },
];

const rfidReadersData = [
    { readerId: 'RDR-1001', name: 'Portal Utama A', type: 'PORTAL', zoneCode: 'ZONA-L1', isOnline: true },
    { readerId: 'RDR-1002', name: 'Fixed Reader Arsip Rahasia', type: 'FIXED', zoneCode: 'ZONA-A1', isOnline: true },
    { readerId: 'RDR-1003', name: 'Mobile Reader Digitalisasi', type: 'MOBILE', zoneCode: 'ZONA-A2', isOnline: true },
    { readerId: 'RDR-1004', name: 'Portal Gudang', type: 'PORTAL', zoneCode: 'ZONA-C1', isOnline: false },
    { readerId: 'RDR-1005', name: 'Fixed Reader Kearsipan', type: 'FIXED', zoneCode: 'ZONA-B1', isOnline: true },
    { readerId: 'RDR-1006', name: 'Portal VIP Room', type: 'PORTAL', zoneCode: 'ZONA-B2', isOnline: true },
    { readerId: 'RDR-1007', name: 'Fixed Reader Ruang Baca', type: 'FIXED', zoneCode: 'ZONA-R1', isOnline: true },
    { readerId: 'RDR-1008', name: 'Portal Server Room', type: 'PORTAL', zoneCode: 'ZONA-S1', isOnline: true },
    { readerId: 'RDR-1009', name: 'Mobile Reader Audit', type: 'MOBILE', zoneCode: 'ZONA-B1', isOnline: true },
    { readerId: 'RDR-1010', name: 'Fixed Reader Gudang B', type: 'FIXED', zoneCode: 'ZONA-C1', isOnline: true },
    { readerId: 'RDR-1011', name: 'Portal Arsip Exit', type: 'PORTAL', zoneCode: 'ZONA-A1', isOnline: true },
    { readerId: 'RDR-1012', name: 'Mobile Reader Inspeksi', type: 'MOBILE', zoneCode: 'ZONA-A2', isOnline: true },
];

const documentsData = [
    { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P3Q7R1', title: 'Dokumen Intelijen Keamanan Negara Vol. XII', classification: 'SECRET', orgUnit: 'BIN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-K2L4W9', title: 'SK Presiden No. 45/2024 - Pengangkatan Menteri', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-M5N8V4', title: 'Perjanjian Bilateral Pertahanan', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-J7H2F6', title: 'Laporan Audit BPK Khusus 2024', classification: 'SECRET', orgUnit: 'BPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-B2C5D8', title: 'SK Pengangkatan Pejabat Eselon III No. 123/2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-E3F6G9', title: 'Laporan Keuangan Triwulan IV 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H4I7J1', title: 'Perjanjian Kerjasama dengan UNESCO', classification: 'RESTRICTED', orgUnit: 'Humas', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-K5L8M2', title: 'Dokumen Tender Renovasi Gedung C', classification: 'RESTRICTED', orgUnit: 'Bagian Umum', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-K4L7M1', title: 'Pengumuman Penerimaan CPNS 2024', classification: 'PUBLIC', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-N5O8P2', title: 'Surat Edaran No. 01/SE/2024', classification: 'PUBLIC', orgUnit: 'Sekretariat', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Q6R9S3', title: 'Laporan Tahunan ANRI 2023', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
];

const policyRulesData = [
    { name: 'Block Gambling Sites', description: 'Memblokir akses ke situs judi online', category: 'DNS_BLOCK', pattern: '*.bet365.com,*.pokerstars.com,*.888casino.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Adult Content', description: 'Memblokir akses ke konten dewasa', category: 'DNS_BLOCK', pattern: '*.pornhub.com,*.xvideos.com,*.xhamster.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Restrict Social Media', description: 'Membatasi akses media sosial', category: 'URL_FILTER', pattern: '*facebook.com,*instagram.com,*twitter.com,*tiktok.com', action: 'WARN', severity: 'MEDIUM', priority: 50 },
    { name: 'Block Video Streaming', description: 'Memblokir situs streaming video', category: 'CONTENT_RESTRICTION', pattern: '*netflix.com,*youtube.com,*disney*.com', action: 'WARN', severity: 'LOW', priority: 60 },
    { name: 'Block Gaming Sites', description: 'Memblokir situs gaming online', category: 'TIME_RESTRICTION', pattern: '*steam*.com,*epicgames.com,*roblox.com', action: 'BLOCK', severity: 'HIGH', priority: 30 },
    { name: 'Block Torrent Sites', description: 'Memblokir situs torrent dan P2P', category: 'APPLICATION_CONTROL', pattern: '*thepiratebay*,*1337x.*,*rarbg.*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Crypto Mining', description: 'Memblokir situs crypto mining', category: 'APPLICATION_CONTROL', pattern: '*coinhive*,*cryptoloot*,*miner*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Proxy/VPN', description: 'Memblokir layanan proxy dan VPN', category: 'APPLICATION_CONTROL', pattern: '*hidemyass*,*hotspotshield*,*nordvpn*', action: 'BLOCK', severity: 'HIGH', priority: 20 },
    { name: 'Block Malware Domains', description: 'Memblokir domain berbahaya', category: 'DNS_BLOCK', pattern: '*.malware*,*.phishing*,*.scam*', action: 'BLOCK', severity: 'CRITICAL', priority: 5 },
    { name: 'Block External Webmail', description: 'Memblokir webmail selain email resmi', category: 'URL_FILTER', pattern: '*mail.google.com,*outlook.live*,*mail.yahoo*', action: 'WARN', severity: 'MEDIUM', priority: 45 },
];

const devicesData = [
    { deviceId: 'EXEC-LT-001', hostname: 'ANRI-DIRUT-NB', type: 'LAPTOP', manufacturer: 'HP', model: 'EliteBook 860 G10', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Dr. Ir. Budi Santoso, M.Sc.', dept: 'Direktorat Utama', ip: '192.168.1.10', status: 'ACTIVE' },
    { deviceId: 'EXEC-LT-002', hostname: 'ANRI-SEKJEN-NB', type: 'LAPTOP', manufacturer: 'Dell', model: 'Latitude 9440', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Prof. Dr. Siti Nurhaliza, M.A.', dept: 'Manajemen Eksekutif', ip: '192.168.1.11', status: 'ACTIVE' },
    { deviceId: 'IT-WS-001', hostname: 'NSOC-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'HP', model: 'Z2 Tower G9', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Ahmad Fauzi, S.Kom.', dept: 'Unit IT', ip: '192.168.2.10', status: 'ACTIVE' },
    { deviceId: 'IT-WS-002', hostname: 'NSOC-WORKSTATION-02', type: 'DESKTOP', manufacturer: 'Dell', model: 'Precision 3660', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Maya Kusuma, S.Kom., CISSP', dept: 'NSOC', ip: '192.168.2.11', status: 'ACTIVE' },
    { deviceId: 'IT-LT-003', hostname: 'ANRI-IT-MOBILE-01', type: 'LAPTOP', manufacturer: 'Lenovo', model: 'ThinkPad X1 Carbon', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Rina Wulandari, S.T.', dept: 'Unit IT', ip: '192.168.2.20', status: 'ACTIVE' },
    { deviceId: 'AUD-WS-001', hostname: 'AUDIT-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 400 G9', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Citra Dewi, S.H., M.H.', dept: 'Kepatuhan & Audit', ip: '192.168.3.10', status: 'ACTIVE' },
    { deviceId: 'PRV-WS-001', hostname: 'PRESERVASI-WS-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 600 G6', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Hendra Wijaya, S.Ars.', dept: 'Preservasi Arsip', ip: '192.168.4.10', status: 'ACTIVE' },
    { deviceId: 'KRS-WS-001', hostname: 'KEARSIPAN-WS-01', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M70q', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Dimas Pratama, A.Md.', dept: 'Kearsipan Dinamis', ip: '192.168.5.10', status: 'ACTIVE' },
    { deviceId: 'MOB-001', hostname: 'ANRI-MOB-DIRUT', type: 'MOBILE', manufacturer: 'Samsung', model: 'Galaxy S24 Ultra', os: 'Android', osVer: '14', userName: 'Dr. Ir. Budi Santoso, M.Sc.', dept: 'Direktorat Utama', ip: '192.168.10.10', status: 'ACTIVE' },
    { deviceId: 'MOB-002', hostname: 'ANRI-MOB-SEKJEN', type: 'MOBILE', manufacturer: 'Apple', model: 'iPhone 15 Pro Max', os: 'iOS', osVer: '17.3', userName: 'Prof. Dr. Siti Nurhaliza, M.A.', dept: 'Manajemen Eksekutif', ip: '192.168.10.11', status: 'ACTIVE' },
    { deviceId: 'SRV-DC-001', hostname: 'ANRI-DC-PRIMARY', type: 'SERVER', manufacturer: 'HP', model: 'ProLiant DL380 Gen10', os: 'Windows Server 2022', osVer: '21H2', userName: null, dept: 'Data Center', ip: '192.168.100.10', status: 'ACTIVE' },
    { deviceId: 'SRV-DC-002', hostname: 'ANRI-DC-BACKUP', type: 'SERVER', manufacturer: 'Dell', model: 'PowerEdge R750xs', os: 'Windows Server 2022', osVer: '21H2', userName: null, dept: 'Data Center', ip: '192.168.100.11', status: 'ACTIVE' },
    { deviceId: 'KRS-WS-005', hostname: 'KEARSIPAN-WS-05', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7000', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Bambang Suprianto', dept: 'Kearsipan Dinamis', ip: '192.168.5.15', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), reason: 'Percobaan akses situs judi online (bet365.com, pokerstars.com)' },
    { deviceId: 'KRS-LT-003', hostname: 'KEARSIPAN-MOBILE-03', type: 'LAPTOP', manufacturer: 'HP', model: 'ProBook 440 G10', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Teguh Prasetyo', dept: 'Kearsipan Dinamis', ip: '192.168.5.22', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), reason: 'Terdeteksi mengunduh file dari thepiratebay.org' },
    { deviceId: 'ADM-WS-002', hostname: 'ADMIN-WORKSTATION-02', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M90q', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Indra Maulana', dept: 'Administrasi', ip: '192.168.6.12', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), reason: 'Akses konten dewasa - Policy violation critical' },
    { deviceId: 'PRV-WS-004', hostname: 'PRESERVASI-WS-04', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 600 G5', os: 'Windows 10 Pro', osVer: '21H2', userName: 'Sri Wahyuni', dept: 'Preservasi Arsip', ip: '192.168.4.14', status: 'OFFLINE' },
    { deviceId: 'KRS-WS-004', hostname: 'KEARSIPAN-WS-04', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M70s', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Budi Raharjo', dept: 'Kearsipan Dinamis', ip: '192.168.5.14', status: 'OFFLINE' },
];

async function main() {
    console.log('🚀 Starting FULL data restore...\n');

    // Check existing counts first
    const existing = {
        users: await prisma.user.count(),
        zones: await prisma.zone.count(),
        readers: await prisma.rFIDReader.count(),
        documents: await prisma.document.count(),
        policies: await prisma.policyRule.count(),
        devices: await prisma.deviceStatus.count(),
    };
    console.log('📊 Existing data:', existing);

    const users = {};
    const zones = {};
    const readers = {};

    // 1. USERS
    if (existing.users === 0) {
        console.log('\n👥 Restoring users...');
        for (const u of usersData) {
            const passwordHash = await bcrypt.hash('Demo2024!', 12);
            const user = await prisma.user.create({
                data: { email: u.email, name: u.name, passwordHash, role: u.role, department: u.department, isActive: true }
            });
            users[u.email] = user;
            console.log('  ✓', u.name);
        }
    } else {
        const allUsers = await prisma.user.findMany();
        allUsers.forEach(u => users[u.email] = u);
        console.log('✓ Users already exist:', existing.users);
    }

    // 2. ZONES
    if (existing.zones === 0) {
        console.log('\n🏢 Restoring zones...');
        for (const z of zonesData) {
            const zone = await prisma.zone.create({
                data: { name: z.name, code: z.code, securityLevel: z.securityLevel, floor: z.floor, building: z.building, description: z.description, isActive: true }
            });
            zones[z.code] = zone;
            console.log('  ✓', z.name);
        }
    } else {
        const allZones = await prisma.zone.findMany();
        allZones.forEach(z => zones[z.code] = z);
        console.log('✓ Zones already exist:', existing.zones);
    }

    // 3. RFID READERS
    if (existing.readers === 0) {
        console.log('\n📡 Restoring RFID readers...');
        for (const r of rfidReadersData) {
            const reader = await prisma.rFIDReader.create({
                data: { readerId: r.readerId, name: r.name, type: r.type, zoneId: zones[r.zoneCode].id, isOnline: r.isOnline, lastPing: r.isOnline ? new Date() : randomDate(1) }
            });
            readers[r.readerId] = reader;
        }
        console.log('  ✓ Created', rfidReadersData.length, 'readers');
    } else {
        const allReaders = await prisma.rFIDReader.findMany();
        allReaders.forEach(r => readers[r.readerId] = r);
        console.log('✓ Readers already exist:', existing.readers);
    }

    // 4. DOCUMENTS
    if (existing.documents === 0) {
        console.log('\n📄 Restoring documents...');
        for (const d of documentsData) {
            const doc = await prisma.document.create({
                data: { rfidTag: d.rfidTag, title: d.title, classification: d.classification, organizationUnit: d.orgUnit, currentZoneId: zones[d.zoneCode].id, isActive: true }
            });
            await prisma.documentBaseline.create({
                data: { documentId: doc.id, normalHoursStart: 8, normalHoursEnd: 17, allowedZones: JSON.stringify([zones[d.zoneCode].id]), typicalMovementFreq: 1.5, featureVector: '{}', modelVersion: 'v1.2.0', lastTrainedAt: randomDate(7), confidenceScore: 0.92 }
            });
        }
        console.log('  ✓ Created', documentsData.length, 'documents with baselines');
    } else {
        console.log('✓ Documents already exist:', existing.documents);
    }

    // 5. POLICY RULES
    if (existing.policies === 0) {
        console.log('\n📋 Restoring policy rules...');
        for (const p of policyRulesData) {
            await prisma.policyRule.create({
                data: { name: p.name, description: p.description, category: p.category, pattern: p.pattern, action: p.action, severity: p.severity, priority: p.priority, isActive: true }
            });
            console.log('  ✓', p.name);
        }
    } else {
        console.log('✓ Policies already exist:', existing.policies);
    }

    // 6. DEVICES
    console.log('\n💻 Updating devices with full data...');
    await prisma.deviceStatus.deleteMany();
    for (const d of devicesData) {
        await prisma.deviceStatus.create({
            data: {
                deviceId: d.deviceId, hostname: d.hostname, ipAddress: d.ip,
                macAddress: `${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}`,
                deviceType: d.type, manufacturer: d.manufacturer, model: d.model,
                osName: d.os, osVersion: d.osVer, agentVersion: 'ANRI-Agent v2.4.1',
                userName: d.userName, userDepartment: d.dept, status: d.status,
                isolatedAt: d.isolatedAt || null, isolationReason: d.reason || null,
                lastSeen: d.status === 'OFFLINE' ? randomDate(3) : new Date(),
            }
        });
    }
    console.log('  ✓ Created', devicesData.length, 'enterprise devices');

    // 7. KPI METRICS
    const kpiCount = await prisma.kPIMetric.count();
    if (kpiCount === 0) {
        console.log('\n📊 Restoring KPI metrics...');
        const kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'];
        for (let month = 0; month < 12; month++) {
            const period = `2024-${String(month + 1).padStart(2, '0')}`;
            for (const category of kpiCategories) {
                let value = 50 + Math.random() * 40;
                await prisma.kPIMetric.create({
                    data: { name: `${category} - ${period}`, category, value, period, trend: ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)], calculatedAt: new Date(2024, month, 28) }
                });
            }
        }
        console.log('  ✓ Created 84 KPI metrics');
    }

    // 8. RISK POSTURE
    const riskCount = await prisma.riskPosture.count();
    if (riskCount === 0) {
        console.log('\n🎯 Restoring risk posture...');
        for (let day = 0; day < 30; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            await prisma.riskPosture.create({
                data: { overallScore: 20 + Math.random() * 15, documentRisk: 25 + Math.random() * 10, digitalRisk: 30 + Math.random() * 10, complianceRisk: 15 + Math.random() * 10, criticalCount: 3 + Math.floor(Math.random() * 5), highCount: 10 + Math.floor(Math.random() * 8), mediumCount: 25 + Math.floor(Math.random() * 15), lowCount: 40 + Math.floor(Math.random() * 20), calculatedAt: date }
            });
        }
        console.log('  ✓ Created 30 risk posture snapshots');
    }

    // 9. POLICY VIOLATIONS
    const violationCount = await prisma.policyViolation.count();
    if (violationCount === 0) {
        console.log('\n🚫 Restoring policy violations...');
        const userList = Object.values(users);
        const policyList = await prisma.policyRule.findMany();
        const targets = ['facebook.com', 'instagram.com', 'bet365.com', 'pokerstars.com', 'youtube.com', 'netflix.com', 'thepiratebay.org'];
        for (let i = 0; i < 100; i++) {
            const policy = policyList[Math.floor(Math.random() * policyList.length)];
            const user = userList[Math.floor(Math.random() * userList.length)];
            const target = targets[Math.floor(Math.random() * targets.length)];
            await prisma.policyViolation.create({
                data: { policyId: policy.id, userId: user.id, deviceId: devicesData[Math.floor(Math.random() * devicesData.length)].deviceId, ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 254) + 1}`, requestUrl: `https://${target}/page`, dnsQuery: target, matchedPattern: policy.pattern.split(',')[0], actionTaken: policy.action, severity: policy.severity, userNotified: Math.random() > 0.3, timestamp: randomDate(30) }
            });
        }
        console.log('  ✓ Created 100 policy violations');
    }

    // Final counts
    console.log('\n✅ RESTORE COMPLETE!');
    console.log('📊 Final counts:');
    console.log({
        users: await prisma.user.count(),
        zones: await prisma.zone.count(),
        readers: await prisma.rFIDReader.count(),
        documents: await prisma.document.count(),
        policies: await prisma.policyRule.count(),
        devices: await prisma.deviceStatus.count(),
        violations: await prisma.policyViolation.count(),
        kpis: await prisma.kPIMetric.count(),
        riskPosture: await prisma.riskPosture.count(),
    });
}

main()
    .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
