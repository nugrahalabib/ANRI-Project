// Check and restore all data
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Users data
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

// Zones data
const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 2', building: 'Gedung A - Arsip Pusat' },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat' },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan', securityLevel: 'STANDARD', floor: 'Lantai 1', building: 'Gedung B - Administrasi' },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 3', building: 'Gedung B - Administrasi' },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan', securityLevel: 'RESTRICTED', floor: 'Basement', building: 'Gedung C - Penyimpanan' },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC', floor: 'Lantai Dasar', building: 'Gedung A - Arsip Pusat' },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat' },
    { code: 'ZONA-S1', name: 'Ruang Server', securityLevel: 'HIGH_SECURITY', floor: 'Basement', building: 'Gedung C - Penyimpanan' },
];

// Policy rules data
const policyRulesData = [
    { name: 'Block Gambling Sites', description: 'Memblokir akses ke situs judi online', category: 'DNS_BLOCK', pattern: '*.bet365.com,*.pokerstars.com,*.888casino.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Adult Content', description: 'Memblokir akses ke konten dewasa', category: 'DNS_BLOCK', pattern: '*.pornhub.com,*.xvideos.com,*.xhamster.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Restrict Social Media', description: 'Membatasi akses media sosial', category: 'URL_FILTER', pattern: '*facebook.com,*instagram.com,*twitter.com,*tiktok.com', action: 'WARN', severity: 'MEDIUM', priority: 50 },
    { name: 'Block Torrent Sites', description: 'Memblokir situs torrent dan P2P', category: 'APPLICATION_CONTROL', pattern: '*thepiratebay*,*1337x.*,*rarbg.*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Crypto Mining', description: 'Memblokir situs crypto mining', category: 'APPLICATION_CONTROL', pattern: '*coinhive*,*cryptoloot*,*miner*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
];

async function main() {
    console.log('📊 Checking data counts...');

    const counts = {
        users: await prisma.user.count(),
        zones: await prisma.zone.count(),
        devices: await prisma.deviceStatus.count(),
        policies: await prisma.policyRule.count(),
        documents: await prisma.document.count(),
    };

    console.log('Current counts:', counts);

    // Restore users if missing
    if (counts.users === 0) {
        console.log('\n👥 Restoring users...');
        for (const userData of usersData) {
            const passwordHash = await bcrypt.hash('Demo2024!', 12);
            await prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    passwordHash,
                    role: userData.role,
                    department: userData.department,
                    isActive: true,
                },
            });
            console.log('  ✓', userData.name);
        }
    }

    // Restore zones if missing
    if (counts.zones === 0) {
        console.log('\n🏢 Restoring zones...');
        for (const z of zonesData) {
            await prisma.zone.create({
                data: {
                    name: z.name,
                    code: z.code,
                    securityLevel: z.securityLevel,
                    floor: z.floor,
                    building: z.building,
                    isActive: true,
                },
            });
            console.log('  ✓', z.name);
        }
    }

    // Restore policies if missing
    if (counts.policies === 0) {
        console.log('\n📋 Restoring policy rules...');
        for (const p of policyRulesData) {
            await prisma.policyRule.create({
                data: {
                    name: p.name,
                    description: p.description,
                    category: p.category,
                    pattern: p.pattern,
                    action: p.action,
                    severity: p.severity,
                    priority: p.priority,
                    isActive: true,
                },
            });
            console.log('  ✓', p.name);
        }
    }

    // Final counts
    console.log('\n✅ Final data counts:');
    console.log({
        users: await prisma.user.count(),
        zones: await prisma.zone.count(),
        devices: await prisma.deviceStatus.count(),
        policies: await prisma.policyRule.count(),
    });
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
