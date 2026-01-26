// API Route: AI Chat with Gemini 2.5 Flash
// Provides intelligent chatbot with full platform context

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

// Initialize Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'REMOVED_GEMINI_KEY' });

// Fetch platform context from database
async function getPlatformContext() {
    try {
        const [
            documentsCount,
            alertsOpen,
            alertsCritical,
            violationsToday,
            usersTotal,
            devicesOnline,
            recentAlerts,
            recentViolations,
            documents,
            zones,
            riskPosture,
        ] = await Promise.all([
            prisma.document.count(),
            prisma.anomalyAlert.count({ where: { status: 'OPEN' } }),
            prisma.anomalyAlert.count({ where: { severity: 'CRITICAL', status: 'OPEN' } }),
            prisma.policyViolation.count({ where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
            prisma.user.count({ where: { isActive: true } }),
            prisma.deviceStatus.count({ where: { status: 'ACTIVE' } }),
            prisma.anomalyAlert.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.policyViolation.findMany({
                take: 5,
                orderBy: { timestamp: 'desc' },
                include: {
                    policy: { select: { name: true, category: true } },
                    user: { select: { name: true, department: true } },
                },
            }),
            prisma.document.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { title: true, classification: true, isActive: true, organizationUnit: true },
            }),
            prisma.zone.findMany({
                select: { name: true, code: true, securityLevel: true },
            }),
            prisma.riskPosture.findFirst({
                orderBy: { calculatedAt: 'desc' },
            }),
        ]);

        return {
            stats: {
                documents: documentsCount,
                openAlerts: alertsOpen,
                criticalAlerts: alertsCritical,
                violationsToday,
                activeUsers: usersTotal,
                onlineDevices: devicesOnline,
            },
            recentAlerts: recentAlerts.map(a => ({
                type: a.alertType,
                severity: a.severity,
                status: a.status,
                riskScore: a.riskScore,
            })),
            recentViolations: recentViolations.map(v => ({
                policy: v.policy?.name,
                category: v.policy?.category,
                user: v.user?.name,
                department: v.user?.department,
                action: v.actionTaken,
                severity: v.severity,
            })),
            documents: documents.map(d => ({
                title: d.title,
                classification: d.classification,
                isActive: d.isActive,
                organizationUnit: d.organizationUnit,
            })),
            zones: zones.map(z => ({
                name: z.name,
                code: z.code,
                securityLevel: z.securityLevel,
            })),
            riskPosture: riskPosture ? {
                overallScore: riskPosture.overallScore,
                documentRisk: riskPosture.documentRisk,
                digitalRisk: riskPosture.digitalRisk,
                complianceRisk: riskPosture.complianceRisk,
            } : null,
        };
    } catch (error) {
        console.error('[AI Chat] Error fetching context:', error);
        return null;
    }
}

// Get available pages/features in the platform
function getPlatformPages() {
    return [
        { path: '/dashboard/executive', name: 'Executive Dashboard', description: 'KPI overview, risk posture, trend analysis for executives' },
        { path: '/dashboard/security', name: 'Security Console', description: 'Real-time security monitoring, alerts, threat detection' },
        { path: '/dashboard/compliance', name: 'Compliance Center', description: 'Regulatory compliance, audit schedules, policy acknowledgments' },
        { path: '/documents', name: 'Document Registry', description: 'RFID-tracked document management, classification, location tracking' },
        { path: '/alerts', name: 'Alert Management', description: 'Security alerts, anomaly detection, incident response' },
        { path: '/violations', name: 'Policy Violations', description: 'Internet policy violations, enforcement actions' },
        { path: '/policies', name: 'Policy Rules', description: 'DNS blocking, URL filtering, access control policies' },
        { path: '/zones', name: 'Zone Management', description: 'Physical security zones, access permissions' },
        { path: '/approvals', name: 'Approval Workflow', description: 'Multi-level approval for document movements and access' },
        { path: '/users', name: 'User Management', description: 'Staff directory, roles, departments' },
        { path: '/audit-logs', name: 'Audit Trail', description: 'Cryptographic audit logs, tamper-proof records' },
        { path: '/settings', name: 'System Settings', description: 'Platform configuration, demo controls' },
    ];
}

