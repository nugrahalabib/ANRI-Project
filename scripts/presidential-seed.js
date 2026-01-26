// PRESIDENTIAL DEMO - FULL SEED EXECUTOR
// Combines all data modules and seeds the complete database

require('dotenv/config');
const path = require('path');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require(path.join(__dirname, '..', 'src', 'generated', 'prisma'));
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

// Import data
const { usersData, zonesData, rfidReadersData, documentsData, randomDate, randomInt, randomChoice, generateMAC, generateSignature, generateHash } = require('./seed-data/core-data');
const { policyRulesData, devicesData, regulationsData } = require('./seed-data/policy-device-data');

// Violation target sites
const violationTargets = [
    { url: 'bet365.com', policy: 'Block Gambling Sites' },
    { url: 'pokerstars.com', policy: 'Block Gambling Sites' },
    { url: 'sbobet.com', policy: 'Block Sports Betting' },
    { url: 'pornhub.com', policy: 'Block Adult Content' },
    { url: 'xvideos.com', policy: 'Block Adult Content' },
    { url: 'facebook.com', policy: 'Restrict Social Media' },
    { url: 'instagram.com', policy: 'Restrict Social Media' },
    { url: 'tiktok.com', policy: 'Restrict Social Media' },
    { url: 'youtube.com', policy: 'Block Video Streaming' },
    { url: 'netflix.com', policy: 'Block Video Streaming' },
    { url: 'steam.com', policy: 'Block Gaming Sites' },
    { url: 'thepiratebay.org', policy: 'Block Torrent/P2P Sites' },
    { url: '1337x.to', policy: 'Block Torrent/P2P Sites' },
    { url: 'nordvpn.com', policy: 'Block Unauthorized VPN/Proxy' },
    { url: 'coinhive.com', policy: 'Block Crypto Mining' },
    { url: 'mail.google.com', policy: 'Restrict External Webmail' },
    { url: 'tokopedia.com', policy: 'Monitor E-commerce Access' },
    { url: 'shopee.co.id', policy: 'Monitor E-commerce Access' },
    { url: 'dropbox.com', policy: 'Block Public File Sharing' },
];

// Approval request types
const approvalTypes = [
    { type: 'DOCUMENT_MOVEMENT', subject: 'Pemindahan Arsip Rahasia' },
    { type: 'ZONE_ACCESS', subject: 'Akses Zona Keamanan Tinggi' },
    { type: 'POLICY_EXCEPTION', subject: 'Pengecualian Kebijakan Sementara' },
    { type: 'DATA_EXPORT', subject: 'Ekspor Data Arsip' },
    { type: 'USER_CREATION', subject: 'Pembuatan Akun Pengguna Baru' },
];

