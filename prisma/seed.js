// PRESIDENTIAL DEMO - FULL SEED EXECUTOR (UPSERT VERSION)
// Robust seed script using upsert to prevent P2002 errors

require('dotenv/config');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Use standard package
const { PrismaClient } = require('@prisma/client');

// DB connection
console.log('DEBUG: DATABASE_URL exists:', !!process.env.DATABASE_URL);
const prisma = new PrismaClient();

// Import data
const { usersData, zonesData, rfidReadersData, documentsData, randomDate, generateMAC, generateSignature, generateHash } = require('../scripts/seed-data/core-data');
const { policyRulesData, devicesData, regulationsData } = require('../scripts/seed-data/policy-device-data');

// Violation target sites and other constants (same as before)
const violationTargets = [
    { url: 'bet365.com', policy: 'Block Gambling Sites' },
    // ... (truncated list for brevity in thought but mostly kept in full content if needed, but I'll strip for reliability)
    { url: 'pokerstars.com', policy: 'Block Gambling Sites' },
    { url: 'facebook.com', policy: 'Restrict Social Media' },
    { url: 'youtube.com', policy: 'Block Video Streaming' },
    { url: 'nordvpn.com', policy: 'Block Unauthorized VPN/Proxy' },
    { url: 'tokopedia.com', policy: 'Monitor E-commerce Access' },
];

const approvalTypes = [
    { type: 'DOCUMENT_MOVEMENT', subject: 'Pemindahan Arsip Rahasia' },
    { type: 'ZONE_ACCESS', subject: 'Akses Zona Keamanan Tinggi' },
    { type: 'POLICY_EXCEPTION', subject: 'Pengecualian Kebijakan Sementara' },
];

