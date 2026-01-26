// Quick script to populate device data
// Using same Prisma 7 pattern as main app

require('dotenv/config');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('../src/generated/prisma');

// Create adapter and client like main app
const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
});

const prisma = new PrismaClient({ adapter });

function randomDate(daysAgo) {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

const devicesData = [
    // Executive Laptops
    { deviceId: 'EXEC-LT-001', hostname: 'ANRI-DIRUT-NB', type: 'LAPTOP', manufacturer: 'HP', model: 'EliteBook 860 G10', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Dr. Ir. Budi Santoso, M.Sc.', dept: 'Direktorat Utama', ip: '192.168.1.10', status: 'ACTIVE' },
    { deviceId: 'EXEC-LT-002', hostname: 'ANRI-SEKJEN-NB', type: 'LAPTOP', manufacturer: 'Dell', model: 'Latitude 9440', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Prof. Dr. Siti Nurhaliza, M.A.', dept: 'Manajemen Eksekutif', ip: '192.168.1.11', status: 'ACTIVE' },

    // IT Security Devices
    { deviceId: 'IT-WS-001', hostname: 'NSOC-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'HP', model: 'Z2 Tower G9', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Ahmad Fauzi, S.Kom.', dept: 'Unit IT', ip: '192.168.2.10', status: 'ACTIVE' },
    { deviceId: 'IT-WS-002', hostname: 'NSOC-WORKSTATION-02', type: 'DESKTOP', manufacturer: 'Dell', model: 'Precision 3660', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Maya Kusuma, S.Kom., CISSP', dept: 'NSOC', ip: '192.168.2.11', status: 'ACTIVE' },
    { deviceId: 'IT-LT-003', hostname: 'ANRI-IT-MOBILE-01', type: 'LAPTOP', manufacturer: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Rina Wulandari, S.T.', dept: 'Unit IT', ip: '192.168.2.20', status: 'ACTIVE' },
    { deviceId: 'IT-LT-004', hostname: 'ANRI-IT-FIELD-01', type: 'LAPTOP', manufacturer: 'Lenovo', model: 'ThinkPad T14s Gen 4', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Agus Setiawan, S.Kom.', dept: 'Unit IT', ip: '192.168.2.21', status: 'ACTIVE' },

    // Compliance & Audit
    { deviceId: 'AUD-WS-001', hostname: 'AUDIT-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 400 G9', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Citra Dewi, S.H., M.H.', dept: 'Kepatuhan & Audit', ip: '192.168.3.10', status: 'ACTIVE' },
    { deviceId: 'AUD-LT-002', hostname: 'AUDIT-MOBILE-01', type: 'LAPTOP', manufacturer: 'Dell', model: 'Latitude 5540', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Putri Handayani, S.E., Ak.', dept: 'Audit Internal', ip: '192.168.3.20', status: 'ACTIVE' },
    { deviceId: 'AUD-TB-001', hostname: 'AUDIT-TABLET-01', type: 'TABLET', manufacturer: 'Microsoft', model: 'Surface Pro 9', os: 'Windows 11', osVer: '23H2', userName: 'Citra Dewi, S.H., M.H.', dept: 'Kepatuhan & Audit', ip: '192.168.3.30', status: 'ACTIVE' },

    // Preservasi Arsip
    { deviceId: 'PRV-WS-001', hostname: 'PRESERVASI-WS-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 600 G6', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Hendra Wijaya, S.Ars.', dept: 'Preservasi Arsip', ip: '192.168.4.10', status: 'ACTIVE' },
    { deviceId: 'PRV-WS-002', hostname: 'PRESERVASI-WS-02', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7010', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Dewi Sartika, S.Ars.', dept: 'Preservasi Arsip', ip: '192.168.4.11', status: 'ACTIVE' },
    { deviceId: 'PRV-WS-003', hostname: 'DIGITALISASI-WS-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProOne 440 G9', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Rahmat Sugianto', dept: 'Digitalisasi', ip: '192.168.4.20', status: 'ACTIVE' },

    // Kearsipan Dinamis
    { deviceId: 'KRS-WS-001', hostname: 'KEARSIPAN-WS-01', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M70q Gen 3', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Dimas Pratama, A.Md.', dept: 'Kearsipan Dinamis', ip: '192.168.5.10', status: 'ACTIVE' },
    { deviceId: 'KRS-LT-001', hostname: 'KEARSIPAN-MOBILE-01', type: 'LAPTOP', manufacturer: 'HP', model: 'ProBook 450 G10', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Fitriani, A.Md.', dept: 'Kearsipan Dinamis', ip: '192.168.5.20', status: 'ACTIVE' },
    { deviceId: 'KRS-TB-001', hostname: 'KEARSIPAN-TABLET-01', type: 'TABLET', manufacturer: 'Samsung', model: 'Galaxy Tab S9+', os: 'Android', osVer: '14', userName: 'Dimas Pratama, A.Md.', dept: 'Kearsipan Dinamis', ip: '192.168.5.50', status: 'ACTIVE' },

    // Mobile Devices (Phones)
    { deviceId: 'MOB-001', hostname: 'ANRI-MOB-DIRUT', type: 'MOBILE', manufacturer: 'Samsung', model: 'Galaxy S24 Ultra', os: 'Android', osVer: '14', userName: 'Dr. Ir. Budi Santoso, M.Sc.', dept: 'Direktorat Utama', ip: '192.168.10.10', status: 'ACTIVE' },
    { deviceId: 'MOB-002', hostname: 'ANRI-MOB-SEKJEN', type: 'MOBILE', manufacturer: 'Apple', model: 'iPhone 15 Pro Max', os: 'iOS', osVer: '17.3', userName: 'Prof. Dr. Siti Nurhaliza, M.A.', dept: 'Manajemen Eksekutif', ip: '192.168.10.11', status: 'ACTIVE' },
    { deviceId: 'MOB-003', hostname: 'ANRI-MOB-IT-01', type: 'MOBILE', manufacturer: 'Google', model: 'Pixel 8 Pro', os: 'Android', osVer: '14', userName: 'Ahmad Fauzi, S.Kom.', dept: 'Unit IT', ip: '192.168.10.20', status: 'ACTIVE' },
    { deviceId: 'MOB-004', hostname: 'ANRI-MOB-SEC-01', type: 'MOBILE', manufacturer: 'Samsung', model: 'Galaxy A54', os: 'Android', osVer: '14', userName: 'Maya Kusuma, S.Kom., CISSP', dept: 'NSOC', ip: '192.168.10.21', status: 'ACTIVE' },
    { deviceId: 'MOB-005', hostname: 'ANRI-MOB-AUDIT-01', type: 'MOBILE', manufacturer: 'Apple', model: 'iPhone 15', os: 'iOS', osVer: '17.3', userName: 'Citra Dewi, S.H., M.H.', dept: 'Kepatuhan & Audit', ip: '192.168.10.30', status: 'ACTIVE' },

    // Servers
    { deviceId: 'SRV-DC-001', hostname: 'ANRI-DC-PRIMARY', type: 'SERVER', manufacturer: 'HP', model: 'ProLiant DL380 Gen10 Plus', os: 'Windows Server 2022', osVer: '21H2', userName: null, dept: 'Data Center', ip: '192.168.100.10', status: 'ACTIVE' },
    { deviceId: 'SRV-DC-002', hostname: 'ANRI-DC-BACKUP', type: 'SERVER', manufacturer: 'Dell', model: 'PowerEdge R750xs', os: 'Windows Server 2022', osVer: '21H2', userName: null, dept: 'Data Center', ip: '192.168.100.11', status: 'ACTIVE' },
    { deviceId: 'SRV-APP-001', hostname: 'ANRI-APP-SERVER', type: 'SERVER', manufacturer: 'HP', model: 'ProLiant DL360 Gen10', os: 'Ubuntu Server', osVer: '22.04 LTS', userName: null, dept: 'Data Center', ip: '192.168.100.20', status: 'ACTIVE' },
    { deviceId: 'SRV-DB-001', hostname: 'ANRI-DB-PRIMARY', type: 'SERVER', manufacturer: 'Dell', model: 'PowerEdge R650', os: 'Red Hat Enterprise Linux', osVer: '9.3', userName: null, dept: 'Data Center', ip: '192.168.100.30', status: 'ACTIVE' },

    // Virtual Machines
    { deviceId: 'VM-WEB-001', hostname: 'ANRI-WEB-PROD', type: 'VIRTUAL', manufacturer: 'VMware', model: 'vSphere VM', os: 'Ubuntu Server', osVer: '22.04 LTS', userName: null, dept: 'Data Center', ip: '192.168.110.10', status: 'ACTIVE' },
    { deviceId: 'VM-MAIL-001', hostname: 'ANRI-MAIL-SERVER', type: 'VIRTUAL', manufacturer: 'VMware', model: 'vSphere VM', os: 'Ubuntu Server', osVer: '22.04 LTS', userName: null, dept: 'Data Center', ip: '192.168.110.20', status: 'ACTIVE' },

    // ISOLATED Devices (problematic)
    { deviceId: 'KRS-WS-005', hostname: 'KEARSIPAN-WS-05', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7000', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Bambang Suprianto', dept: 'Kearsipan Dinamis', ip: '192.168.5.15', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), reason: 'Percobaan akses situs judi online berulang kali (bet365.com, pokerstars.com)' },
    { deviceId: 'KRS-LT-003', hostname: 'KEARSIPAN-MOBILE-03', type: 'LAPTOP', manufacturer: 'HP', model: 'ProBook 440 G10', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Teguh Prasetyo', dept: 'Kearsipan Dinamis', ip: '192.168.5.22', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), reason: 'Terdeteksi mengunduh file dari thepiratebay.org' },
    { deviceId: 'ADM-WS-002', hostname: 'ADMIN-WORKSTATION-02', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M90q', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Indra Maulana', dept: 'Administrasi', ip: '192.168.6.12', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), reason: 'Akses konten dewasa (adult content) - Policy violation critical' },
    { deviceId: 'HUM-LT-001', hostname: 'HUMAS-MOBILE-01', type: 'LAPTOP', manufacturer: 'Dell', model: 'Inspiron 14', os: 'Windows 11 Home', osVer: '23H2', userName: 'Andi Wijaya', dept: 'Humas', ip: '192.168.7.20', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), reason: 'Terdeteksi malware coinminer - Crypto mining attempt blocked' },
    { deviceId: 'FIN-WS-003', hostname: 'KEUANGAN-WS-03', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 400 G7', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Ratna Sari', dept: 'Keuangan', ip: '192.168.8.13', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), reason: 'Multiple attempts to access gambling sites (sbobet, maxbet)' },
    { deviceId: 'PRV-WS-005', hostname: 'PRESERVASI-WS-05', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 5000', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Joko Susanto', dept: 'Preservasi Arsip', ip: '192.168.4.15', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), reason: 'Unauthorized VPN usage detected (NordVPN connection attempt)' },
    { deviceId: 'LOB-WS-001', hostname: 'LOBBY-KIOSK-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 405 G8', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Guest Kiosk', dept: 'Lobby', ip: '192.168.9.10', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), reason: 'Suspicious file download activity detected' },
    { deviceId: 'MOB-010', hostname: 'ANRI-MOB-TEMP-01', type: 'MOBILE', manufacturer: 'Xiaomi', model: 'Redmi Note 13 Pro', os: 'Android', osVer: '14', userName: 'Rizki Pratama (Intern)', dept: 'Magang', ip: '192.168.10.50', status: 'ISOLATED', isolatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), reason: 'Social media abuse during work hours - TikTok, Instagram excessive usage' },

    // OFFLINE Devices
    { deviceId: 'PRV-WS-004', hostname: 'PRESERVASI-WS-04', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 600 G5', os: 'Windows 10 Pro', osVer: '21H2', userName: 'Sri Wahyuni', dept: 'Preservasi Arsip', ip: '192.168.4.14', status: 'OFFLINE' },
    { deviceId: 'KRS-WS-004', hostname: 'KEARSIPAN-WS-04', type: 'DESKTOP', manufacturer: 'Lenovo', model: 'ThinkCentre M70s', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Budi Raharjo', dept: 'Kearsipan Dinamis', ip: '192.168.5.14', status: 'OFFLINE' },
    { deviceId: 'ADM-WS-003', hostname: 'ADMIN-WORKSTATION-03', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 3000', os: 'Windows 11 Pro', osVer: '22H2', userName: 'Wahyu Hidayat', dept: 'Administrasi', ip: '192.168.6.13', status: 'OFFLINE' },

    // Additional workstations for staff
    { deviceId: 'ADM-WS-001', hostname: 'ADMIN-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 280 G5', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Nurul Hidayah', dept: 'Administrasi', ip: '192.168.6.10', status: 'ACTIVE' },
    { deviceId: 'FIN-WS-001', hostname: 'KEUANGAN-WS-01', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 5080', os: 'Windows 11 Pro', osVer: '23H2', userName: 'Endang Sulistyowati', dept: 'Keuangan', ip: '192.168.8.10', status: 'ACTIVE' },
    { deviceId: 'FIN-WS-002', hostname: 'KEUANGAN-WS-02', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 400 G7', os: 'Windows 10 Pro', osVer: '22H2', userName: 'Susilo Bambang', dept: 'Keuangan', ip: '192.168.8.11', status: 'ACTIVE' },
    { deviceId: 'HUM-WS-001', hostname: 'HUMAS-WORKSTATION-01', type: 'DESKTOP', manufacturer: 'Apple', model: 'iMac 24-inch M3', os: 'macOS', osVer: 'Sonoma 14.3', userName: 'Larasati Dewi', dept: 'Humas', ip: '192.168.7.10', status: 'ACTIVE' },
    { deviceId: 'HUM-LT-002', hostname: 'HUMAS-MOBILE-02', type: 'LAPTOP', manufacturer: 'Apple', model: 'MacBook Air M3', os: 'macOS', osVer: 'Sonoma 14.3', userName: 'Fajar Nugroho', dept: 'Humas', ip: '192.168.7.21', status: 'ACTIVE' },
];

async function main() {
    console.log('🗑️  Deleting existing devices...');
    await prisma.deviceStatus.deleteMany();

    console.log('💻 Creating 45 enterprise devices...');
    for (const device of devicesData) {
        await prisma.deviceStatus.create({
            data: {
                deviceId: device.deviceId,
                hostname: device.hostname,
                ipAddress: device.ip,
                macAddress: `${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}`,
                deviceType: device.type,
                manufacturer: device.manufacturer,
                model: device.model,
                osName: device.os,
                osVersion: device.osVer,
                agentVersion: 'ANRI-Agent v2.4.1',
                userId: null,
                userName: device.userName,
                userDepartment: device.dept,
                status: device.status,
                isolatedAt: device.isolatedAt || null,
                isolationReason: device.reason || null,
                lastSeen: device.status === 'OFFLINE' ? randomDate(3) : new Date(),
            },
        });
    }
    console.log(`✅ Created ${devicesData.length} devices!`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
