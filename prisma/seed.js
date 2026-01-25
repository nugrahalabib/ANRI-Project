// Comprehensive Seed Data for ANRI Platform - Presidential Demo
// This creates 1000+ realistic records across all use cases

require('dotenv/config');
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Prisma 7 requires adapter
const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

// Helper functions
function generateRFIDTag() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tag = 'ANRI-';
    for (let i = 0; i < 6; i++) {
        tag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tag;
}

function randomDate(daysAgo) {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function generateSignature(data) {
    return crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
}

function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// ============================================================================
// DATA DEFINITIONS
// ============================================================================
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
];

const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 2', building: 'Gedung A - Arsip Pusat', description: 'Penyimpanan arsip dengan klasifikasi RAHASIA' },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang pemindaian dan digitalisasi dokumen' },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan', securityLevel: 'STANDARD', floor: 'Lantai 1', building: 'Gedung B - Administrasi', description: 'Kantor utama unit kearsipan dinamis' },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 3', building: 'Gedung B - Administrasi', description: 'Ruang rapat untuk pertemuan tingkat tinggi' },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan', securityLevel: 'RESTRICTED', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Gudang penyimpanan arsip inaktif' },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC', floor: 'Lantai Dasar', building: 'Gedung A - Arsip Pusat', description: 'Area lobby dan resepsionis utama' },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang baca untuk pengunjung umum' },
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
    // SECRET (10)
    { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian 2024-001', classification: 'SECRET', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P3Q7R1', title: 'Dokumen Intelijen Keamanan Negara Vol. XII', classification: 'SECRET', orgUnit: 'BIN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-K2L4W9', title: 'SK Presiden No. 45/2024 - Pengangkatan Menteri', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-M5N8V4', title: 'Perjanjian Bilateral Pertahanan Indonesia-Australia', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-J7H2F6', title: 'Laporan Audit BPK Khusus 2024', classification: 'SECRET', orgUnit: 'BPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-T9Y3B5', title: 'Dokumen Strategi Nasional Cybersecurity', classification: 'SECRET', orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-R4S8D2', title: 'Arsip Rapat Kabinet Terbatas Jan 2024', classification: 'SECRET', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-G6E1C7', title: 'Dokumen Investigasi KPK-X2024', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-U8I5O3', title: 'Rencana Operasi Militer Perbatasan 2024', classification: 'SECRET', orgUnit: 'TNI', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-Z1A4Q9', title: 'Dokumen Negosiasi Perdagangan FTA ASEAN', classification: 'SECRET', orgUnit: 'Kemendag', zoneCode: 'ZONA-A1' },

    // RESTRICTED (20)
    { rfidTag: 'ANRI-B2C5D8', title: 'SK Pengangkatan Pejabat Eselon III No. 123/2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-E3F6G9', title: 'Laporan Keuangan Triwulan IV 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H4I7J1', title: 'Perjanjian Kerjasama dengan UNESCO', classification: 'RESTRICTED', orgUnit: 'Humas', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-K5L8M2', title: 'Dokumen Tender Renovasi Gedung C', classification: 'RESTRICTED', orgUnit: 'Bagian Umum', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-N6O9P3', title: 'Arsip Rapat Koordinasi Eselon I', classification: 'RESTRICTED', orgUnit: 'Sekretariat', zoneCode: 'ZONA-B2' },
    { rfidTag: 'ANRI-Q7R1S4', title: 'Laporan Evaluasi Kinerja 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-T8U2V5', title: 'Dokumen Standar Operasional Prosedur', classification: 'RESTRICTED', orgUnit: 'Bagian Organisasi', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-W9X3Y6', title: 'Arsip Sengketa Kepegawaian 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-A1B4C7', title: 'Laporan Inventarisasi Aset 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-D2E5F8', title: 'Dokumen Perencanaan Strategis 2025-2029', classification: 'RESTRICTED', orgUnit: 'Biro Perencanaan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-G3H6I9', title: 'SK Mutasi Pegawai Batch Januari 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-J4K7L1', title: 'Kontrak Pengadaan Server 2024', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-M5N8O2', title: 'Laporan Audit Internal Q4 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-P6Q9R3', title: 'Dokumen Akreditasi Laboratorium', classification: 'RESTRICTED', orgUnit: 'Lab Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-S7T1U4', title: 'Arsip Pengaduan Whistleblower 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-V8W2X5', title: 'MoU dengan Arsip Nasional Belanda', classification: 'RESTRICTED', orgUnit: 'Kerjasama Internasional', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-Y9Z3A6', title: 'Laporan Pengembangan SDM 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-B1C4D7', title: 'Dokumen Sertifikasi ISO 27001', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-E2F5G8', title: 'SK Penetapan Tunjangan Kinerja 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H3I6J9', title: 'Arsip Perjanjian Hibah dari Pemerintah Jepang', classification: 'RESTRICTED', orgUnit: 'Kerjasama Internasional', zoneCode: 'ZONA-A2' },

    // PUBLIC (20)
    { rfidTag: 'ANRI-K4L7M1', title: 'Pengumuman Penerimaan CPNS 2024', classification: 'PUBLIC', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-N5O8P2', title: 'Surat Edaran No. 01/SE/2024', classification: 'PUBLIC', orgUnit: 'Sekretariat', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Q6R9S3', title: 'Laporan Tahunan ANRI 2023', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-T7U1V4', title: 'Buku Pedoman Kearsipan untuk K/L', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-W8X2Y5', title: 'Katalog Arsip Periode Kolonial', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Z9A3B6', title: 'Majalah Arsip Nasional Edisi 54', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-C1D4E7', title: 'Prosiding Konferensi Kearsipan 2024', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-F2G5H8', title: 'Brosur Layanan ANRI 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-I3J6K9', title: 'Peraturan ANRI No. 5 Tahun 2024', classification: 'PUBLIC', orgUnit: 'Hukum', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-L4M7N1', title: 'Standar Deskripsi Arsip Indonesia', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-O5P8Q2', title: 'Panduan Digitalisasi Arsip', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-R6S9T3', title: 'Katalog Pameran Arsip Kemerdekaan', classification: 'PUBLIC', orgUnit: 'Pusat Layanan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-U7V1W4', title: 'Laporan Survei Kepuasan Masyarakat 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-X8Y2Z5', title: 'Direktori Lembaga Kearsipan Daerah', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-A9B3C6', title: 'Modul Pelatihan Arsiparis Dasar', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-D1E4F7', title: 'Jurnal Kearsipan Vol. 19 No. 1', classification: 'PUBLIC', orgUnit: 'Pusat Kajian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-G2H5I8', title: 'Daftar Arsip Statis yang Diakuisisi 2024', classification: 'PUBLIC', orgUnit: 'Pusat Akuisisi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-J3K6L9', title: 'Formulir Permohonan Akses Arsip', classification: 'PUBLIC', orgUnit: 'Pusat Layanan', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-M4N7O1', title: 'Kalender Event ANRI 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-P5Q8R2', title: 'Infografis Statistik Kearsipan Nasional', classification: 'PUBLIC', orgUnit: 'Pusat Data', zoneCode: 'ZONA-R1' },
];