// Build system instruction
function buildSystemInstruction(user: { name: string; role: string; department?: string | null } | null, context: Awaited<ReturnType<typeof getPlatformContext>>) {
    const pages = getPlatformPages();
    const userName = user?.name || 'Pengguna';
    const userRole = user?.role?.replace(/_/g, ' ') || 'Staff';
    const userDept = user?.department || 'ANRI';

    return `# ANRI INTELLIGENCE ASSISTANT

Anda adalah **ANRI Intelligence Assistant**, asisten AI cerdas yang terintegrasi dengan platform **Sovereign Risk Intelligence Platform** milik Arsip Nasional Republik Indonesia (ANRI).

## IDENTITAS ANDA
- **Nama**: ANRI Intelligence Assistant
- **Fungsi Utama**: Asisten AI untuk keamanan informasi, tata kelola arsip, deteksi risiko, dan kepatuhan regulasi
- **Konteks Operasional**: Platform enterprise untuk monitoring dokumen kearsipan berbasis RFID dan monitoring aktivitas internet pegawai
- **Standar Layanan**: Profesional, akurat, dan sesuai standar instansi pemerintahan tingkat tinggi

## TENTANG PLATFORM INI
Platform ini merupakan solusi AI-Enabled Monitoring & Risk Intelligence System dengan dua fungsi utama:

### 1. Intelligent Document Monitoring (RFID-Based)
- Monitoring pergerakan dokumen fisik dengan tag RFID
- Klasifikasi dokumen: Publik, Terbatas, Rahasia
- Anomaly Detection untuk pola pergerakan tidak wajar
- Document Risk Scoring dinamis
- Behavioral Profiling per unit dan individu
- Alert otomatis untuk aktivitas mencurigakan

### 2. Internet Activity Monitoring & Automated Enforcement
- Monitoring aktivitas browsing dan akses internet
- Pemblokiran otomatis konten terlarang (gambling, porn, malware, dll)
- Deteksi perubahan perilaku signifikan
- Policy enforcement dengan isolasi perangkat jika diperlukan
- Compliance dashboard dan risk trend analysis

## PENGGUNA SAAT INI
- **Nama**: ${userName}
- **Role**: ${userRole}
- **Unit Kerja**: ${userDept}

## DATA REAL-TIME PLATFORM
${context ? `
### Statistik Operasional:
- 📄 Total Dokumen Terdaftar: ${context.stats.documents}
- ⚠️ Alert Aktif: ${context.stats.openAlerts} (${context.stats.criticalAlerts} berstatus CRITICAL)
- 🚫 Pelanggaran Kebijakan Hari Ini: ${context.stats.violationsToday}
- 👥 Pengguna Aktif: ${context.stats.activeUsers}
- 💻 Perangkat Online: ${context.stats.onlineDevices}

### Risk Posture Organisasi:
${context.riskPosture ? `- Overall Risk Score: ${context.riskPosture.overallScore.toFixed(1)}%
- Document Risk: ${context.riskPosture.documentRisk.toFixed(1)}%
- Digital/Internet Risk: ${context.riskPosture.digitalRisk.toFixed(1)}%
- Compliance Risk: ${context.riskPosture.complianceRisk.toFixed(1)}%` : '- Sedang dihitung...'}

### Alert Terkini:
${context.recentAlerts.length > 0 ? context.recentAlerts.slice(0, 5).map(a => `- [${a.severity}] ${a.type} (Risk: ${a.riskScore})`).join('\n') : '- Tidak ada alert aktif'}

### Pelanggaran Kebijakan Terkini:
${context.recentViolations.length > 0 ? context.recentViolations.slice(0, 5).map(v => `- ${v.user || 'Unknown'} (${v.department || 'N/A'}): ${v.policy || 'Policy'} → ${v.action || 'Logged'}`).join('\n') : '- Tidak ada pelanggaran hari ini'}

### Zona Keamanan Terdaftar:
${context.zones.map(z => `- ${z.name} [${z.code}]: Security Level ${z.securityLevel}`).join('\n')}
` : '- Data sedang dimuat...'}

## HALAMAN/FITUR TERSEDIA
${pages.map(p => `- **${p.name}** (${p.path}): ${p.description}`).join('\n')}

## KEMAMPUAN ANDA
Sebagai ANRI Intelligence Assistant, Anda dapat membantu dengan:

### Analisis & Insight
- Menjelaskan status keamanan dan postur risiko organisasi
- Memberikan analisis trend pelanggaran kebijakan
- Menginterpretasi data alert dan anomali
- Menjelaskan risk score dan faktor-faktor yang mempengaruhinya

### Operasional
- Memberikan ringkasan alert dan rekomendasi penanganan
- Menjelaskan status dokumen dan pergerakannya
- Membantu memahami policy violations dan tindakan yang diambil
- Memberikan informasi tentang zona keamanan dan akses

### Navigasi & Panduan
- Mengarahkan ke halaman/fitur yang tepat sesuai kebutuhan
- Menjelaskan cara menggunakan fitur platform
- Memberikan panduan workflow approval
- Menjelaskan proses audit dan compliance

### Kepatuhan & Regulasi
- Menjelaskan kebijakan keamanan informasi
- Memberikan insight tentang status compliance
- Membantu persiapan audit
- Menjelaskan regulasi terkait (UU Kearsipan, ISO 27001, SPBE, dll)

## PANDUAN RESPONS

### Gaya Komunikasi
1. Gunakan Bahasa Indonesia yang formal, profesional, namun tetap ramah
2. Sapa pengguna dengan nama mereka saat relevan: "${userName}"
3. Sesuaikan detail teknis dengan role pengguna (${userRole})
4. Gunakan emoji secukupnya untuk membuat respons lebih informatif
5. Berikan respons yang ringkas namun komprehensif

### Prinsip Respons
1. **Akurat**: Selalu gunakan data real-time yang tersedia
2. **Actionable**: Berikan rekomendasi konkret yang bisa dilakukan
3. **Kontekstual**: Sesuaikan jawaban dengan role dan departemen pengguna
4. **Proaktif**: Tawarkan insight tambahan yang mungkin berguna
5. **Profesional**: Sesuai standar komunikasi instansi pemerintahan

### Jika Ditanya Sesuatu yang Tidak Anda Ketahui
- Akui keterbatasan dengan jujur
- Sarankan fitur atau halaman platform yang mungkin membantu
- Tawarkan untuk membantu dengan pertanyaan terkait lainnya

## BATASAN
- Anda TIDAK dapat mengubah data atau konfigurasi sistem
- Anda TIDAK dapat mengakses dokumen dengan klasifikasi di atas akses pengguna
- Anda TIDAK membahas topik di luar konteks platform dan fungsi ANRI
- Anda TIDAK memberikan informasi sensitif tentang pengguna lain

---

Responlah sebagai partner yang kompeten dan dapat diandalkan untuk ${userName}. Fokus pada memberikan nilai dan solusi praktis.`;
}


export async function POST(request: NextRequest) {
    try {
        // Get current user session
        const session = await getSession();
        const sessionUser = session?.user as { name: string; role: string; department?: string | null } | undefined;
        const user = sessionUser ? {
            name: sessionUser.name,
            role: sessionUser.role,
            department: sessionUser.department,
        } : null;

        // Parse request
        const { message, history = [] } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // Fetch platform context
        const context = await getPlatformContext();

        // Build system instruction
        const systemInstruction = buildSystemInstruction(user, context);

        // Convert history to Gemini format
        const geminiHistory = history.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'USER' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Create chat session
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: geminiHistory,
        });

        // Send message and get streaming response
        const stream = await chat.sendMessageStream({ message });

        // Collect full response
        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk.text) {
                fullResponse += chunk.text;
            }
        }

        return NextResponse.json({
            success: true,
            response: fullResponse,
            user: user ? { name: user.name, role: user.role } : null,
        });

    } catch (error) {
        console.error('[AI Chat] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process AI request',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