async function main() {
    console.log('🚀 PRESIDENTIAL DEMO - COMPREHENSIVE DATABASE SEED\n');
    console.log('='.repeat(60));

    // Store references
    const users = {};
    const zones = {};
    const readers = {};
    const documents = {};
    const policies = {};

    // ========= 1. CLEAR EXISTING DATA =========
    console.log('\n🗑️  Clearing existing data...');
    await prisma.approvalStep.deleteMany();
    await prisma.approvalRequest.deleteMany();
    await prisma.complianceMetric.deleteMany();
    await prisma.auditSchedule.deleteMany();
    await prisma.policyAcknowledgment.deleteMany();
    await prisma.regulation.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.policyViolation.deleteMany();
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
    await prisma.accessRequest.deleteMany();
    await prisma.user.deleteMany();
    console.log('  ✓ All tables cleared');

    // ========= 2. CREATE USERS =========
    console.log('\n👥 Creating users (15)...');
    for (const u of usersData) {
        const passwordHash = await bcrypt.hash('Demo2024!', 12);
        const user = await prisma.user.create({
            data: { email: u.email, name: u.name, passwordHash, role: u.role, department: u.department, isActive: true }
        });
        users[u.email] = user;
    }
    console.log('  ✓ Created', usersData.length, 'users');

    // ========= 3. CREATE ZONES =========
    console.log('\n🏢 Creating zones (8)...');
    for (const z of zonesData) {
        const zone = await prisma.zone.create({
            data: { name: z.name, code: z.code, securityLevel: z.securityLevel, floor: z.floor, building: z.building, description: z.description, capacity: z.capacity, isActive: true }
        });
        zones[z.code] = zone;
    }
    console.log('  ✓ Created', zonesData.length, 'zones');

    // ========= 4. CREATE RFID READERS =========
    console.log('\n📡 Creating RFID readers (12)...');
    for (const r of rfidReadersData) {
        const reader = await prisma.rFIDReader.create({
            data: { readerId: r.readerId, name: r.name, type: r.type, zoneId: zones[r.zoneCode].id, isOnline: r.isOnline, lastPing: r.isOnline ? new Date() : randomDate(2) }
        });
        readers[r.readerId] = reader;
    }
    console.log('  ✓ Created', rfidReadersData.length, 'readers');

    // ========= 5. CREATE DOCUMENTS WITH BASELINES =========
    console.log('\n📄 Creating documents (50) with behavioral baselines...');
    for (const d of documentsData) {
        const doc = await prisma.document.create({
            data: { rfidTag: d.rfidTag, title: d.title, description: `Dokumen resmi ANRI: ${d.title}`, classification: d.classification, organizationUnit: d.orgUnit, currentZoneId: zones[d.zoneCode].id, isActive: true }
        });
        const allowedZones = d.classification === 'SECRET'
            ? JSON.stringify([zones['ZONA-A1'].id])
            : d.classification === 'RESTRICTED'
                ? JSON.stringify([zones['ZONA-A1'].id, zones['ZONA-A2'].id, zones['ZONA-B1'].id, zones['ZONA-B2'].id])
                : JSON.stringify(Object.values(zones).map(z => z.id));
        await prisma.documentBaseline.create({
            data: { documentId: doc.id, normalHoursStart: 8, normalHoursEnd: 17, allowedZones, typicalMovementFreq: 1 + Math.random() * 2, featureVector: JSON.stringify({ movements: [], patterns: [] }), modelVersion: 'v1.3.0', lastTrainedAt: randomDate(14), confidenceScore: 0.85 + Math.random() * 0.14 }
        });
        documents[d.rfidTag] = doc;
    }
    console.log('  ✓ Created', documentsData.length, 'documents with baselines');

    // ========= 6. CREATE DOCUMENT MOVEMENTS (200) =========
    console.log('\n🚶 Creating document movements (200)...');
    const zoneList = Object.values(zones);
    const readerList = Object.values(readers);
    const docList = Object.values(documents);
    const movements = [];
    for (let i = 0; i < 200; i++) {
        const doc = docList[Math.floor(Math.random() * docList.length)];
        const fromZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const toZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const reader = readerList.find(r => r.zoneId === toZone.id) || readerList[0];
        const isAnomaly = Math.random() < 0.15;
        const mov = await prisma.documentMovement.create({
            data: { documentId: doc.id, fromZoneId: fromZone.id, toZoneId: toZone.id, readerId: reader.id, isAuthorized: !isAnomaly, riskScore: isAnomaly ? 0.5 + Math.random() * 0.5 : Math.random() * 0.2, timestamp: randomDate(30) }
        });
        movements.push({ ...mov, isAnomaly, doc, fromZone, toZone });
    }
    console.log('  ✓ Created 200 document movements');

    // ========= 7. CREATE ANOMALY ALERTS (30) =========
    console.log('\n⚠️ Creating anomaly alerts (30)...');
    const anomalyTypes = ['UNAUTHORIZED_ZONE', 'AFTER_HOURS_ACCESS', 'UNUSUAL_FREQUENCY', 'PATTERN_DEVIATION', 'RAPID_MOVEMENT'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const anomalyMovements = movements.filter(m => m.isAnomaly).slice(0, 30);
    for (const mov of anomalyMovements) {
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const explanations = {
            UNAUTHORIZED_ZONE: `Dokumen klasifikasi ${mov.doc.classification} terdeteksi di zona ${mov.toZone.name} yang tidak diizinkan.`,
            AFTER_HOURS_ACCESS: `Pergerakan dokumen terdeteksi pada pukul ${18 + Math.floor(Math.random() * 6)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} WIB, di luar jam operasional.`,
            UNUSUAL_FREQUENCY: `Dokumen mengalami ${8 + Math.floor(Math.random() * 12)} pergerakan dalam 24 jam terakhir, melebihi baseline normal.`,
            PATTERN_DEVIATION: `Pola pergerakan menyimpang ${65 + Math.floor(Math.random() * 30)}% dari profil behavioral. Rute ${mov.fromZone.name} → ${mov.toZone.name} belum pernah tercatat.`,
            RAPID_MOVEMENT: `Dokumen berpindah melalui ${3 + Math.floor(Math.random() * 5)} zona dalam ${5 + Math.floor(Math.random() * 10)} menit terakhir.`,
        };
        await prisma.anomalyAlert.create({
            data: { documentId: mov.doc.id, movementId: mov.id, alertType: anomalyType, severity, riskScore: 0.5 + Math.random() * 0.5, explanation: explanations[anomalyType], contributingFactors: JSON.stringify([{ factor: 'Zone Mismatch', weight: 0.4 }, { factor: 'Time Anomaly', weight: 0.3 }, { factor: 'Pattern Deviation', weight: 0.3 }]), confidence: 0.75 + Math.random() * 0.24, status: ['OPEN', 'INVESTIGATING', 'RESOLVED'][Math.floor(Math.random() * 3)], createdAt: mov.timestamp }
        });
    }
    console.log('  ✓ Created 30 anomaly alerts');

    // ========= 8. CREATE POLICY RULES (15) =========
    console.log('\n📋 Creating policy rules (15)...');
    for (const p of policyRulesData) {
        const policy = await prisma.policyRule.create({
            data: { name: p.name, description: p.description, category: p.category, pattern: p.pattern, action: p.action, severity: p.severity, priority: p.priority, isActive: true }
        });
        policies[p.name] = policy;
    }
    console.log('  ✓ Created', policyRulesData.length, 'policy rules');

    // ========= 9. CREATE POLICY VIOLATIONS (250) =========
    console.log('\n🚫 Creating policy violations (250)...');
    const userList = Object.values(users);
    const policyList = Object.values(policies);
    for (let i = 0; i < 250; i++) {
        const target = violationTargets[Math.floor(Math.random() * violationTargets.length)];
        const policy = policyList.find(p => p.name === target.policy) || policyList[0];
        const user = userList[Math.floor(Math.random() * userList.length)];
        const device = devicesData[Math.floor(Math.random() * devicesData.length)];
        await prisma.policyViolation.create({
            data: { policyId: policy.id, userId: user.id, deviceId: device.deviceId, ipAddress: device.ip, requestUrl: `https://${target.url}/page/${Math.random().toString(36).substring(7)}`, dnsQuery: target.url, matchedPattern: policy.pattern.split(',')[0], actionTaken: policy.action, severity: policy.severity, userNotified: Math.random() > 0.3, metadata: JSON.stringify({ browser: ['Chrome', 'Firefox', 'Edge'][Math.floor(Math.random() * 3)], os: device.os, department: device.dept }), timestamp: randomDate(30) }
        });
    }
    console.log('  ✓ Created 250 policy violations');

    // ========= 10. CREATE DEVICES (45) =========
    console.log('\n💻 Creating enterprise devices (45)...');
    for (const d of devicesData) {
        await prisma.deviceStatus.create({
            data: { deviceId: d.deviceId, hostname: d.hostname, ipAddress: d.ip, macAddress: generateMAC(), deviceType: d.type, manufacturer: d.manufacturer, model: d.model, osName: d.os, osVersion: d.osVer, agentVersion: 'ANRI-Agent v2.4.1', userName: d.userName, userDepartment: d.dept, status: d.status, isolatedAt: d.isolatedAt || null, isolationReason: d.reason || null, lastSeen: d.status === 'OFFLINE' ? randomDate(5) : new Date() }
        });
    }
    console.log('  ✓ Created', devicesData.length, 'devices');

    // ========= 11. CREATE REGULATIONS (12) =========
    console.log('\n📜 Creating regulations (12)...');
    for (const r of regulationsData) {
        await prisma.regulation.create({
            data: { name: r.name, code: r.code, description: r.description, category: r.category, issuingBody: r.issuingBody, status: r.status, ownerDepartment: r.ownerDepartment, lastReviewDate: randomDate(60), nextReviewDate: new Date(Date.now() + 90 * 86400000), isActive: true }
        });
    }
    console.log('  ✓ Created', regulationsData.length, 'regulations');

    // ========= 12. CREATE KPI METRICS (84) =========
    console.log('\n📊 Creating KPI metrics (84 - 12 months x 7 categories)...');
    const kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'];
    const kpiBase = { MTTD: 5, MTTR: 60, COMPLIANCE_RATE: 88, ANOMALY_ACCURACY: 85, POLICY_VIOLATIONS: 150, DOCUMENT_RISK: 35, SYSTEM_HEALTH: 92 };
    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;
        for (const cat of kpiCategories) {
            const improvement = month * 0.5;
            let value = kpiBase[cat];
            if (['MTTD', 'MTTR', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK'].includes(cat)) {
                value = Math.max(value - improvement * (cat === 'MTTD' ? 0.3 : 1), cat === 'MTTD' ? 2 : 20);
            } else {
                value = Math.min(value + improvement * 0.6, 99);
            }
            await prisma.kPIMetric.create({
                data: { name: `${cat} - ${period}`, category: cat, value: value + (Math.random() - 0.5) * 5, target: cat.includes('RATE') || cat.includes('ACCURACY') || cat === 'SYSTEM_HEALTH' ? 95 : null, trend: month > 0 ? ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] : null, period, calculatedAt: new Date(2024, month, 28) }
            });
        }
    }
    console.log('  ✓ Created 84 KPI metrics');

    // ========= 13. CREATE RISK POSTURE (30 days) =========
    console.log('\n🎯 Creating risk posture snapshots (30 days)...');
    for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const improvement = (30 - day) * 0.3;
        await prisma.riskPosture.create({
            data: { overallScore: Math.max(25 - improvement, 15) + Math.random() * 5, documentRisk: Math.max(30 - improvement, 20) + Math.random() * 5, digitalRisk: Math.max(35 - improvement, 18) + Math.random() * 5, complianceRisk: Math.max(20 - improvement, 10) + Math.random() * 5, criticalCount: Math.max(Math.floor(8 - improvement / 5), 2), highCount: Math.max(Math.floor(15 - improvement / 3), 5), mediumCount: Math.floor(25 + Math.random() * 10), lowCount: Math.floor(40 + Math.random() * 20), calculatedAt: date }
        });
    }
    console.log('  ✓ Created 30 risk posture snapshots');

    // ========= 14. CREATE AUDIT LOGS (600) =========
    console.log('\n🔐 Creating cryptographic audit logs (600)...');
    const actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN', 'LOGOUT', 'POLICY_TRIGGER', 'EXPORT', 'APPROVE'];
    const entityTypes = ['Document', 'User', 'Zone', 'PolicyRule', 'Session', 'AnomalyAlert', 'DeviceStatus', 'ApprovalRequest'];
    let previousHash = '';
    for (let i = 0; i < 600; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const user = userList[Math.floor(Math.random() * userList.length)];
        const timestamp = randomDate(30);
        const logData = { action, entityType, entityId: `ent-${Math.random().toString(36).substring(7)}`, userId: user.id, timestamp: timestamp.toISOString() };
        const signature = generateSignature(JSON.stringify(logData));
        const currentHash = generateHash(previousHash + signature);
        await prisma.auditLog.create({
            data: { action, entityType, entityId: logData.entityId, userId: user.id, userName: user.name, details: JSON.stringify({ ip: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 254) + 1}`, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', description: `${action} operation on ${entityType}` }), ipAddress: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 254) + 1}`, previousHash, currentHash, signature, timestamp }
        });
        previousHash = currentHash;
    }
    console.log('  ✓ Created 600 audit logs with blockchain signatures');

    // ========= 15. CREATE APPROVAL REQUESTS (40) =========
    console.log('\n✅ Creating approval requests (40)...');
    for (let i = 0; i < 40; i++) {
        const approvalType = approvalTypes[Math.floor(Math.random() * approvalTypes.length)];
        const requester = userList[Math.floor(Math.random() * userList.length)];
        const status = ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'][Math.floor(Math.random() * 4)];
        const request = await prisma.approvalRequest.create({
            data: { requestNumber: `REQ-2024-${String(i + 1).padStart(4, '0')}`, type: approvalType.type, subject: `${approvalType.subject} - ${requester.department}`, description: `Permintaan ${approvalType.subject.toLowerCase()} dari ${requester.name} (${requester.department})`, priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)], status, currentLevel: 1, requiredLevel: Math.floor(Math.random() * 2) + 1, requesterId: requester.id, approvedById: status === 'APPROVED' ? userList.find(u => u.role === 'EXECUTIVE')?.id : null, approvedAt: status === 'APPROVED' ? randomDate(14) : null, createdAt: randomDate(30) }
        });
        await prisma.approvalStep.create({
            data: { requestId: request.id, level: 1, roleRequired: 'IT_SECURITY', status: status === 'PENDING' ? 'PENDING' : status === 'APPROVED' ? 'APPROVED' : 'REJECTED', decidedAt: status !== 'PENDING' ? randomDate(7) : null }
        });
    }
    console.log('  ✓ Created 40 approval requests with steps');

    // ========= 16. CREATE AUDIT SCHEDULES (15) =========
    console.log('\n📅 Creating audit schedules (15)...');
    const auditSchedules = [
        { name: 'Audit Internal Kearsipan Q1', type: 'INTERNAL', status: 'COMPLETED', auditorName: 'Tim Inspektorat ANRI', findings: 5, critical: 1 },
        { name: 'Audit ISO 27001 Surveillance', type: 'SURVEILLANCE', status: 'COMPLETED', auditorName: 'BSI Group Indonesia', findings: 3, critical: 0 },
        { name: 'Audit BPK Semester II', type: 'EXTERNAL', status: 'SCHEDULED', auditorName: 'Tim Audit BPK', findings: 0, critical: 0 },
        { name: 'Audit Keamanan Sistem IT', type: 'INTERNAL', status: 'IN_PROGRESS', auditorName: 'Maya Kusuma, CISSP', findings: 2, critical: 0 },
        { name: 'Audit Sertifikasi ISO 15489', type: 'CERTIFICATION', status: 'SCHEDULED', auditorName: 'SGS Indonesia', findings: 0, critical: 0 },
        { name: 'Audit Kepatuhan Regulasi', type: 'INTERNAL', status: 'COMPLETED', auditorName: 'Citra Dewi, S.H.', findings: 8, critical: 2 },
        { name: 'Audit Infrastruktur TI', type: 'INTERNAL', status: 'COMPLETED', auditorName: 'Ahmad Fauzi, S.Kom.', findings: 4, critical: 0 },
        { name: 'Audit Khusus Dana Hibah', type: 'SPECIAL', status: 'COMPLETED', auditorName: 'Tim Audit Khusus', findings: 2, critical: 0 },
        { name: 'Audit ISO 22301 BCM', type: 'CERTIFICATION', status: 'SCHEDULED', auditorName: 'TÜV Rheinland', findings: 0, critical: 0 },
        { name: 'Audit Keamanan Fisik', type: 'INTERNAL', status: 'COMPLETED', auditorName: 'Tim Keamanan ANRI', findings: 6, critical: 1 },
        { name: 'Audit Pengelolaan Arsip Vital', type: 'INTERNAL', status: 'IN_PROGRESS', auditorName: 'Hendra Wijaya, S.Ars.', findings: 1, critical: 0 },
        { name: 'Surveillance ISO 27001 Tahun 2', type: 'SURVEILLANCE', status: 'SCHEDULED', auditorName: 'BSI Group Indonesia', findings: 0, critical: 0 },
        { name: 'Audit SPBE Nasional', type: 'EXTERNAL', status: 'SCHEDULED', auditorName: 'Tim Evaluator KemenPAN-RB', findings: 0, critical: 0 },
        { name: 'Audit Kinerja Tahunan', type: 'INTERNAL', status: 'COMPLETED', auditorName: 'Inspektorat Jenderal', findings: 12, critical: 3 },
        { name: 'Audit Khusus Pengadaan', type: 'SPECIAL', status: 'COMPLETED', auditorName: 'Tim Audit Khusus', findings: 7, critical: 1 },
    ];
    for (let i = 0; i < auditSchedules.length; i++) {
        const a = auditSchedules[i];
        await prisma.auditSchedule.create({
            data: { name: a.name, type: a.type, description: `Pelaksanaan ${a.name}`, scheduledDate: new Date(2024, i % 12, 15 + Math.floor(Math.random() * 10)), completedDate: a.status === 'COMPLETED' ? randomDate(30) : null, status: a.status, auditorName: a.auditorName, auditorOrg: a.auditorName.includes('BSI') ? 'BSI Group Indonesia' : a.auditorName.includes('BPK') ? 'Badan Pemeriksa Keuangan' : 'Internal ANRI', findings: a.findings, criticalFindings: a.critical, reportUrl: a.status === 'COMPLETED' ? `/reports/audit/${a.name.toLowerCase().replace(/\s+/g, '-')}.pdf` : null }
        });
    }
    console.log('  ✓ Created 15 audit schedules');

    // ========= 17. CREATE COMPLIANCE METRICS (60) =========
    console.log('\n📈 Creating compliance metrics (60)...');
    const complianceCategories = ['POLICY_ACK', 'AUDIT_READY', 'REGULATION', 'SECURITY_POSTURE', 'DOCUMENT_RETENTION'];
    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;
        for (const cat of complianceCategories) {
            const baseValue = { POLICY_ACK: 85, AUDIT_READY: 90, REGULATION: 92, SECURITY_POSTURE: 78, DOCUMENT_RETENTION: 95 }[cat];
            await prisma.complianceMetric.create({
                data: { name: `${cat} Score - ${period}`, category: cat, value: baseValue + month * 0.5 + (Math.random() - 0.5) * 5, target: 95, unit: '%', trend: month > 0 ? ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] : null, period, calculatedAt: new Date(2024, month, 28) }
            });
        }
    }
    console.log('  ✓ Created 60 compliance metrics');

    // ========= 18. CREATE NOTIFICATIONS (100) =========
    console.log('\n🔔 Creating notifications (100)...');
    const notificationTypes = ['POLICY_VIOLATION', 'ACCESS_SUSPENDED', 'DEVICE_ISOLATED', 'WARNING', 'INFORMATION'];
    for (let i = 0; i < 100; i++) {
        const user = userList[Math.floor(Math.random() * userList.length)];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const titles = {
            POLICY_VIOLATION: 'Pelanggaran Kebijakan Terdeteksi',
            ACCESS_SUSPENDED: 'Akses Anda Ditangguhkan',
            DEVICE_ISOLATED: 'Perangkat Anda Diisolasi',
            WARNING: 'Peringatan Keamanan',
            INFORMATION: 'Informasi Sistem',
        };
        await prisma.notification.create({
            data: { userId: user.id, type, title: titles[type], message: `Notifikasi ${type.toLowerCase().replace('_', ' ')} untuk pengguna ${user.name}`, isRead: Math.random() > 0.4, readAt: Math.random() > 0.4 ? randomDate(7) : null, createdAt: randomDate(14) }
        });
    }
    console.log('  ✓ Created 100 notifications');

    // ========= FINAL SUMMARY =========
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Final Data Summary:');
    const counts = {
        users: await prisma.user.count(),
        zones: await prisma.zone.count(),
        rfidReaders: await prisma.rFIDReader.count(),
        documents: await prisma.document.count(),
        movements: await prisma.documentMovement.count(),
        anomalies: await prisma.anomalyAlert.count(),
        policies: await prisma.policyRule.count(),
        violations: await prisma.policyViolation.count(),
        devices: await prisma.deviceStatus.count(),
        regulations: await prisma.regulation.count(),
        kpis: await prisma.kPIMetric.count(),
        riskPosture: await prisma.riskPosture.count(),
        auditLogs: await prisma.auditLog.count(),
        approvals: await prisma.approvalRequest.count(),
        auditSchedules: await prisma.auditSchedule.count(),
        complianceMetrics: await prisma.complianceMetric.count(),
        notifications: await prisma.notification.count(),
    };
    console.log(counts);
    console.log('\n🎯 TOTAL RECORDS:', Object.values(counts).reduce((a, b) => a + b, 0));
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