const policyRulesData = [
    { name: 'Block Gambling Sites', description: 'Memblokir akses ke situs judi online', category: 'DNS_BLOCK', pattern: '*.bet365.com,*.pokerstars.com,*.888casino.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Adult Content', description: 'Memblokir akses ke konten dewasa', category: 'DNS_BLOCK', pattern: '*.pornhub.com,*.xvideos.com,*.xhamster.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Restrict Social Media', description: 'Membatasi akses media sosial dengan peringatan', category: 'URL_FILTER', pattern: '*facebook.com,*instagram.com,*twitter.com,*tiktok.com', action: 'WARN', severity: 'MEDIUM', priority: 50 },
    { name: 'Block Video Streaming', description: 'Memblokir situs streaming video', category: 'CONTENT_RESTRICTION', pattern: '*netflix.com,*youtube.com,*disney*.com', action: 'WARN', severity: 'LOW', priority: 60 },
    { name: 'Block Gaming Sites', description: 'Memblokir situs gaming online', category: 'TIME_RESTRICTION', pattern: '*steam*.com,*epicgames.com,*roblox.com', action: 'BLOCK', severity: 'HIGH', priority: 30 },
    { name: 'Block Torrent Sites', description: 'Memblokir situs torrent dan P2P', category: 'APPLICATION_CONTROL', pattern: '*thepiratebay*,*1337x.*,*rarbg.*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Limit Large Downloads', description: 'Log download file besar (>100MB)', category: 'BANDWIDTH_LIMIT', pattern: '*.iso,*.zip,*.rar,*.exe', action: 'LOG_ONLY', severity: 'LOW', priority: 80 },
    { name: 'Block Crypto Mining', description: 'Memblokir situs crypto mining', category: 'APPLICATION_CONTROL', pattern: '*coinhive*,*cryptoloot*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Proxy/VPN', description: 'Memblokir layanan proxy dan VPN', category: 'APPLICATION_CONTROL', pattern: '*hidemyass*,*hotspotshield*,*tunnelbear*', action: 'BLOCK', severity: 'HIGH', priority: 20 },
    { name: 'Block File Sharing', description: 'Memblokir situs file sharing publik', category: 'URL_FILTER', pattern: '*dropbox.com,*mediafire.com,*mega.nz', action: 'WARN', severity: 'MEDIUM', priority: 40 },
    { name: 'Block Malware Domains', description: 'Memblokir domain yang diketahui berbahaya', category: 'DNS_BLOCK', pattern: '*.malware*,*.phishing*,*.scam*', action: 'BLOCK', severity: 'CRITICAL', priority: 5 },
    { name: 'Restrict Job Sites', description: 'Membatasi akses ke situs pencarian kerja', category: 'URL_FILTER', pattern: '*jobstreet*,*indeed*,*linkedin*/jobs', action: 'LOG_ONLY', severity: 'LOW', priority: 70 },
    { name: 'Block Webmail External', description: 'Memblokir webmail selain email resmi', category: 'URL_FILTER', pattern: '*mail.google.com,*outlook.live*,*mail.yahoo*', action: 'WARN', severity: 'MEDIUM', priority: 45 },
    { name: 'Block Shopping Sites', description: 'Membatasi akses ke e-commerce', category: 'CONTENT_RESTRICTION', pattern: '*tokopedia*,*shopee*,*bukalapak*', action: 'LOG_ONLY', severity: 'LOW', priority: 75 },
    { name: 'Block Sports Betting', description: 'Memblokir situs taruhan olahraga', category: 'DNS_BLOCK', pattern: '*sbobet*,*maxbet*,*ibcbet*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
    console.log('🚀 Starting comprehensive database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
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
    // Clear compliance tables
    await prisma.complianceMetric.deleteMany();
    await prisma.auditSchedule.deleteMany();
    await prisma.policyAcknowledgment.deleteMany();
    await prisma.regulation.deleteMany();
    await prisma.user.deleteMany();
    console.log('  ✓ Cleared all tables');

    // 1. CREATE USERS
    console.log('\n👥 Creating users...');
    const users = {};
    for (const userData of usersData) {
        const passwordHash = await bcrypt.hash('Demo2024!', 12);
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                passwordHash,
                role: userData.role,
                department: userData.department,
                isActive: true,
            },
        });
        users[userData.email] = user;
        console.log(`  ✓ ${user.name}`);
    }

    // 2. CREATE ZONES
    console.log('\n🏢 Creating zones...');
    const zones = {};
    for (const zoneData of zonesData) {
        const zone = await prisma.zone.create({
            data: {
                name: zoneData.name,
                code: zoneData.code,
                description: zoneData.description,
                securityLevel: zoneData.securityLevel,
                floor: zoneData.floor,
                building: zoneData.building,
                isActive: true,
            },
        });
        zones[zoneData.code] = zone;
        console.log(`  ✓ ${zone.name}`);
    }

    // 3. CREATE RFID READERS
    console.log('\n📡 Creating RFID readers...');
    const readers = {};
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
        readers[readerData.readerId] = reader;
    }
    console.log(`  ✓ Created ${rfidReadersData.length} readers`);

    // 4. CREATE DOCUMENTS WITH BASELINES
    console.log('\n📄 Creating documents...');
    const documents = {};
    for (const docData of documentsData) {
        const document = await prisma.document.create({
            data: {
                rfidTag: docData.rfidTag,
                title: docData.title,
                description: `Dokumen resmi ANRI: ${docData.title}`,
                classification: docData.classification,
                organizationUnit: docData.orgUnit,
                currentZoneId: zones[docData.zoneCode].id,
                isActive: true,
            },
        });

        const allowedZones = docData.classification === 'SECRET'
            ? JSON.stringify([zones['ZONA-A1'].id])
            : docData.classification === 'RESTRICTED'
                ? JSON.stringify([zones['ZONA-A1'].id, zones['ZONA-A2'].id, zones['ZONA-B1'].id, zones['ZONA-B2'].id])
                : JSON.stringify(Object.values(zones).map(z => z.id));

        await prisma.documentBaseline.create({
            data: {
                documentId: document.id,
                normalHoursStart: 8,
                normalHoursEnd: 17,
                allowedZones,
                typicalMovementFreq: Math.random() * 3 + 0.5,
                featureVector: JSON.stringify({ movements: [], patterns: [] }),
                modelVersion: 'v1.2.0',
                lastTrainedAt: randomDate(7),
                confidenceScore: 0.85 + Math.random() * 0.14,
            },
        });

        documents[docData.rfidTag] = document;
    }
    console.log(`  ✓ Created ${documentsData.length} documents with baselines`);

    // 5. CREATE DOCUMENT MOVEMENTS
    console.log('\n🚶 Creating document movements...');
    const movements = [];
    const zoneList = Object.values(zones);
    const readerList = Object.values(readers);
    const docList = Object.values(documents);

    for (let i = 0; i < 120; i++) {
        const doc = docList[Math.floor(Math.random() * docList.length)];
        const fromZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const toZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const reader = readerList.find(r => r.zoneId === toZone.id) || readerList[0];
        const isAnomaly = Math.random() < 0.2;

        const movement = await prisma.documentMovement.create({
            data: {
                documentId: doc.id,
                fromZoneId: fromZone.id,
                toZoneId: toZone.id,
                readerId: reader.id,
                isAuthorized: !isAnomaly,
                riskScore: isAnomaly ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
                timestamp: randomDate(30),
            },
        });
        movements.push({ ...movement, isAnomaly, doc, fromZone, toZone });
    }
    console.log(`  ✓ Created ${movements.length} movements`);

    // 6. CREATE ANOMALY ALERTS
    console.log('\n⚠️  Creating anomaly alerts...');
    const anomalyTypes = ['UNAUTHORIZED_ZONE', 'AFTER_HOURS_ACCESS', 'UNUSUAL_FREQUENCY', 'PATTERN_DEVIATION', 'RAPID_MOVEMENT'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const anomalyMovements = movements.filter(m => m.isAnomaly);

    let alertCount = 0;
    for (const mov of anomalyMovements.slice(0, 25)) {
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const explanations = {
            UNAUTHORIZED_ZONE: `Dokumen dengan klasifikasi ${mov.doc.classification} terdeteksi di zona ${mov.toZone.name} yang tidak diizinkan.`,
            AFTER_HOURS_ACCESS: `Pergerakan dokumen terdeteksi di luar jam operasional normal (08:00-17:00 WIB).`,
            UNUSUAL_FREQUENCY: `Dokumen ini mengalami pergerakan melebihi baseline normal.`,
            PATTERN_DEVIATION: `Pola pergerakan dokumen menyimpang dari profil behavioral.`,
            RAPID_MOVEMENT: `Dokumen berpindah melalui multiple zona dalam waktu singkat.`,
        };

        const factors = [
            { factor: 'Zone Security Mismatch', weight: 0.3 + Math.random() * 0.2 },
            { factor: 'Time Anomaly', weight: 0.2 + Math.random() * 0.15 },
        ];

        await prisma.anomalyAlert.create({
            data: {
                documentId: mov.doc.id,
                movementId: mov.id,
                alertType: anomalyType,
                severity: severity,
                riskScore: 0.5 + Math.random() * 0.5,
                explanation: explanations[anomalyType],
                contributingFactors: JSON.stringify(factors),
                confidence: 0.75 + Math.random() * 0.24,
                status: ['OPEN', 'INVESTIGATING', 'RESOLVED'][Math.floor(Math.random() * 3)],
                createdAt: mov.timestamp,
            },
        });
        alertCount++;
    }
    console.log(`  ✓ Created ${alertCount} anomaly alerts`);

    // 7. CREATE POLICY RULES
    console.log('\n📋 Creating policy rules...');
    const policies = {};
    for (const policyData of policyRulesData) {
        const policy = await prisma.policyRule.create({
            data: {
                name: policyData.name,
                description: policyData.description,
                category: policyData.category,
                pattern: policyData.pattern,
                action: policyData.action,
                severity: policyData.severity,
                priority: policyData.priority,
                isActive: true,
            },
        });
        policies[policyData.name] = policy;
    }
    console.log(`  ✓ Created ${policyRulesData.length} policies`);

    // 8. CREATE POLICY VIOLATIONS
    console.log('\n🚫 Creating policy violations...');
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
                requestUrl: `https://${target}/page/${Math.random().toString(36).substring(7)}`,
                dnsQuery: target,
                matchedPattern: policy.pattern.split(',')[0],
                actionTaken: policy.action,
                severity: policy.severity,
                userNotified: Math.random() > 0.3,
                metadata: JSON.stringify({ browser: 'Chrome', os: 'Windows 11' }),
                timestamp: randomDate(30),
            },
        });
    }
    console.log(`  ✓ Created 220 violations`);

    // 9. CREATE DEVICE STATUS
    console.log('\n💻 Creating device statuses...');
    const deviceStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED', 'ISOLATED', 'OFFLINE'];
    for (let i = 1; i <= 30; i++) {
        const status = deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)];
        await prisma.deviceStatus.create({
            data: {
                deviceId: `WS-${String(i).padStart(3, '0')}`,
                hostname: `ANRI-PC-${String(i).padStart(3, '0')}`,
                ipAddress: `192.168.1.${100 + i}`,
                macAddress: `00:1A:2B:${(i * 3).toString(16).padStart(2, '0').toUpperCase()}:${(i * 5).toString(16).padStart(2, '0').toUpperCase()}:${(i * 7).toString(16).padStart(2, '0').toUpperCase()}`,
                status: status,
                isolatedAt: status === 'ISOLATED' ? randomDate(5) : null,
                isolationReason: status === 'ISOLATED' ? 'Multiple policy violations detected' : null,
                lastSeen: status === 'OFFLINE' ? randomDate(3) : new Date(),
            },
        });
    }
    console.log(`  ✓ Created 30 devices`);

    // 10. CREATE KPI METRICS
    console.log('\n📊 Creating KPI metrics...');
    const kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'];
    const baseValues = { MTTD: 5, MTTR: 60, COMPLIANCE_RATE: 88, ANOMALY_ACCURACY: 85, POLICY_VIOLATIONS: 150, DOCUMENT_RISK: 35, SYSTEM_HEALTH: 92 };

    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;
        for (const category of kpiCategories) {
            const improvement = month * 0.5;
            let value = baseValues[category];

            if (['MTTD', 'MTTR', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK'].includes(category)) {
                value = Math.max(value - improvement, category === 'MTTD' ? 2 : 20);
            } else {
                value = Math.min(value + improvement * 0.6, 99);
            }

            await prisma.kPIMetric.create({
                data: {
                    name: `${category} - ${period}`,
                    category: category,
                    value: value + (Math.random() - 0.5) * 5,
                    target: category.includes('RATE') || category.includes('ACCURACY') || category === 'SYSTEM_HEALTH' ? 95 : null,
                    trend: month > 0 ? ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] : null,
                    period,
                    calculatedAt: new Date(2024, month, 28),
                },
            });
        }
    }
    console.log(`  ✓ Created 84 KPI metrics`);

    // 11. CREATE RISK POSTURE
    console.log('\n🎯 Creating risk posture snapshots...');
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
    console.log(`  ✓ Created 30 risk postures`);

    // 12. CREATE AUDIT LOGS
    console.log('\n🔐 Creating audit logs...');
    const actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN', 'LOGOUT'];
    const entityTypes = ['Document', 'User', 'Zone', 'PolicyRule', 'Session'];
    let previousHash = '';

    for (let i = 0; i < 520; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const user = userList[Math.floor(Math.random() * userList.length)];
        const timestamp = randomDate(30);

        const logData = { action, entityType, entityId: `ent-${Math.random().toString(36).substring(7)}`, userId: user.id, timestamp: timestamp.toISOString() };
        const signature = generateSignature(JSON.stringify(logData));
        const currentHash = generateHash(JSON.stringify(logData) + previousHash);

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId: logData.entityId,
                userId: user.id,
                previousValue: action === 'UPDATE' ? JSON.stringify({ status: 'old' }) : null,
                newValue: action === 'UPDATE' ? JSON.stringify({ status: 'new' }) : null,
                metadata: JSON.stringify({ source: 'system', version: '1.0' }),
                ipAddress: `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                signature,
                previousHash: previousHash || null,
                timestamp,
            },
        });

        previousHash = currentHash;
    }
    console.log(`  ✓ Created 520 audit logs`);

    // 13. CREATE REGULATIONS (Presidential Grade)
    console.log('\n📜 Creating regulations...');
    const regulationsData = [
        { name: 'Undang-Undang Kearsipan Nasional', code: 'UU No. 43 Tahun 2009', category: 'LAW', issuingBody: 'DPR RI', ownerDepartment: 'Biro Hukum', status: 'COMPLIANT' },
        { name: 'Undang-Undang Keterbukaan Informasi Publik', code: 'UU No. 14 Tahun 2008', category: 'LAW', issuingBody: 'DPR RI', ownerDepartment: 'Humas', status: 'COMPLIANT' },
        { name: 'Undang-Undang Perlindungan Data Pribadi', code: 'UU No. 27 Tahun 2022', category: 'LAW', issuingBody: 'DPR RI', ownerDepartment: 'Unit Kepatuhan', status: 'COMPLIANT' },
        { name: 'Undang-Undang ITE', code: 'UU No. 11/2008 jo. UU No. 19/2016', category: 'LAW', issuingBody: 'DPR RI', ownerDepartment: 'Unit IT', status: 'COMPLIANT' },
        { name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres No. 95 Tahun 2018', category: 'PRESIDENTIAL', issuingBody: 'Presiden RI', ownerDepartment: 'Unit IT', status: 'COMPLIANT' },
        { name: 'Strategi Keamanan Siber Nasional', code: 'Perpres No. 47 Tahun 2023', category: 'PRESIDENTIAL', issuingBody: 'Presiden RI', ownerDepartment: 'NSOC', status: 'COMPLIANT' },
        { name: 'Satu Data Indonesia', code: 'Perpres No. 39 Tahun 2019', category: 'PRESIDENTIAL', issuingBody: 'Presiden RI', ownerDepartment: 'Pusat Data', status: 'PARTIAL' },
        { name: 'Sistem Pengendalian Intern Pemerintah', code: 'PP No. 60 Tahun 2008', category: 'GOVERNMENT', issuingBody: 'Pemerintah RI', ownerDepartment: 'Inspektorat', status: 'COMPLIANT' },
        { name: 'Sistem Manajemen Keamanan Informasi', code: 'Permen PANRB No. 59/2020', category: 'GOVERNMENT', issuingBody: 'Kementerian PANRB', ownerDepartment: 'Unit IT Security', status: 'COMPLIANT' },
        { name: 'Audit Keamanan SPBE', code: 'Permen PANRB No. 5/2020', category: 'GOVERNMENT', issuingBody: 'Kementerian PANRB', ownerDepartment: 'Inspektorat IT', status: 'UNDER_REVIEW' },
        { name: 'Klasifikasi Arsip', code: 'Perka ANRI No. 24/2011', category: 'GOVERNMENT', issuingBody: 'ANRI', ownerDepartment: 'Unit Klasifikasi', status: 'COMPLIANT' },
        { name: 'Jadwal Retensi Arsip', code: 'Perka ANRI No. 25/2012', category: 'GOVERNMENT', issuingBody: 'ANRI', ownerDepartment: 'Unit Retensi', status: 'COMPLIANT' },
        { name: 'Information Security Management', code: 'ISO/IEC 27001:2022', category: 'INTERNATIONAL', issuingBody: 'ISO', ownerDepartment: 'Unit IT Security', status: 'COMPLIANT' },
        { name: 'Records Management', code: 'ISO 15489-1:2016', category: 'INTERNATIONAL', issuingBody: 'ISO', ownerDepartment: 'Kearsipan', status: 'COMPLIANT' },
        { name: 'Business Continuity Management', code: 'ISO 22301:2019', category: 'INTERNATIONAL', issuingBody: 'ISO', ownerDepartment: 'Unit BCP', status: 'COMPLIANT' },
        { name: 'Risk Management', code: 'ISO 31000:2018', category: 'INTERNATIONAL', issuingBody: 'ISO', ownerDepartment: 'Manajemen Risiko', status: 'COMPLIANT' },
        { name: 'IT Governance Framework', code: 'COBIT 2019', category: 'INTERNATIONAL', issuingBody: 'ISACA', ownerDepartment: 'IT Governance', status: 'PARTIAL' },
        { name: 'SOP Penanganan Insiden Keamanan', code: 'SOP-SEC-001/2024', category: 'INTERNAL', issuingBody: 'ANRI', ownerDepartment: 'NSOC', status: 'COMPLIANT' },
        { name: 'SOP Akses Ruang Arsip Rahasia', code: 'SOP-SEC-002/2024', category: 'INTERNAL', issuingBody: 'ANRI', ownerDepartment: 'Unit Keamanan', status: 'COMPLIANT' },
        { name: 'SOP Backup dan Recovery Data', code: 'SOP-IT-003/2024', category: 'INTERNAL', issuingBody: 'ANRI', ownerDepartment: 'IT Infrastructure', status: 'COMPLIANT' },
        { name: 'SOP Pengelolaan Arsip Digital', code: 'SOP-ARC-001/2024', category: 'INTERNAL', issuingBody: 'ANRI', ownerDepartment: 'Kearsipan Digital', status: 'COMPLIANT' },
        { name: 'SOP Whistleblowing System', code: 'SOP-HR-001/2024', category: 'INTERNAL', issuingBody: 'ANRI', ownerDepartment: 'Inspektorat', status: 'COMPLIANT' },
    ];

    for (const reg of regulationsData) {
        await prisma.regulation.create({
            data: {
                ...reg,
                description: `Regulasi ${reg.name} diterbitkan oleh ${reg.issuingBody}`,
                effectiveDate: randomDate(365 * 3),
                lastReviewDate: randomDate(60),
                nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
        });
    }
    console.log(`  ✓ Created ${regulationsData.length} regulations`);

    // 14. CREATE AUDIT SCHEDULES
    console.log('\n🔍 Creating audit schedules...');
    const auditSchedulesData = [
        { name: 'Audit Internal Triwulan IV 2024', type: 'INTERNAL', auditorName: 'Tim Inspektorat ANRI', auditorOrg: 'Inspektorat ANRI', status: 'COMPLETED', findings: 3, criticalFindings: 0, description: 'Audit kepatuhan internal 12 unit kerja. Tingkat kematangan: Level 4.' },
        { name: 'Surveillance Audit ISO 27001:2022', type: 'SURVEILLANCE', auditorName: 'PT. TUV Rheinland', auditorOrg: 'TUV Rheinland Indonesia', status: 'COMPLETED', findings: 2, criticalFindings: 0, description: 'Audit surveilans tahun ke-2. Sertifikat dipertahankan.' },
        { name: 'Audit BPK RI Semester II 2024', type: 'EXTERNAL', auditorName: 'Tim Auditor BPK', auditorOrg: 'BPK RI', status: 'COMPLETED', findings: 5, criticalFindings: 0, description: 'Pemeriksaan Laporan Keuangan. Opini: WTP.' },
        { name: 'Evaluasi SAKIP Kementerian PANRB', type: 'EXTERNAL', auditorName: 'Tim Evaluator PANRB', auditorOrg: 'Kementerian PANRB', status: 'COMPLETED', findings: 2, criticalFindings: 0, description: 'Evaluasi AKIP. Nilai: 82.5 (Kategori A).' },
        { name: 'Asesmen Indeks SPBE Nasional', type: 'EXTERNAL', auditorName: 'Tim Asesor SPBE', auditorOrg: 'Kementerian PANRB', status: 'COMPLETED', findings: 4, criticalFindings: 0, description: 'Penilaian Indeks SPBE. Nilai: 3.8/5.0.' },
        { name: 'Audit Kepatuhan PDP', type: 'INTERNAL', auditorName: 'Tim Kepatuhan Data', auditorOrg: 'Unit Kepatuhan ANRI', status: 'IN_PROGRESS', findings: 0, criticalFindings: 0, description: 'Audit UU No. 27/2022 PDP. Progress: 75%.' },
        { name: 'Penetration Testing', type: 'SPECIAL', auditorName: 'PT. Xynexis', auditorOrg: 'Xynexis Cybersecurity', status: 'IN_PROGRESS', findings: 0, criticalFindings: 0, description: 'Pengujian keamanan 45 IP, 12 aplikasi.' },
        { name: 'Re-Sertifikasi ISO 27001', type: 'CERTIFICATION', auditorName: 'BSI Indonesia', auditorOrg: 'BSI Group', status: 'SCHEDULED', findings: 0, criticalFindings: 0, description: 'Audit sertifikasi ulang. Persiapan: 90%.' },
        { name: 'Audit Internal Q1 2025', type: 'INTERNAL', auditorName: 'Tim Inspektorat', auditorOrg: 'Inspektorat ANRI', status: 'SCHEDULED', findings: 0, criticalFindings: 0, description: 'Fokus: implementasi kebijakan keamanan baru.' },
        { name: 'Review IT General Controls', type: 'INTERNAL', auditorName: 'Tim Audit IT', auditorOrg: 'Inspektorat IT', status: 'SCHEDULED', findings: 0, criticalFindings: 0, description: 'Review ITGC: akses, change management, operasi.' },
    ];

    for (let i = 0; i < auditSchedulesData.length; i++) {
        const audit = auditSchedulesData[i];
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() - (auditSchedulesData.length - i - 1) * 15);

        await prisma.auditSchedule.create({
            data: {
                name: audit.name,
                type: audit.type,
                description: audit.description,
                scheduledDate,
                completedDate: audit.status === 'COMPLETED' ? scheduledDate : null,
                status: audit.status,
                auditorName: audit.auditorName,
                auditorOrg: audit.auditorOrg,
                findings: audit.findings,
                criticalFindings: audit.criticalFindings,
            },
        });
    }
    console.log(`  ✓ Created ${auditSchedulesData.length} audit schedules`);

    // 15. CREATE POLICY ACKNOWLEDGMENTS
    console.log('\n✍️  Creating policy acknowledgments...');
    const compliancePolicies = [
        { id: 'pol-sec-001', name: 'Kebijakan Keamanan Informasi', version: 'v3.2' },
        { id: 'pol-sec-002', name: 'Kebijakan Penggunaan Sistem', version: 'v2.1' },
        { id: 'pol-hr-001', name: 'Kode Etik Pegawai ASN', version: 'v4.0' },
        { id: 'pol-hr-002', name: 'Kebijakan Anti-Korupsi', version: 'v3.0' },
        { id: 'pol-data-001', name: 'Kebijakan PDP', version: 'v1.0' },
    ];

    let ackCount = 0;
    for (const user of userList) {
        for (const policy of compliancePolicies) {
            if (Math.random() < 0.96) {
                await prisma.policyAcknowledgment.create({
                    data: {
                        userId: user.id,
                        policyId: policy.id,
                        policyName: policy.name,
                        policyVersion: policy.version,
                        acknowledgedAt: randomDate(60),
                        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                        digitalSignature: generateSignature(`${user.id}:${policy.id}`),
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        isValid: true,
                    },
                });
                ackCount++;
            }
        }
    }
    console.log(`  ✓ Created ${ackCount} policy acknowledgments`);

    // 16. CREATE COMPLIANCE METRICS (12 months)
    console.log('\n📈 Creating compliance metrics...');
    const metricCategories = [
        { category: 'COMPLIANCE_INDEX', name: 'Indeks Kepatuhan', base: 92, target: 95, unit: '%' },
        { category: 'POLICY_ACK', name: 'Policy Acknowledgment', base: 94, target: 100, unit: '%' },
        { category: 'AUDIT_READY', name: 'Kesiapan Audit', base: 91, target: 95, unit: '%' },
        { category: 'ISO_COMPLIANCE', name: 'Kepatuhan ISO 27001', base: 95, target: 100, unit: '%' },
        { category: 'TRAINING_COMPLETION', name: 'Pelatihan Wajib', base: 88, target: 95, unit: '%' },
        { category: 'REGULATION_COMPLIANCE', name: 'Kepatuhan Regulasi', base: 87, target: 100, unit: '%' },
    ];

    let metricCount = 0;
    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;
        for (const cat of metricCategories) {
            const improvement = month * 0.5;
            const value = Math.min(cat.base + improvement + (Math.random() - 0.5) * 2, 99);

            await prisma.complianceMetric.create({
                data: {
                    name: cat.name,
                    category: cat.category,
                    value: Math.round(value * 10) / 10,
                    target: cat.target,
                    unit: cat.unit,
                    trend: month > 3 ? 'UP' : 'STABLE',
                    period,
                    calculatedAt: new Date(2024, month, 28),
                },
            });
            metricCount++;
        }
    }
    console.log(`  ✓ Created ${metricCount} compliance metrics`);

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEED COMPLETE!');
    console.log('='.repeat(60));
    console.log(`
📊 Data Summary:
   • Users:            10
   • Zones:            8
   • RFID Readers:     12
   • Documents:        50
   • Movements:        120
   • Anomaly Alerts:   ${alertCount}
   • Policy Rules:     15
   • Violations:       220
   • Device Statuses:  30
   • KPI Metrics:      84
   • Risk Postures:    30
   • Audit Logs:       520
   • Regulations:      ${regulationsData.length}
   • Audit Schedules:  ${auditSchedulesData.length}
   • Policy Acks:      ${ackCount}
   • Compliance Metrics: ${metricCount}
   
   TOTAL: 1100+ records ready for PRESIDENTIAL demo! 🚀
`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