async function main() {
    console.log('🚀 SEED START (UPSERT MODE)\n');

    // Store references
    const users = {};
    const zones = {};
    const readers = {};
    const documents = {};
    const policies = {};

    // Do NOT Clear dictionaries to avoid FK issues, just Upsert.
    // Clear transactional tables that we will re-generate?
    // If we re-generate transactions, we might duplicate them if we don't clear.
    // But clearing violates FK if we don't clear parents.
    // Parents are upserted.
    // So we CAN clear transactional tables safely if we do it first.

    console.log('\n🗑️  Clearing transactional data...');
    try {
        await prisma.auditLog.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.policyViolation.deleteMany();
        await prisma.anomalyAlert.deleteMany();
        await prisma.documentMovement.deleteMany();
        await prisma.documentBaseline.deleteMany();
        await prisma.approvalStep.deleteMany();
        await prisma.approvalRequest.deleteMany();
    } catch (e) { console.warn('Cleanup warning:', e.message); }

    // ========= UPSERT USERS =========
    console.log('\n👥 Upserting users...');
    for (const u of usersData) {
        let password = 'Demo2024!';
        // Map passwords to match frontend Quick Login EXACTLY
        if (u.email === 'admin@anri.go.id') password = 'admin123';
        if (u.email === 'direktur@anri.go.id') password = 'direktur123';
        if (u.email === 'security@anri.go.id') password = 'security123';
        if (u.email === 'compliance@anri.go.id') password = 'compliance123';

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, role: u.role, department: u.department, isActive: true, passwordHash },
            create: { email: u.email, name: u.name, passwordHash, role: u.role, department: u.department, isActive: true }
        });
        users[u.email] = user;
    }

    // ========= UPSERT ZONES =========
    console.log('\n🏢 Upserting zones...');
    for (const z of zonesData) {
        const zone = await prisma.zone.upsert({
            where: { code: z.code },
            update: { name: z.name, securityLevel: z.securityLevel, floor: z.floor, building: z.building, capacity: z.capacity },
            create: { name: z.name, code: z.code, securityLevel: z.securityLevel, floor: z.floor, building: z.building, description: z.description, capacity: z.capacity, isActive: true }
        });
        zones[z.code] = zone;
    }

    // ========= UPSERT RFID READERS =========
    console.log('\n📡 Upserting readers...');
    for (const r of rfidReadersData) {
        const zoneId = zones[r.zoneCode] ? zones[r.zoneCode].id : null;
        if (!zoneId) continue;
        const reader = await prisma.rFIDReader.upsert({
            where: { readerId: r.readerId },
            update: { name: r.name, type: r.type, zoneId: zoneId, isOnline: r.isOnline },
            create: { readerId: r.readerId, name: r.name, type: r.type, zoneId: zoneId, isOnline: r.isOnline, lastPing: new Date() }
        });
        readers[r.readerId] = reader;
    }

    // ========= UPSERT DOCUMENTS =========
    console.log('\n📄 Upserting documents...');
    for (const d of documentsData) {
        const zoneId = zones[d.zoneCode] ? zones[d.zoneCode].id : null;
        if (!zoneId) continue;
        const doc = await prisma.document.upsert({
            where: { rfidTag: d.rfidTag },
            update: { title: d.title, classification: d.classification, currentZoneId: zoneId },
            create: { rfidTag: d.rfidTag, title: d.title, description: `Dokumen: ${d.title}`, classification: d.classification, organizationUnit: d.orgUnit, currentZoneId: zoneId, isActive: true }
        });
        documents[d.rfidTag] = doc;

        // Re-create baseline (deleted above)
        // If upsert doc didn't change ID, this is fine.
        // We catch error in case baseline exists (not deleted?)
        try {
            await prisma.documentBaseline.create({
                data: { documentId: doc.id, normalHoursStart: 8, normalHoursEnd: 17, featureVector: "{}", modelVersion: 'v1.3.0', lastTrainedAt: new Date(), confidenceScore: 0.9 }
            });
        } catch (e) { }
    }

    // ========= UPSERT POLICIES =========
    console.log('\n📋 Upserting policies...');
    for (const p of policyRulesData) {
        // Assume name is unique or use findFirst
        const existing = await prisma.policyRule.findFirst({ where: { name: p.name } });
        let policy;
        if (existing) {
            policy = await prisma.policyRule.update({ where: { id: existing.id }, data: { description: p.description, severity: p.severity } });
        } else {
            policy = await prisma.policyRule.create({ data: { name: p.name, description: p.description, category: p.category, pattern: p.pattern, action: p.action, severity: p.severity, priority: p.priority, isActive: true } });
        }
        policies[p.name] = policy;
    }

    // ========= UPSERT DEVICES =========
    console.log('\n💻 Upserting devices...');
    for (const d of devicesData) {
        const macAddress = generateMAC();
        const lastSeen = d.status === 'OFFLINE'
            ? new Date(Date.now() - (24 + Math.floor(Math.random() * 72)) * 60 * 60 * 1000)
            : new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000);

        await prisma.deviceStatus.upsert({
            where: { deviceId: d.deviceId },
            update: {
                hostname: d.hostname,
                ipAddress: d.ip,
                macAddress: macAddress,
                deviceType: d.type,
                manufacturer: d.manufacturer,
                model: d.model,
                osName: d.os,
                osVersion: d.osVer,
                userName: d.userName,
                userDepartment: d.dept,
                status: d.status,
                isolatedAt: d.isolatedAt || null,
                isolationReason: d.reason || null,
                lastSeen: lastSeen,
            },
            create: {
                deviceId: d.deviceId,
                hostname: d.hostname,
                ipAddress: d.ip,
                macAddress: macAddress,
                deviceType: d.type,
                manufacturer: d.manufacturer,
                model: d.model,
                osName: d.os,
                osVersion: d.osVer,
                userName: d.userName,
                userDepartment: d.dept,
                status: d.status,
                isolatedAt: d.isolatedAt || null,
                isolationReason: d.reason || null,
                lastSeen: lastSeen,
            },
        });
    }
    console.log(`  ✓ Upserted ${devicesData.length} devices`);

    // ========= UPSERT REGULATIONS (12 regulations) =========
    console.log('\n📜 Upserting regulations...');
    await prisma.regulation.deleteMany();
    for (const r of regulationsData) {
        await prisma.regulation.create({
            data: {
                code: r.code,
                name: r.name,
                category: r.category,
                issuingBody: r.issuingBody,
                status: r.status,
                ownerDepartment: r.ownerDepartment,
                description: r.description,
                isActive: true,
                lastReviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            },
        });
    }
    console.log(`  ✓ Created ${regulationsData.length} regulations`);

    // ========= CREATE AUDIT SCHEDULES (8 audits) =========
    console.log('\n📋 Creating audit schedules...');
    await prisma.auditSchedule.deleteMany();
    const auditData = [
        { name: 'Audit ISO 27001 Annual', type: 'EXTERNAL', auditorOrg: 'TÜV Rheinland Indonesia', status: 'COMPLETED', scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), completedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), findings: 3, critical: 0 },
        { name: 'Audit Kearsipan BPK', type: 'EXTERNAL', auditorOrg: 'BPK RI', status: 'COMPLETED', scheduledDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), completedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), findings: 5, critical: 1 },
        { name: 'Internal Audit Q4 2024', type: 'INTERNAL', auditorOrg: 'Inspektorat ANRI', status: 'COMPLETED', scheduledDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), findings: 7, critical: 0 },
        { name: 'Audit SPBE Kemenpan', type: 'EXTERNAL', auditorOrg: 'Kemen PAN-RB', status: 'IN_PROGRESS', scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completedDate: null, findings: 2, critical: 0 },
        { name: 'Audit Keamanan Siber BSSN', type: 'EXTERNAL', auditorOrg: 'BSSN', status: 'SCHEDULED', scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), completedDate: null, findings: 0, critical: 0 },
        { name: 'Internal Audit Q1 2025', type: 'INTERNAL', auditorOrg: 'Inspektorat ANRI', status: 'SCHEDULED', scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), completedDate: null, findings: 0, critical: 0 },
        { name: 'Review ISO 15489 Records', type: 'INTERNAL', auditorOrg: 'Tim Preservasi', status: 'COMPLETED', scheduledDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), completedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), findings: 2, critical: 0 },
        { name: 'Audit Manajemen Risiko', type: 'INTERNAL', auditorOrg: 'Inspektorat ANRI', status: 'COMPLETED', scheduledDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), completedDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), findings: 4, critical: 1 },
    ];
    for (const a of auditData) {
        await prisma.auditSchedule.create({
            data: {
                name: a.name,
                type: a.type,
                auditorOrg: a.auditorOrg,
                status: a.status,
                scheduledDate: a.scheduledDate,
                completedDate: a.completedDate,
                findings: a.findings,
                criticalFindings: a.critical,
            },
        });
    }
    console.log(`  ✓ Created ${auditData.length} audit schedules`);

    // ========= CREATE COMPLIANCE METRICS =========
    console.log('\n📈 Creating compliance metrics...');
    await prisma.complianceMetric.deleteMany();
    const metricsData = [
        { name: 'Audit Readiness Score', category: 'AUDIT_READY', value: 91, target: 95, unit: '%', trend: 'UP' },
        { name: 'Regulation Compliance Rate', category: 'REGULATION_COMPLIANCE', value: 87, target: 100, unit: '%', trend: 'STABLE' },
        { name: 'Policy Acknowledgment Rate', category: 'POLICY_ACK', value: 96, target: 100, unit: '%', trend: 'UP' },
        { name: 'Document Classification Accuracy', category: 'DOC_CLASSIFICATION', value: 94, target: 98, unit: '%', trend: 'UP' },
        { name: 'Security Training Completion', category: 'TRAINING', value: 88, target: 100, unit: '%', trend: 'UP' },
        { name: 'Incident Response Time', category: 'INCIDENT_RESPONSE', value: 15, target: 30, unit: 'min', trend: 'DOWN' },
    ];
    for (const m of metricsData) {
        await prisma.complianceMetric.create({
            data: {
                name: m.name,
                category: m.category,
                value: m.value,
                target: m.target,
                unit: m.unit,
                trend: m.trend,
                period: '2025-01',
                calculatedAt: new Date(),
            },
        });
    }
    console.log(`  ✓ Created ${metricsData.length} compliance metrics`);

    // ========= CREATE DOCUMENT MOVEMENTS (300+) =========
    console.log('\n🚶 Creating document movements...');
    const movements = [];
    const zoneList = Object.values(zones);
    const readerList = Object.values(readers);
    const docList = Object.values(documents);

    for (let i = 0; i < 350; i++) {
        const doc = docList[Math.floor(Math.random() * docList.length)];
        const fromZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const toZone = zoneList[Math.floor(Math.random() * zoneList.length)];
        const reader = readerList.find(r => r.zoneId === toZone.id) || readerList[0];
        const isAnomaly = Math.random() < 0.15; // 15% anomaly rate

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
    console.log(`  ✓ Created ${movements.length} document movements`);

    // ========= CREATE ANOMALY ALERTS (50+) =========
    console.log('\n⚠️  Creating anomaly alerts...');
    const anomalyTypes = ['UNAUTHORIZED_ZONE', 'AFTER_HOURS_ACCESS', 'UNUSUAL_FREQUENCY', 'PATTERN_DEVIATION', 'RAPID_MOVEMENT'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const anomalyMovements = movements.filter(m => m.isAnomaly);

    for (const mov of anomalyMovements.slice(0, 60)) {
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const explanations = {
            UNAUTHORIZED_ZONE: `Dokumen dengan klasifikasi ${mov.doc.classification} terdeteksi di zona ${mov.toZone.name} yang tidak diizinkan.`,
            AFTER_HOURS_ACCESS: `Pergerakan dokumen terdeteksi di luar jam operasional normal (08:00-17:00 WIB).`,
            UNUSUAL_FREQUENCY: `Dokumen mengalami pergerakan melebihi baseline normal.`,
            PATTERN_DEVIATION: `Pola pergerakan dokumen menyimpang dari profil behavioral. Rute ${mov.fromZone.name} → ${mov.toZone.name} belum tercatat.`,
            RAPID_MOVEMENT: `Dokumen berpindah melalui multiple zona dalam waktu singkat.`,
        };

        const factors = [
            { factor: 'Zone Security Mismatch', weight: 0.3 + Math.random() * 0.2 },
            { factor: 'Time Anomaly', weight: 0.2 + Math.random() * 0.15 },
            { factor: 'Frequency Deviation', weight: 0.25 + Math.random() * 0.15 },
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
    }
    console.log(`  ✓ Created ${Math.min(anomalyMovements.length, 60)} anomaly alerts`);

    // ========= CREATE POLICY VIOLATIONS (linked to real devices) =========
    console.log('\n🚫 Creating policy violations...');
    const userList = Object.values(users);
    const policyList = Object.values(policies);

    // Define which devices should have violations (using actual deviceIds)
    const devicesWithViolations = [
        // Isolated devices (most violations)
        { id: 'KRS-WS-005', count: 47, sites: ['bet365.com', 'sbobet.com', 'pokerstars.com'] },
        { id: 'ADM-WS-001', count: 23, sites: ['pornhub.com', 'xvideos.com'] },
        { id: 'HUM-LT-001', count: 15, sites: ['coinhive.com', 'nicehash.com'] },
        { id: 'FIN-WS-001', count: 52, sites: ['sbobet.com', 'maxbet.com', 'ibcbet.com', 'bet365.com'] },
        { id: 'PRV-WS-005', count: 8, sites: ['nordvpn.com', 'expressvpn.com'] },
        // Regular active devices with some violations
        { id: 'IT-WS-001', count: 3, sites: ['youtube.com', 'netflix.com'] },
        { id: 'AUD-WS-001', count: 2, sites: ['facebook.com', 'instagram.com'] },
        { id: 'PRV-WS-001', count: 5, sites: ['tokopedia.com', 'shopee.co.id'] },
        { id: 'KRS-WS-001', count: 7, sites: ['youtube.com', 'tiktok.com', 'facebook.com'] },
        { id: 'KRS-WS-002', count: 4, sites: ['twitter.com', 'instagram.com'] },
        { id: 'EXEC-LT-002', count: 1, sites: ['linkedin.com'] },
        { id: 'IT-LT-001', count: 2, sites: ['github.com', 'stackoverflow.com'] },
        { id: 'PRV-WS-003', count: 6, sites: ['youtube.com', 'twitch.tv'] },
        { id: 'PRV-WS-004', count: 3, sites: ['facebook.com', 'twitter.com'] },
    ];

    let totalViolations = 0;
    for (const dv of devicesWithViolations) {
        for (let i = 0; i < dv.count; i++) {
            const policy = policyList[Math.floor(Math.random() * policyList.length)];
            const user = userList[Math.floor(Math.random() * userList.length)];
            const site = dv.sites[Math.floor(Math.random() * dv.sites.length)];

            if (!policy || !user) continue;

            try {
                await prisma.policyViolation.create({
                    data: {
                        policyId: policy.id,
                        userId: user.id,
                        deviceId: dv.id,
                        ipAddress: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                        requestUrl: `https://${site}/page/${Math.random().toString(36).substring(7)}`,
                        dnsQuery: site,
                        matchedPattern: site,
                        actionTaken: policy.action || 'BLOCK',
                        severity: policy.severity || 'MEDIUM',
                        userNotified: Math.random() > 0.3,
                        metadata: JSON.stringify({ browser: 'Chrome', os: 'Windows 11' }),
                        timestamp: randomDate(30),
                    },
                });
                totalViolations++;
            } catch (e) { /* ignore duplicate */ }
        }
    }
    console.log(`  ✓ Created ${totalViolations} policy violations linked to devices`);

    // ========= CREATE APPROVAL REQUESTS WITH FULL METADATA =========
    console.log('\n📋 Creating approval requests...');

    // Get sample documents for realistic metadata
    const sampleDocs = docList.slice(0, 15);

    const approvalRequestsData = [
        // APPROVED requests (with document context)  
        { reqNum: 'REQ-2024-0101', type: 'DOCUMENT_MOVEMENT', subject: 'Perpindahan Dokumen SK Presiden ke Ruang Rapat VIP', priority: 'URGENT', status: 'APPROVED', docIdx: 0, fromZone: 'ZONA-A1', toZone: 'ZONA-B2' },
        { reqNum: 'REQ-2024-0102', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Arsip BIN ke Ruang Vault', priority: 'HIGH', status: 'APPROVED', docIdx: 1, fromZone: 'ZONA-A1', toZone: 'ZONA-A2' },
        { reqNum: 'REQ-2024-0103', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Arsip Historis ke Ruang Digitalisasi', priority: 'NORMAL', status: 'APPROVED', docIdx: 2, fromZone: 'ZONA-B1', toZone: 'ZONA-A2' },
        { reqNum: 'REQ-2024-0104', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Dokumen Perjanjian Internasional', priority: 'NORMAL', status: 'APPROVED', docIdx: 3, fromZone: 'ZONA-A1', toZone: 'ZONA-B1' },
        { reqNum: 'REQ-2024-0105', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Arsip KPK ke Cold Storage', priority: 'HIGH', status: 'APPROVED', docIdx: 4, fromZone: 'ZONA-A1', toZone: 'ZONA-C1' },
        { reqNum: 'REQ-2024-0106', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Dokumen Kemenkeu untuk Audit', priority: 'NORMAL', status: 'APPROVED', docIdx: 5, fromZone: 'ZONA-B1', toZone: 'ZONA-B2' },

        // PENDING requests
        { reqNum: 'REQ-2024-0120', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen BSSN ke Secure Zone', priority: 'URGENT', status: 'PENDING', docIdx: 6, fromZone: 'ZONA-B1', toZone: 'ZONA-A1' },
        { reqNum: 'REQ-2024-0121', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer 15 Dokumen ke Preservasi', priority: 'NORMAL', status: 'PENDING', docIdx: 7, fromZone: 'ZONA-R1', toZone: 'ZONA-A2' },
        { reqNum: 'REQ-2024-0122', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Arsip UNESCO ke Ruang Pameran', priority: 'NORMAL', status: 'PENDING', docIdx: 8, fromZone: 'ZONA-R1', toZone: 'ZONA-L1' },
        { reqNum: 'REQ-2024-0123', type: 'DOCUMENT_MOVEMENT', subject: 'Request Akses Dokumen Kolonial', priority: 'HIGH', status: 'PENDING', docIdx: 9, fromZone: 'ZONA-R1', toZone: 'ZONA-B1' },

        // REJECTED requests
        { reqNum: 'REQ-2024-0110', type: 'DOCUMENT_MOVEMENT', subject: 'Pinjam Dokumen SECRET untuk Penelitian Personal', priority: 'LOW', status: 'REJECTED', docIdx: 10, fromZone: 'ZONA-A1', toZone: 'ZONA-L1' },
        { reqNum: 'REQ-2024-0111', type: 'DOCUMENT_MOVEMENT', subject: 'Bawa Pulang Dokumen Rahasia untuk WFH', priority: 'NORMAL', status: 'REJECTED', docIdx: 11, fromZone: 'ZONA-A1', toZone: 'ZONA-L1' },
    ];

    for (const req of approvalRequestsData) {
        const requester = userList[Math.floor(Math.random() * userList.length)];
        const doc = sampleDocs[req.docIdx % sampleDocs.length];
        const fromZone = zones[req.fromZone];
        const toZone = zones[req.toZone];

        // Create metadata matching what the frontend expects (truncate title to avoid P2000)
        const truncTitle = doc.title.length > 60 ? doc.title.substring(0, 57) + '...' : doc.title;
        const metadata = JSON.stringify({
            documentId: doc.id,
            documentTitle: truncTitle,
            rfidTag: doc.rfidTag,
            classification: doc.classification,
            fromZoneId: fromZone.id,
            fromZoneName: fromZone.name,
            toZoneId: toZone.id,
            toZoneName: toZone.name,
        });

        await prisma.approvalRequest.create({
            data: {
                requestNumber: req.reqNum,
                type: req.type,
                subject: req.subject.substring(0, 100),
                description: `Permintaan pemindahan dokumen "${truncTitle}" dari ${fromZone.name} ke ${toZone.name}.`,
                priority: req.priority,
                status: req.status,
                currentLevel: req.status === 'APPROVED' ? 2 : 1,
                requiredLevel: doc.classification === 'SECRET' ? 3 : doc.classification === 'RESTRICTED' ? 2 : 1,
                requesterId: requester.id,
                metadata: metadata,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: randomDate(15),
            },
        });
    }
    console.log(`  ✓ Created ${approvalRequestsData.length} approval requests with metadata`);

    // ========= CREATE AUDIT LOGS (300+) =========
    console.log('\n🔐 Creating audit logs...');
    const actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN', 'LOGOUT'];
    const entityTypes = ['Document', 'User', 'Zone', 'PolicyRule', 'Session'];
    const browsers = ['Chrome/120.0', 'Firefox/121.0', 'Safari/17.2', 'Edge/120.0'];
    let previousHashLog = '';

    for (let i = 0; i < 300; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const user = userList[Math.floor(Math.random() * userList.length)];
        const timestamp = randomDate(30);
        const browser = browsers[Math.floor(Math.random() * browsers.length)];

        const logData = { action, entityType, entityId: `ent-${Math.random().toString(36).substring(7)}`, userId: user.id, timestamp: timestamp.toISOString() };
        const signature = generateSignature(JSON.stringify(logData));
        const currentHash = generateHash(JSON.stringify(logData) + previousHashLog);

        try {
            await prisma.auditLog.create({
                data: {
                    action,
                    entityType,
                    entityId: logData.entityId,
                    userId: user.id,
                    metadata: JSON.stringify({
                        userName: user.name,
                        userRole: user.role,
                        department: user.department,
                        description: `${action} operation on ${entityType}`,
                        verified: true
                    }),
                    ipAddress: `192.168.${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                    userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ${browser}`,
                    signature,
                    previousHash: previousHashLog || null,
                    timestamp,
                },
            });
            previousHashLog = currentHash;
        } catch (e) {
            // Ignore errors, continue
        }
    }
    console.log('  ✓ Created 300 audit logs');

    // ========= CREATE RISK POSTURE HISTORY (30 days) =========
    console.log('\n📊 Creating risk posture history...');
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(12, 0, 0, 0);

        // Simulate improving risk posture over time with some variation
        const baseScore = 65 - (30 - i) * 0.8; // Improving trend
        const variation = Math.random() * 10 - 5; // +/- 5 variation
        const overallScore = Math.max(25, Math.min(80, baseScore + variation));

        await prisma.riskPosture.create({
            data: {
                overallScore: overallScore,
                documentRisk: Math.max(15, Math.min(85, overallScore + Math.random() * 15 - 7)),
                digitalRisk: Math.max(20, Math.min(80, overallScore + Math.random() * 20 - 10)),
                complianceRisk: Math.max(10, Math.min(50, overallScore * 0.4 + Math.random() * 10)),
                criticalCount: Math.floor(Math.random() * 5),
                highCount: Math.floor(Math.random() * 12) + 2,
                mediumCount: Math.floor(Math.random() * 25) + 5,
                lowCount: Math.floor(Math.random() * 40) + 10,
                calculatedAt: date,
            },
        });
    }
    console.log('  ✓ Created 31 risk posture history records');

    console.log('\n✅ Seed completed successfully!');
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
