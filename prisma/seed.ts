// Comprehensive Seed Data for ANRI Platform - Presidential Demo
// This creates 1000+ realistic records across all use cases

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Helper functions
function generateRFIDTag(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tag = 'ANRI-';
    for (let i = 0; i < 6; i++) {
        tag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tag;
}

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

// ============================================================================
// USERS DATA
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

// ============================================================================
// ZONES DATA
// ============================================================================
const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 2', building: 'Gedung A - Arsip Pusat', description: 'Penyimpanan arsip dengan klasifikasi RAHASIA dan SANGAT RAHASIA' },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang pemindaian dan digitalisasi dokumen' },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan', securityLevel: 'STANDARD', floor: 'Lantai 1', building: 'Gedung B - Administrasi', description: 'Kantor utama unit kearsipan dinamis' },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 3', building: 'Gedung B - Administrasi', description: 'Ruang rapat untuk pertemuan tingkat tinggi' },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan', securityLevel: 'RESTRICTED', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Gudang penyimpanan arsip inaktif' },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC', floor: 'Lantai Dasar', building: 'Gedung A - Arsip Pusat', description: 'Area lobby dan resepsionis utama' },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang baca untuk pengunjung umum' },
    { code: 'ZONA-S1', name: 'Ruang Server', securityLevel: 'HIGH_SECURITY', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Data center dan server room' },
];

// ============================================================================
// RFID READERS DATA
// ============================================================================
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

// ============================================================================
// DOCUMENTS DATA
// ============================================================================
const documentsData = [
    // ===== CATEGORY 1: HISTORICAL & PRESIDENTIAL (30 docs) =====
    // Proklamasi & Independence Era
    { rfidTag: 'ANRI-P1945-001', title: 'Naskah Asli Proklamasi Kemerdekaan RI 17 Agustus 1945', classification: 'SECRET', orgUnit: 'Arsip Sejarah Nasional', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P1945-002', title: 'Catatan Rapat BPUPKI - Perumusan Dasar Negara', classification: 'SECRET', orgUnit: 'Arsip Sejarah Nasional', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P1945-003', title: 'Dokumen Pembentukan PPKI 18 Agustus 1945', classification: 'RESTRICTED', orgUnit: 'Arsip Sejarah Nasional', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-P1949-001', title: 'Perjanjian Roem-Royen 7 Mei 1949', classification: 'RESTRICTED', orgUnit: 'Arsip Sejarah Nasional', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-P1955-001', title: 'Dokumen Konferensi Asia-Afrika Bandung 1955', classification: 'PUBLIC', orgUnit: 'Kemlu', zoneCode: 'ZONA-R1' },

    // Presidential SK & Decrees (2024)
    { rfidTag: 'ANRI-SK2024-001', title: 'SK Presiden No. 12/2024 - Pengangkatan Duta Besar LBBP Australia', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-SK2024-002', title: 'SK Presiden No. 34/2024 - Pemberhentian Menteri Kabinet', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-SK2024-003', title: 'SK Presiden No. 45/2024 - Pengangkatan Panglima TNI', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-PERPRES-001', title: 'Perpres No. 15/2024 - Percepatan Pembangunan IKN Nusantara', classification: 'RESTRICTED', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-PERPRES-002', title: 'Perpres No. 28/2024 - Tata Kelola Keuangan Negara 2025', classification: 'RESTRICTED', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-PERPRES-003', title: 'Perpres No. 42/2024 - Pembentukan Badan Otorita IKN', classification: 'RESTRICTED', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEPPRES-001', title: 'Keppres No. 45/2024 - Penetapan Hari Libur Nasional 2025', classification: 'PUBLIC', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-R1' },

    // Cabinet Transcripts
    { rfidTag: 'ANRI-RK2024-101', title: 'Risalah Rapat Kabinet Terbatas - Penanganan Inflasi Q4 2024', classification: 'SECRET', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-RK2024-102', title: 'Risalah Rapat Kabinet Paripurna - Evaluasi APBN 2024', classification: 'SECRET', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-RK2024-103', title: 'Risalah Sidang Kabinet - Strategi Pangan Nasional 2025-2029', classification: 'RESTRICTED', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-B2' },
    { rfidTag: 'ANRI-RK2024-104', title: 'Risalah Rapat Kabinet - Pembahasan RUU Cipta Kerja', classification: 'RESTRICTED', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-B2' },

    // ===== CATEGORY 2: INTELLIGENCE & SECURITY (30 docs - SECRET) =====
    { rfidTag: 'ANRI-BIN2024-001', title: 'Laporan Intelijen Strategis Q4 2024 - Stabilitas Kawasan ASEAN', classification: 'SECRET', orgUnit: 'Badan Intelijen Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BIN2024-002', title: 'Analisis Ancaman Terorisme Transnasional Asia Tenggara', classification: 'SECRET', orgUnit: 'Badan Intelijen Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BIN2024-003', title: 'Intelligence Brief - Cyber Threats Against Critical Infrastructure', classification: 'SECRET', orgUnit: 'Badan Intelijen Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BIN2024-004', title: 'Laporan Monitoring Radikalisme di Kampus-Kampus Indonesia', classification: 'SECRET', orgUnit: 'Badan Intelijen Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BIN2024-005', title: 'Analisis Geopolitik Laut China Selatan 2024', classification: 'SECRET', orgUnit: 'Badan Intelijen Negara', zoneCode: 'ZONA-A1' },

    { rfidTag: 'ANRI-BSSN2024-001', title: 'Laporan Insiden Siber Nasional Semester II 2024', classification: 'SECRET', orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BSSN2024-002', title: 'Strategi Pertahanan Siber Indonesia 2025-2029', classification: 'SECRET', orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BSSN2024-003', title: 'Penilaian Risiko Keamanan Siber Sektor Keuangan', classification: 'RESTRICTED', orgUnit: 'BSSN', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-BSSN2024-004', title: 'Dokumen Respons Insiden Ransomware Sektor Kesehatan', classification: 'SECRET', orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },

    { rfidTag: 'ANRI-KPK2024-001', title: 'Laporan Investigasi OTT Kasus Suap Pengadaan Alkes', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-KPK2024-002', title: 'Hasil Penyelidikan Kasus Gratifikasi BUMN PT XYZ', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-KPK2024-003', title: 'Analisis Pola Korupsi Pengadaan Barang dan Jasa 2024', classification: 'RESTRICTED', orgUnit: 'KPK', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KPK2024-004', title: 'Dokumen Penyitaan Aset Korupsi Proyek Infrastruktur', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },

    { rfidTag: 'ANRI-TNI2024-001', title: 'Rencana Operasi Pengamanan Perbatasan Laut 2025', classification: 'SECRET', orgUnit: 'TNI', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-TNI2024-002', title: 'Laporan Latihan Gabungan Garuda Shield 2024', classification: 'RESTRICTED', orgUnit: 'TNI', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-TNI2024-003', title: 'Dokumen Strategi Pertahanan Udara Nasional', classification: 'SECRET', orgUnit: 'TNI AU', zoneCode: 'ZONA-A1' },

    { rfidTag: 'ANRI-POLRI2024-001', title: 'Strategi Penanggulangan Narkoba Nasional 2025', classification: 'RESTRICTED', orgUnit: 'Polri', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-POLRI2024-002', title: 'Laporan Operasi Pemberantasan Jaringan Narkoba Internasional', classification: 'SECRET', orgUnit: 'Polri', zoneCode: 'ZONA-A1' },

    // ===== CATEGORY 3: MINISTRY DOCS - FINANCE & ECONOMY (20 docs) =====
    { rfidTag: 'ANRI-KEU2024-001', title: 'Nota Keuangan RAPBN 2025', classification: 'RESTRICTED', orgUnit: 'Kemenkeu', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEU2024-002', title: 'Laporan Realisasi APBN Semester II 2024', classification: 'RESTRICTED', orgUnit: 'Kemenkeu', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEU2024-003', title: 'Analisis Kebijakan Fiskal dan Proyeksi Ekonomi 2025', classification: 'RESTRICTED', orgUnit: 'Kemenkeu', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEU2024-004', title: 'Dokumen Strategi Pengelolaan Utang Negara 2025', classification: 'RESTRICTED', orgUnit: 'Kemenkeu', zoneCode: 'ZONA-B1' },

    { rfidTag: 'ANRI-BPK2024-001', title: 'Laporan Hasil Pemeriksaan LKPP Tahun Anggaran 2023', classification: 'RESTRICTED', orgUnit: 'BPK', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-BPK2024-002', title: 'Audit Eksternal Pengelolaan Aset Negara 2024', classification: 'SECRET', orgUnit: 'BPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-BPK2024-003', title: 'Laporan Investigasi Kerugian Negara BUMN Sektor Energi', classification: 'SECRET', orgUnit: 'BPK', zoneCode: 'ZONA-A1' },

    { rfidTag: 'ANRI-BI2024-001', title: 'Laporan Kebijakan Moneter dan Stabilitas Keuangan Q4 2024', classification: 'RESTRICTED', orgUnit: 'Bank Indonesia', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-BI2024-002', title: 'Analisis Proyeksi Inflasi dan Nilai Tukar Rupiah 2025', classification: 'RESTRICTED', orgUnit: 'Bank Indonesia', zoneCode: 'ZONA-B1' },

    { rfidTag: 'ANRI-OJK2024-001', title: 'Laporan Triwulanan Industri Perbankan Indonesia', classification: 'PUBLIC', orgUnit: 'OJK', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-OJK2024-002', title: 'Kajian Stabilitas Sistem Keuangan Indonesia 2024', classification: 'RESTRICTED', orgUnit: 'OJK', zoneCode: 'ZONA-B1' },

    { rfidTag: 'ANRI-BAPPENAS-001', title: 'Rencana Pembangunan Jangka Menengah Nasional 2025-2029', classification: 'RESTRICTED', orgUnit: 'Bappenas', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-BAPPENAS-002', title: 'Dokumen Perencanaan Pembangunan IKN Nusantara', classification: 'RESTRICTED', orgUnit: 'Bappenas', zoneCode: 'ZONA-B1' },

    // ===== CATEGORY 4: INTERNATIONAL RELATIONS & DEFENSE (15 docs) =====
    { rfidTag: 'ANRI-LN2024-001', title: 'Perjanjian Kerjasama RI-Australia di Bidang Pertahanan', classification: 'SECRET', orgUnit: 'Kemenlu', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-LN2024-002', title: 'MoU Kerjasama Ekonomi ASEAN-China Free Trade Agreement', classification: 'RESTRICTED', orgUnit: 'Kemenlu', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-LN2024-003', title: 'Laporan Pertemuan ASEAN Foreign Ministers Meeting Brunei 2024', classification: 'RESTRICTED', orgUnit: 'Kemenlu', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-LN2024-004', title: 'Nota Diplomatik - Perundingan Batas Maritim ZEE Indonesia-Vietnam', classification: 'SECRET', orgUnit: 'Kemenlu', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-LN2024-005', title: 'Dokumen Kerjasama G20 Indonesia Presidency 2022', classification: 'PUBLIC', orgUnit: 'Kemenlu', zoneCode: 'ZONA-R1' },

    { rfidTag: 'ANRI-HAN2024-001', title: 'Rencana Strategis Modernisasi Alutsista TNI 2025-2029', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-HAN2024-002', title: 'Dokumen Pengadaan Jet Tempur Rafale dari Perancis', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-HAN2024-003', title: 'Kerjasama Industri Pertahanan dengan Korea Selatan - KF-21', classification: 'RESTRICTED', orgUnit: 'Kemenhan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-HAN2024-004', title: 'Perjanjian Bilateral Pertahanan Indonesia-Australia', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },

    // ===== CATEGORY 5: CULTURAL HERITAGE & UNESCO (20 docs - PUBLIC) =====
    { rfidTag: 'ANRI-UNESCO-001', title: 'Nominasi Borobudur untuk World Heritage Site (1991)', classification: 'PUBLIC', orgUnit: 'Kemendikbud', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-UNESCO-002', title: 'Dokumentasi Situs Sangiran - World Heritage', classification: 'PUBLIC', orgUnit: 'Kemendikbud', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-UNESCO-003', title: 'Arsip Wayang Kulit UNESCO Memory of the World', classification: 'PUBLIC', orgUnit: 'Kemendikbud', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-UNESCO-004', title: 'Dokumentasi Batik Indonesia - UNESCO Intangible Heritage', classification: 'PUBLIC', orgUnit: 'Kemendikbud', zoneCode: 'ZONA-R1' },

    { rfidTag: 'ANRI-BUDAYA-001', title: 'Katalog Koleksi Naskah Kuno Keraton Yogyakarta', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-BUDAYA-002', title: 'Dokumentasi Kesenian Tradisional Nusantara', classification: 'PUBLIC', orgUnit: 'Kemendikbud', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-BUDAYA-003', title: 'Koleksi Foto Sejarah Kemerdekaan Indonesia 1945-1950', classification: 'PUBLIC', orgUnit: 'Pusat Dokumentasi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-BUDAYA-004', title: 'Arsip Musik Tradisional Gamelan Jawa', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-R1' },

    { rfidTag: 'ANRI-KOLONIAL-001', title: 'Arsip VOC - Perjanjian Dagang Hindia Belanda 1700-an', classification: 'PUBLIC', orgUnit: 'Arsip Kolonial', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-KOLONIAL-002', title: 'Dokumen Cultuurstelsel - Tanam Paksa Era Kolonial', classification: 'PUBLIC', orgUnit: 'Arsip Kolonial', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-KOLONIAL-003', title: 'Peta Hindia Belanda Era Gubernur Jenderal Daendels', classification: 'PUBLIC', orgUnit: 'Arsip Kolonial', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-KOLONIAL-004', title: 'Arsip Perlawanan Diponegoro 1825-1830', classification: 'PUBLIC', orgUnit: 'Arsip Sejarah', zoneCode: 'ZONA-R1' },

    { rfidTag: 'ANRI-PAMERAN-001', title: 'Katalog Pameran Arsip Kemerdekaan', classification: 'PUBLIC', orgUnit: 'Pusat Layanan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PAMERAN-002', title: 'Dokumentasi Pameran Indonesia Kaya 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },

    // ===== CATEGORY 6: ADMINISTRATIVE & INTERNAL ANRI (25 docs) =====
    { rfidTag: 'ANRI-ADM2024-001', title: 'SK Kepala ANRI No. 12/2024 - Pengangkatan Eselon II', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-002', title: 'Laporan Kinerja ANRI Tahun 2024', classification: 'RESTRICTED', orgUnit: 'Sekretariat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-003', title: 'Rencana Kerja dan Anggaran ANRI Tahun 2025', classification: 'RESTRICTED', orgUnit: 'Biro Perencanaan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-004', title: 'Laporan Akuisisi Arsip Statis Kementerian/Lembaga 2024', classification: 'RESTRICTED', orgUnit: 'Pusat Akuisisi', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-005', title: 'SOP Pengelolaan Arsip Elektronik ANRI Versi 2.0', classification: 'RESTRICTED', orgUnit: 'Bagian Organisasi', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-006', title: 'Kontrak Pengadaan Sistem RFID Tracking 2024', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-ADM2024-007', title: 'Laporan Hasil Sertifikasi ISO 27001:2022', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-ADM2024-008', title: 'Dokumen Tender Renovasi Gedung Arsip Pusat', classification: 'RESTRICTED', orgUnit: 'Bagian Umum', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-ADM2024-009', title: 'SK Mutasi Pegawai Batch Januari 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-ADM2024-010', title: 'Laporan Inventarisasi Aset ANRI 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-C1' },

    { rfidTag: 'ANRI-KEP2024-001', title: 'SK Pengangkatan Pejabat Eselon III No. 123/2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEP2024-002', title: 'Arsip Sengketa Kepegawaian 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEP2024-003', title: 'Laporan Pengembangan SDM ANRI 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-KEP2024-004', title: 'SK Penetapan Tunjangan Kinerja 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },

    { rfidTag: 'ANRI-AUDIT-001', title: 'Laporan Audit Internal Q4 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-AUDIT-002', title: 'Laporan Evaluasi Kinerja ANRI 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-AUDIT-003', title: 'Arsip Pengaduan Whistleblower 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },

    { rfidTag: 'ANRI-IT2024-001', title: 'Dokumen Sertifikasi ISO 27001', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-IT2024-002', title: 'Kontrak Pengadaan Server 2024', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },

    // ===== CATEGORY 7: PUBLIC SERVICES & PUBLICATIONS (15 docs) =====
    { rfidTag: 'ANRI-PUB2024-001', title: 'Pengumuman Penerimaan CPNS 2024', classification: 'PUBLIC', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-002', title: 'Surat Edaran No. 01/SE/2024', classification: 'PUBLIC', orgUnit: 'Sekretariat', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-003', title: 'Laporan Tahunan ANRI 2023', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-004', title: 'Buku Pedoman Kearsipan untuk K/L', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-005', title: 'Standar Deskripsi Arsip Indonesia', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-006', title: 'Panduan Digitalisasi Arsip', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-PUB2024-007', title: 'Majalah Arsip Nasional Edisi 54', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-008', title: 'Prosiding Konferensi Kearsipan 2024', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-009', title: 'Brosur Layanan ANRI 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-PUB2024-010', title: 'Peraturan ANRI No. 5 Tahun 2024', classification: 'PUBLIC', orgUnit: 'Hukum', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-011', title: 'Laporan Survei Kepuasan Masyarakat 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-012', title: 'Direktori Lembaga Kearsipan Daerah', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-013', title: 'Modul Pelatihan Arsiparis Dasar', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-014', title: 'Jurnal Kearsipan Vol. 19 No. 1', classification: 'PUBLIC', orgUnit: 'Pusat Kajian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-PUB2024-015', title: 'Infografis Statistik Kearsipan Nasional', classification: 'PUBLIC', orgUnit: 'Pusat Data', zoneCode: 'ZONA-R1' },
];

// ============================================================================
// POLICY RULES DATA
// ============================================================================
const policyRulesData = [
    { name: 'Block Gambling Sites', description: 'Memblokir akses ke situs judi online', category: 'DNS_BLOCK', pattern: '*.bet365.com,*.pokerstars.com,*.888casino.com,*.bovada.lv,*.judi*.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Adult Content', description: 'Memblokir akses ke konten dewasa', category: 'DNS_BLOCK', pattern: '*.pornhub.com,*.xvideos.com,*.xhamster.com,*.redtube.com,*.adult*.com', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Restrict Social Media', description: 'Membatasi akses media sosial dengan peringatan', category: 'URL_FILTER', pattern: '*facebook.com,*instagram.com,*twitter.com,*tiktok.com', action: 'WARN', severity: 'MEDIUM', priority: 50 },
    { name: 'Block Video Streaming', description: 'Memblokir situs streaming video', category: 'CONTENT_RESTRICTION', pattern: '*netflix.com,*youtube.com,*disney*.com,*hbo*.com,*prime*video*', action: 'WARN', severity: 'LOW', priority: 60 },
    { name: 'Block Gaming Sites', description: 'Memblokir situs gaming online', category: 'TIME_RESTRICTION', pattern: '*steam*.com,*epicgames.com,*roblox.com,*minecraft.net,*games*.com', action: 'BLOCK', severity: 'HIGH', priority: 30 },
    { name: 'Block Torrent Sites', description: 'Memblokir situs torrent dan P2P', category: 'APPLICATION_CONTROL', pattern: '*thepiratebay*,*1337x.*,*rarbg.*,*torrent*,*utorrent*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Limit Large Downloads', description: 'Log download file besar (>100MB)', category: 'BANDWIDTH_LIMIT', pattern: '*.iso,*.zip,*.rar,*.exe,*.dmg,*.pkg', action: 'LOG_ONLY', severity: 'LOW', priority: 80 },
    { name: 'Block Crypto Mining', description: 'Memblokir situs crypto mining', category: 'APPLICATION_CONTROL', pattern: '*coinhive*,*cryptoloot*,*coin-hive*,*miner*,*cryptocurrency*mining*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
    { name: 'Block Proxy/VPN Services', description: 'Memblokir layanan proxy dan VPN yang tidak diizinkan', category: 'APPLICATION_CONTROL', pattern: '*hidemyass*,*hotspotshield*,*tunnelbear*,*nordvpn*,*expressvpn*,*proxy*', action: 'BLOCK', severity: 'HIGH', priority: 20 },
    { name: 'Block File Sharing', description: 'Memblokir situs file sharing publik', category: 'URL_FILTER', pattern: '*dropbox.com,*mediafire.com,*mega.nz,*4shared.com,*zippyshare*', action: 'WARN', severity: 'MEDIUM', priority: 40 },
    { name: 'Block Malware Domains', description: 'Memblokir domain yang diketahui berbahaya', category: 'DNS_BLOCK', pattern: '*.malware*,*.phishing*,*.scam*,*.suspicious*', action: 'BLOCK', severity: 'CRITICAL', priority: 5 },
    { name: 'Restrict Job Sites', description: 'Membatasi akses ke situs pencarian kerja', category: 'URL_FILTER', pattern: '*jobstreet*,*indeed*,*linkedin*/jobs,*karir*,*lowongan*', action: 'LOG_ONLY', severity: 'LOW', priority: 70 },
    { name: 'Block Webmail External', description: 'Memblokir webmail selain email resmi', category: 'URL_FILTER', pattern: '*mail.google.com,*outlook.live*,*mail.yahoo*,*protonmail*', action: 'WARN', severity: 'MEDIUM', priority: 45 },
    { name: 'Block Shopping Sites', description: 'Membatasi akses ke e-commerce', category: 'CONTENT_RESTRICTION', pattern: '*tokopedia*,*shopee*,*bukalapak*,*lazada*,*blibli*,*amazon*', action: 'LOG_ONLY', severity: 'LOW', priority: 75 },
    { name: 'Block Sports Betting', description: 'Memblokir situs taruhan olahraga', category: 'DNS_BLOCK', pattern: '*sbobet*,*maxbet*,*ibcbet*,*bet365*,*taruhan*,*sportbook*', action: 'BLOCK', severity: 'CRITICAL', priority: 10 },
];

// ============================================================================
// REGULATIONS DATA (for Compliance Dashboard)
// ============================================================================
const regulationsData = [
    { code: 'UU-43/2009', name: 'Undang-Undang Kearsipan', category: 'LAW', issuingBody: 'DPR RI', effectiveDate: new Date('2009-10-23'), status: 'COMPLIANT', ownerDepartment: 'Sekretariat', lastReviewDate: new Date('2024-11-15'), nextReviewDate: new Date('2025-05-15'), notes: 'Compliance penuh terhadap UU Kearsipan' },
    { code: 'PP-28/2012', name: 'Pelaksanaan UU Kearsipan', category: 'GOVERNMENT', issuingBody: 'Presiden RI', effectiveDate: new Date('2012-04-17'), status: 'COMPLIANT', ownerDepartment: 'Sekretariat', lastReviewDate: new Date('2024-10-20'), nextReviewDate: new Date('2025-04-20') },
    { code: 'PERPRES-82/2023', name: 'Sistem Pemerintahan Berbasis Elektronik', category: 'PRESIDENTIAL', issuingBody: 'Presiden RI', effectiveDate: new Date('2023-08-01'), status: 'COMPLIANT', ownerDepartment: 'Unit IT', lastReviewDate: new Date('2024-12-01'), nextReviewDate: new Date('2025-06-01') },
    { code: 'UU-27/2022', name: 'Pelindungan Data Pribadi', category: 'LAW', issuingBody: 'DPR RI', effectiveDate: new Date('2022-10-17'), status: 'PARTIAL', ownerDepartment: 'Kepatuhan & Audit', lastReviewDate: new Date('2024-11-10'), nextReviewDate: new Date('2025-02-10'), notes: 'Implementasi DPIA sedang dalam proses finalisasi' },
    { code: 'ISO-27001:2022', name: 'Information Security Management System', category: 'INTERNATIONAL', issuingBody: 'ISO/IEC', effectiveDate: new Date('2022-10-25'), status: 'COMPLIANT', ownerDepartment: 'Unit IT', lastReviewDate: new Date('2024-09-20'), nextReviewDate: new Date('2025-09-20'), evidenceUrl: '/compliance/iso27001-certificate.pdf' },
    { code: 'ISO-15489', name: 'Records Management International Standard', category: 'INTERNATIONAL', issuingBody: 'ISO', effectiveDate: new Date('2016-04-15'), status: 'COMPLIANT', ownerDepartment: 'Preservasi Arsip', lastReviewDate: new Date('2024-08-15'), nextReviewDate: new Date('2025-08-15') },
    { code: 'PERPRES-95/2018', name: 'Sistem Pemerintahan Berbasis Elektronik', category: 'PRESIDENTIAL', issuingBody: 'Presiden RI', effectiveDate: new Date('2018-09-28'), status: 'COMPLIANT', ownerDepartment: 'Unit IT', lastReviewDate: new Date('2024-07-10'), nextReviewDate: new Date('2025-01-10') },
    { code: 'SE-MENPANRB-06/2023', name: 'Kebijakan Penggunaan Internet ASN', category: 'INTERNAL', issuingBody: 'Kementerian PANRB', effectiveDate: new Date('2023-06-15'), status: 'COMPLIANT', ownerDepartment: 'Unit IT', lastReviewDate: new Date('2024-12-05'), nextReviewDate: new Date('2025-06-05') },
];

// ============================================================================
// AUDIT SCHEDULE DATA (for Compliance Dashboard)
// ============================================================================
const auditScheduleData = [
    // Past Audits
    { name: 'Audit Internal Semester II 2023', type: 'INTERNAL', scheduledDate: new Date('2023-11-15'), completedDate: new Date('2023-11-20'), status: 'COMPLETED', auditorName: 'Citra Dewi, S.H., M.H.', auditorOrg: 'Internal Audit ANRI', findings: 3, criticalFindings: 0, reportUrl: '/audits/2023-H2-internal.pdf' },
    { name: 'Audit Eksternal BPK 2024', type: 'EXTERNAL', scheduledDate: new Date('2024-03-10'), completedDate: new Date('2024-03-25'), status: 'COMPLETED', auditorName: 'Tim Auditor BPK', auditorOrg: 'Badan Pemeriksa Keuangan RI', findings: 7, criticalFindings: 1, reportUrl: '/audits/2024-BPK-external.pdf' },
    { name: 'Surveillance Audit ISO 27001', type: 'SURVEILLANCE', scheduledDate: new Date('2024-09-20'), completedDate: new Date('2024-09-22'), status: 'COMPLETED', auditorName: 'John Smith, Lead Auditor', auditorOrg: 'British Standards Institution', findings: 2, criticalFindings: 0, reportUrl: '/audits/2024-ISO27001-surveillance.pdf' },
    { name: 'Audit Kepatuhan Kearsipan Q3 2024', type: 'INTERNAL', scheduledDate: new Date('2024-08-05'), completedDate: new Date('2024-08-10'), status: 'COMPLETED', auditorName: 'Putri Handayani, S.E., Ak.', auditorOrg: 'Internal Audit ANRI', findings: 4, criticalFindings: 0 },
    { name: 'Audit Sistem Informasi 2024', type: 'SPECIAL', scheduledDate: new Date('2024-06-12'), completedDate: new Date('2024-06-18'), status: 'COMPLETED', auditorName: 'Ahmad Fauzi, S.Kom.', auditorOrg: 'Unit IT', findings: 5, criticalFindings: 1 },

    // Upcoming Audits
    { name: 'Audit Internal Q1 2025', type: 'INTERNAL', scheduledDate: new Date('2025-03-15'), status: 'SCHEDULED', auditorName: 'Citra Dewi, S.H., M.H.', auditorOrg: 'Internal Audit ANRI', findings: 0, criticalFindings: 0 },
    { name: 'Sertifikasi Ulang ISO 27001', type: 'CERTIFICATION', scheduledDate: new Date('2025-06-10'), status: 'SCHEDULED', auditorOrg: 'British Standards Institution', findings: 0, criticalFindings: 0 },
    { name: 'Audit Kepatuhan Data Pribadi', type: 'SPECIAL', scheduledDate: new Date('2025-04-20'), status: 'SCHEDULED', auditorName: 'Tim Kominfo', auditorOrg: 'Kementerian Komunikasi dan Informatika', findings: 0, criticalFindings: 0 },
    { name: 'Audit Eksternal BPK 2025', type: 'EXTERNAL', scheduledDate: new Date('2025-03-05'), status: 'SCHEDULED', auditorOrg: 'Badan Pemeriksa Keuangan RI', findings: 0, criticalFindings: 0 },
    { name: 'Audit Preservasi Arsip Digital', type: 'INTERNAL', scheduledDate: new Date('2025-05-18'), status: 'SCHEDULED', auditorName: 'Hendra Wijaya, S.Ars.', auditorOrg: 'Preservasi Arsip', findings: 0, criticalFindings: 0 },
    { name: 'Surveillance Audit ISO 15489', type: 'SURVEILLANCE', scheduledDate: new Date('2025-07-22'), status: 'SCHEDULED', auditorOrg: 'SGS Indonesia', findings: 0, criticalFindings: 0 },
    { name: 'Audit Keamanan Siber', type: 'SPECIAL', scheduledDate: new Date('2025-08-10'), status: 'SCHEDULED', auditorName: 'Maya Kusuma, S.Kom., CISSP', auditorOrg: 'NSOC', findings: 0, criticalFindings: 0 },
];


// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
    console.log('🚀 Starting comprehensive database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.complianceMetric.deleteMany();
    await prisma.auditSchedule.deleteMany();
    await prisma.regulation.deleteMany();
    await prisma.approvalStep.deleteMany();
    await prisma.approvalRequest.deleteMany();
    await prisma.policyAcknowledgment.deleteMany();
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
    await prisma.user.deleteMany();

    // ========================================================================
    // 1. CREATE USERS
    // ========================================================================
    console.log('\n👥 Creating users...');
    const users: { [key: string]: any } = {};
    for (const userData of usersData) {
        const passwordHash = await bcrypt.hash('Demo2024!', 12);
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                name: userData.name,
                passwordHash,
                role: userData.role as any,
                department: userData.department,
                isActive: true,
            },
        });
        users[userData.email] = user;
        console.log(`  ✓ Created user: ${user.name}`);
    }

    // ========================================================================
    // 2. CREATE ZONES
    // ========================================================================
    console.log('\n🏢 Creating zones...');
    const zones: { [key: string]: any } = {};
    for (const zoneData of zonesData) {
        const zone = await prisma.zone.create({
            data: {
                name: zoneData.name,
                code: zoneData.code,
                description: zoneData.description,
                securityLevel: zoneData.securityLevel as any,
                floor: zoneData.floor,
                building: zoneData.building,
                isActive: true,
            },
        });
        zones[zoneData.code] = zone;
        console.log(`  ✓ Created zone: ${zone.name}`);
    }

    // ========================================================================
    // 3. CREATE RFID READERS
    // ========================================================================
    console.log('\n📡 Creating RFID readers...');
    const readers: { [key: string]: any } = {};
    for (const readerData of rfidReadersData) {
        const reader = await prisma.rFIDReader.create({
            data: {
                readerId: readerData.readerId,
                name: readerData.name,
                type: readerData.type as any,
                zoneId: zones[readerData.zoneCode].id,
                isOnline: readerData.isOnline,
                lastPing: readerData.isOnline ? new Date() : randomDate(1),
            },
        });
        readers[readerData.readerId] = reader;
        console.log(`  ✓ Created reader: ${reader.name} (${readerData.isOnline ? 'ONLINE' : 'OFFLINE'})`);
    }

    // ========================================================================
    // 4. CREATE DOCUMENTS WITH BASELINES
    // ========================================================================
    console.log('\n📄 Creating documents with behavioral baselines...');
    const documents: { [key: string]: any } = {};
    for (const docData of documentsData) {
        const document = await prisma.document.create({
            data: {
                rfidTag: docData.rfidTag,
                title: docData.title,
                description: `Dokumen resmi ANRI: ${docData.title}`,
                classification: docData.classification as any,
                organizationUnit: docData.orgUnit,
                currentZoneId: zones[docData.zoneCode].id,
                isActive: true,
            },
        });

        // Create baseline for each document
        const allowedZones = docData.classification === 'SECRET'
            ? JSON.stringify([zones['ZONA-A1'].id])
            : docData.classification === 'RESTRICTED'
                ? JSON.stringify([zones['ZONA-A1'].id, zones['ZONA-A2'].id, zones['ZONA-B1'].id, zones['ZONA-B2'].id])
                : JSON.stringify(Object.values(zones).map((z: any) => z.id));

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

    // ========================================================================
    // 5. CREATE DOCUMENT MOVEMENTS (100+)
    // ========================================================================
    console.log('\n🚶 Creating document movements...');
    const movements: any[] = [];
    const zoneList = Object.values(zones);
    const readerList = Object.values(readers);
    const docList = Object.values(documents);

    for (let i = 0; i < 120; i++) {
        const doc = docList[Math.floor(Math.random() * docList.length)];
        const fromZone = zoneList[Math.floor(Math.random() * zoneList.length)] as any;
        const toZone = zoneList[Math.floor(Math.random() * zoneList.length)] as any;
        const reader = readerList.find((r: any) => r.zoneId === toZone.id) || readerList[0];
        const isAnomaly = Math.random() < 0.2; // 20% anomaly rate

        const movement = await prisma.documentMovement.create({
            data: {
                documentId: doc.id,
                fromZoneId: fromZone.id,
                toZoneId: toZone.id,
                readerId: (reader as any).id,
                isAuthorized: !isAnomaly,
                riskScore: isAnomaly ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
                timestamp: randomDate(30),
            },
        });
        movements.push({ ...movement, isAnomaly, doc, fromZone, toZone });
    }
    console.log(`  ✓ Created ${movements.length} document movements`);

    // ========================================================================
    // 6. CREATE ANOMALY ALERTS (20+)
    // ========================================================================
    console.log('\n⚠️  Creating anomaly alerts...');
    const anomalyTypes = ['UNAUTHORIZED_ZONE', 'AFTER_HOURS_ACCESS', 'UNUSUAL_FREQUENCY', 'PATTERN_DEVIATION', 'RAPID_MOVEMENT'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const anomalyMovements = movements.filter(m => m.isAnomaly);

    for (const mov of anomalyMovements.slice(0, 25)) {
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const explanations: { [key: string]: string } = {
            UNAUTHORIZED_ZONE: `Dokumen dengan klasifikasi ${mov.doc.classification} terdeteksi di zona ${mov.toZone.name} yang tidak diizinkan. Zona ini memiliki tingkat keamanan ${mov.toZone.securityLevel} yang tidak sesuai dengan klasifikasi dokumen.`,
            AFTER_HOURS_ACCESS: `Pergerakan dokumen terdeteksi pada pukul ${18 + Math.floor(Math.random() * 6)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} WIB, di luar jam operasional normal (08:00-17:00 WIB).`,
            UNUSUAL_FREQUENCY: `Dokumen ini mengalami ${8 + Math.floor(Math.random() * 12)} pergerakan dalam 24 jam terakhir, melebihi baseline normal sebesar ${Math.floor(Math.random() * 5) + 1} pergerakan per hari.`,
            PATTERN_DEVIATION: `Pola pergerakan dokumen menyimpang ${65 + Math.floor(Math.random() * 30)}% dari profil behavioral yang sudah dipelajari. Rute ${mov.fromZone.name} → ${mov.toZone.name} belum pernah tercatat sebelumnya.`,
            RAPID_MOVEMENT: `Dokumen berpindah melalui ${3 + Math.floor(Math.random() * 5)} zona dalam ${5 + Math.floor(Math.random() * 10)} menit terakhir, mengindikasikan potensi pemindahan tidak terotorisasi.`,
        };

        const factors = [
            { factor: 'Zone Security Mismatch', weight: 0.3 + Math.random() * 0.2 },
            { factor: 'Time Anomaly', weight: 0.2 + Math.random() * 0.15 },
            { factor: 'Frequency Deviation', weight: 0.25 + Math.random() * 0.15 },
            { factor: 'Pattern Deviation', weight: 0.15 + Math.random() * 0.1 },
        ];

        await prisma.anomalyAlert.create({
            data: {
                documentId: mov.doc.id,
                movementId: mov.id,
                alertType: anomalyType as any,
                severity: severity as any,
                riskScore: 0.5 + Math.random() * 0.5,
                explanation: explanations[anomalyType],
                contributingFactors: JSON.stringify(factors),
                confidence: 0.75 + Math.random() * 0.24,
                status: ['OPEN', 'INVESTIGATING', 'RESOLVED'][Math.floor(Math.random() * 3)] as any,
                createdAt: mov.timestamp,
            },
        });
    }
    console.log(`  ✓ Created ${Math.min(anomalyMovements.length, 25)} anomaly alerts`);

    // ========================================================================
    // 7. CREATE POLICY RULES
    // ========================================================================
    console.log('\n📋 Creating policy rules...');
    const policies: { [key: string]: any } = {};
    for (const policyData of policyRulesData) {
        const policy = await prisma.policyRule.create({
            data: {
                name: policyData.name,
                description: policyData.description,
                category: policyData.category as any,
                pattern: policyData.pattern,
                action: policyData.action as any,
                severity: policyData.severity as any,
                priority: policyData.priority,
                isActive: true,
            },
        });
        policies[policyData.name] = policy;
        console.log(`  ✓ Created policy: ${policy.name}`);
    }

    // ========================================================================
    // 8. CREATE POLICY VIOLATIONS (200+)
    // ========================================================================
    console.log('\n🚫 Creating policy violations...');
    const violationTargets = [
        'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
        'bet365.com', 'pokerstars.com', 'youtube.com', 'netflix.com',
        'steam.com', 'epicgames.com', 'thepiratebay.org', 'tokopedia.com',
        'shopee.co.id', 'mega.nz', 'dropbox.com', 'mail.google.com',
    ];
    const userList = Object.values(users);
    const policyList = Object.values(policies);

    for (let i = 0; i < 220; i++) {
        const policy = policyList[Math.floor(Math.random() * policyList.length)] as any;
        const user = userList[Math.floor(Math.random() * userList.length)] as any;
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
                metadata: JSON.stringify({ browser: 'Chrome', os: 'Windows 11', department: user.department }),
                timestamp: randomDate(30),
            },
        });
    }
    console.log(`  ✓ Created 220 policy violations`);

    // ========================================================================
    // 9. CREATE DEVICE STATUS (45 diverse devices)
    // ========================================================================
    console.log('\n💻 Creating enterprise device statuses...');
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

    for (const device of devicesData) {
        await prisma.deviceStatus.create({
            data: {
                deviceId: device.deviceId,
                hostname: device.hostname,
                ipAddress: device.ip,
                macAddress: `${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}:${Math.random().toString(16).substr(2, 2).toUpperCase()}`,
                deviceType: device.type as any,
                manufacturer: device.manufacturer,
                model: device.model,
                osName: device.os,
                osVersion: device.osVer,
                agentVersion: 'ANRI-Agent v2.4.1',
                userId: null,
                userName: device.userName,
                userDepartment: device.dept,
                status: device.status as any,
                isolatedAt: (device as any).isolatedAt || null,
                isolationReason: (device as any).reason || null,
                lastSeen: device.status === 'OFFLINE' ? randomDate(3) : new Date(),
            },
        });
    }
    console.log(`  ✓ Created ${devicesData.length} enterprise device statuses`);

    // ========================================================================
    // 10. CREATE KPI METRICS (84 - 12 months x 7 KPIs)
    // ========================================================================
    console.log('\n📊 Creating KPI metrics...');
    const kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'];
    const baseValues: { [key: string]: number } = {
        MTTD: 5, MTTR: 60, COMPLIANCE_RATE: 88, ANOMALY_ACCURACY: 85,
        POLICY_VIOLATIONS: 150, DOCUMENT_RISK: 35, SYSTEM_HEALTH: 92,
    };

    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;
        for (const category of kpiCategories) {
            const improvement = month * 0.5; // Gradual improvement
            let value = baseValues[category];

            if (['MTTD', 'MTTR', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK'].includes(category)) {
                value = Math.max(value - improvement * (category === 'MTTD' ? 0.3 : 1), category === 'MTTD' ? 2 : 20);
            } else {
                value = Math.min(value + improvement * 0.6, 99);
            }

            await prisma.kPIMetric.create({
                data: {
                    name: `${category} - ${period}`,
                    category: category as any,
                    value: value + (Math.random() - 0.5) * 5,
                    target: category.includes('RATE') || category.includes('ACCURACY') || category === 'SYSTEM_HEALTH' ? 95 : null,
                    trend: month > 0 ? (['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] as any) : null,
                    period,
                    calculatedAt: new Date(2024, month, 28),
                },
            });
        }
    }
    console.log(`  ✓ Created 84 KPI metrics (12 months)`);

    // ========================================================================
    // 11. CREATE RISK POSTURE (30 days)
    // ========================================================================
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
    console.log(`  ✓ Created 30 risk posture snapshots`);

    // ========================================================================
    // 12. CREATE REGULATIONS (for Compliance Dashboard)
    // ========================================================================
    console.log('\n📜 Creating regulations...');
    for (const regData of regulationsData) {
        await prisma.regulation.create({
            data: {
                code: regData.code,
                name: regData.name,
                category: regData.category as any,
                issuingBody: regData.issuingBody,
                effectiveDate: regData.effectiveDate,
                status: regData.status as any,
                ownerDepartment: regData.ownerDepartment,
                lastReviewDate: regData.lastReviewDate,
                nextReviewDate: regData.nextReviewDate,
                evidenceUrl: regData.evidenceUrl || null,
                notes: regData.notes || null,
                isActive: true,
            },
        });
    }
    console.log(`  ✓ Created ${regulationsData.length} regulations`);

    // ========================================================================
    // 13. CREATE AUDIT SCHEDULES (for Compliance Dashboard)
    // ========================================================================
    console.log('\n📅 Creating audit schedules...');
    for (const auditData of auditScheduleData) {
        await prisma.auditSchedule.create({
            data: {
                name: auditData.name,
                type: auditData.type as any,
                scheduledDate: auditData.scheduledDate,
                completedDate: auditData.completedDate || null,
                status: auditData.status as any,
                auditorName: auditData.auditorName || null,
                auditorOrg: auditData.auditorOrg,
                findings: auditData.findings,
                criticalFindings: auditData.criticalFindings,
                reportUrl: auditData.reportUrl || null,
            },
        });
    }
    console.log(`  ✓ Created ${auditScheduleData.length} audit schedules`);

    // ========================================================================
    // 14. CREATE COMPLIANCE METRICS (36 records - 12 months trends)
    // ========================================================================
    console.log('\n📈 Creating compliance metrics...');
    const complianceCategories = ['POLICY_ACK', 'AUDIT_READY', 'REGULATION'];
    const baseComplianceValues: { [key: string]: number } = {
        POLICY_ACK: 82,      // Policy Acknowledgment Rate (%)
        AUDIT_READY: 75,     // Audit Readiness Score (%)
        REGULATION: 88,      // Regulation Compliance Rate (%)
    };

    for (let month = 0; month < 12; month++) {
        const period = `2024-${String(month + 1).padStart(2, '0')}`;

        for (const category of complianceCategories) {
            const improvement = month * 1.2; // Progressive improvement
            const baseValue = baseComplianceValues[category];
            const value = Math.min(baseValue + improvement, 98) + (Math.random() - 0.5) * 2;

            await prisma.complianceMetric.create({
                data: {
                    name: `${category} - ${period}`,
                    category,
                    value,
                    target: 95,
                    unit: '%',
                    trend: month > 0 ? (['UP', 'STABLE'][Math.floor(Math.random() * 2)] as any) : null,
                    period,
                    calculatedAt: new Date(2024, month, 28),
                },
            });
        }
    }
    console.log(`  ✓ Created 36 compliance metrics (12 months × 3 categories)`);

    // ========================================================================
    // 15. CREATE APPROVAL REQUESTS (30+ with multi-level workflow)
    // ========================================================================
    console.log('\n📋 Creating approval requests...');

    const approvalRequestsData = [
        // ===== APPROVED REQUESTS (20) =====
        { reqNum: 'REQ-2024-0101', type: 'DOCUMENT_MOVEMENT', subject: 'Perpindahan Dokumen SECRET ke Ruang Rapat VIP', description: 'Dokumen SK Presiden 45/2024 diperlukan untuk rapat dengan Menteri', priority: 'URGENT', status: 'APPROVED', requester: 'hendra.wijaya@anri.go.id', currentLevel: 2, requiredLevel: 2, metadata: JSON.stringify({ documentId: 'doc-001', fromZone: 'ZONA-A1', toZone: 'ZONA-B2' }) },
        { reqNum: 'REQ-2024-0102', type: 'DATA_EXPORT', subject: 'Export Compliance Report untuk BPK', description: 'Export data compliance untuk audit eksternal BPK', priority: 'HIGH', status: 'APPROVED', requester: 'citra.dewi@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0103', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Arsip Historis ke Digitalisasi', description: 'Perlu digitalisasi dokumen arsip kemerdekaan', priority: 'NORMAL', status: 'APPROVED', requester: 'hendra.wijaya@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0104', type: 'ZONE_ACCESS', subject: 'Akses Sementara ke ZONA-A1 untuk Auditor BPK', description: 'Tim BPK memerlukan akses untuk audit', priority: 'HIGH', status: 'APPROVED', requester: 'citra.dewi@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0105', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen Perjanjian Internasional', description: 'Untuk keperluan rapat kerjasama ASEAN', priority: 'NORMAL', status: 'APPROVED', requester: 'dimas.pratama@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0106', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Arsip BIN ke Ruang Vault', description: 'Perlu penyimpanan jangka panjang dokumen classified', priority: 'HIGH', status: 'APPROVED', requester: 'hendra.wijaya@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0107', type: 'DATA_EXPORT', subject: 'Export Historical Data untuk Penelitian', description: 'Universitas Indonesia request data arsip kolonial', priority: 'NORMAL', status: 'APPROVED', requester: 'sri.rahayu@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0108', type: 'ZONE_ACCESS', subject: 'Akses ZONA-A2 untuk Tim Preservasi', description: 'Perlu melakukan preservasi dokumen naskah kuno', priority: 'NORMAL', status: 'APPROVED', requester: 'hendra.wijaya@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0109', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen UNESCO ke Ruang Pameran', description: 'Untuk pameran arsip nasional bulan depan', priority: 'NORMAL', status: 'APPROVED', requester: 'sri.rahayu@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0112', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer 25 Dokumen Keuangan ke Arsip Statis', description: 'Masa ret ensi sudah habis, perlu dipindah ke cold storage', priority: 'LOW', status: 'APPROVED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0113', type: 'ZONE_ACCESS', subject: 'Temporary Access ZONA-S1 untuk Teknisi', description: 'Instalasi upgrade sistem RFID', priority: 'HIGH', status: 'APPROVED', requester: 'agus.setiawan@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0114', type: 'DATA_EXPORT', subject: 'Export Audit Trail untuk Eksternal Auditor', description: 'Required by BSI untuk ISO 27001 certification', priority: 'HIGH', status: 'APPROVED', requester: 'citra.dewi@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0115', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen KPK ke ZONA-A1', description: 'Security upgrade classification dari RESTRICTED ke SECRET', priority: 'URGENT', status: 'APPROVED', requester: 'hendra.wijaya@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0116', type: 'ZONE_ACCESS', subject: 'Akses Ruang Baca untuk Peneliti Asing', description: 'Peneliti dari Belanda untuk arsip VOC', priority: 'NORMAL', status: 'APPROVED', requester: 'sri.rahayu@anri.go.id', currentLevel: 2, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0117', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Dokumen dari ZONA-C1 ke ZONA-B1', description: 'Dokumen IT infrastructure perlu security upgrade', priority: 'NORMAL', status: 'APPROVED', requester: 'agus.setiawan@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0118', type: 'DATA_EXPORT', subject: 'Export Violation Records Q4 2024', description: 'Untuk laporan kinerja keamanan tahunan', priority: 'NORMAL', status: 'APPROVED', requester: 'maya.kusuma@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0119', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Ar sip Pameran ke ZONA-R1', description: 'Post-exhibition return to public reading room', priority: 'LOW', status: 'APPROVED', requester: 'sri.rahayu@anri.go.id', currentLevel: 1, requiredLevel: 1 },

        // ===== PENDING REQUESTS (10) =====
        { reqNum: 'REQ-2024-0120', type: 'ZONE_ACCESS', subject: 'Request Temporary Access ZONA-S1 untuk Maintenance', description: 'Maintenance server room perlu akses full 2 jam', priority: 'URGENT', status: 'PENDING', requester: 'agus.setiawan@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0121', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer 15 Dokumen ke Preservasi', description: 'Dokumen arsip lama perlu preservasi khusus', priority: 'NORMAL', status: 'PENDING', requester: 'hendra.wijaya@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0122', type: 'DATA_EXPORT', subject: 'Export Data Violation untuk Analisis', description: 'Keperluan analisis trend violation Q4 2024', priority: 'NORMAL', status: 'PENDING', requester: 'maya.kusuma@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0123', type: 'USER_CREATION', subject: 'Create User Account untuk Auditor ISO', description: 'Perlu akses untuk surveillance audit ISO 27001', priority: 'HIGH', status: 'PENDING', requester: 'rina.wulandari@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0124', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen BPK dari ZONA-B1 ke ZONA-A1', description: 'Reklasifikasi dokumen audit menjadi SECRET', priority: 'HIGH', status: 'PENDING', requester: 'hendra.wijaya@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0125', type: 'ZONE_ACCESS', subject: 'Request Akses ZONA-A2 untuk Fotografer', description: 'Dokumentasi arsip untuk majalah internal', priority: 'NORMAL', status: 'PENDING', requester: 'sri.rahayu@anri.go.id', currentLevel: 0, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0126', type: 'DATA_EXPORT', subject: 'Export Document Metadata untuk Integrasi Sistem', description: 'Need CSV export untuk sync dengan sistem DMS baru', priority: 'NORMAL', status: 'PENDING', requester: 'agus.setiawan@anri.go.id', currentLevel: 0, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0127', type: 'DOCUMENT_MOVEMENT', subject: 'Transfer Bulk 50 Dokumen ke Digitalisasi', description: 'Batch digitalisasi arsip tahun 1950-an', priority: 'LOW', status: 'PENDING', requester: 'dimas.pratama@anri.go.id', currentLevel: 0, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0128', type: 'POLICY_EXCEPTION', subject: 'Temporary Firewall Exception untuk Update', description: 'Perlu akses Windows Update server external', priority: 'URGENT', status: 'PENDING', requester: 'agus.setiawan@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0129', type: 'ZONE_ACCESS', subject: 'Extended Access ZONA-R1 untuk Mahasiswa', description: 'Penelitian skripsi tentang arsip kemerdekaan', priority: 'LOW', status: 'PENDING', requester: 'sri.rahayu@anri.go.id', currentLevel: 0, requiredLevel: 1 },

        // ===== REJECTED REQUESTS (8) =====
        { reqNum: 'REQ-2024-0110', type: 'POLICY_EXCEPTION', subject: 'Request Akses YouTube untuk Training', description: 'Tim IT butuh akses YouTube untuk tutorial teknis', priority: 'NORMAL', status: 'REJECTED', requester: 'maya.kusuma@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0111', type: 'DOCUMENT_MOVEMENT', subject: 'Pinjam Dokumen SECRET untuk Penelitian Personal', description: 'Untuk keperluan penelitian akademis', priority: 'LOW', status: 'REJECTED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0130', type: 'ZONE_ACCESS', subject: 'Request Access ZONA-A1 tanpa Approval Atasan', description: 'Butuh lihat dokumen untuk tugas', priority: 'NORMAL', status: 'REJECTED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0131', type: 'DATA_EXPORT', subject: 'Export Semua Data User untuk Keperluan Personal', description: 'Backup personal data', priority: 'LOW', status: 'REJECTED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0132', type: 'POLICY_EXCEPTION', subject: 'Whitelist Instagram untuk Official Account', description: 'ANRI official Instagram perlu akses', priority: 'NORMAL', status: 'REJECTED', requester: 'sri.rahayu@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0133', type: 'DOCUMENT_MOVEMENT', subject: 'Pindah Dokumen ke Rumah untuk WFH', description: 'Work from home butuh bawa dokumen', priority: 'NORMAL', status: 'REJECTED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 1 },
        { reqNum: 'REQ-2024-0134', type: 'ZONE_ACCESS', subject: 'Permanent Access All Zones untuk Convenience', description: 'Biar tidak perlu request terus-menerus', priority: 'LOW', status: 'REJECTED', requester: 'dimas.pratama@anri.go.id', currentLevel: 1, requiredLevel: 2 },
        { reqNum: 'REQ-2024-0135', type: 'POLICY_EXCEPTION', subject: 'Bypass Internet Filtering untuk Power User', description: 'IT staff need unrestricted access', priority: 'HIGH', status: 'REJECTED', requester: 'agus.setiawan@anri.go.id', currentLevel: 1, requiredLevel: 2 },
    ];

    for (const reqData of approvalRequestsData) {
        const requesterUser = users[reqData.requester];
        const createdDate = randomDate(reqData.status === 'APPROVED' ? 15 : 5);

        const approval = await prisma.approvalRequest.create({
            data: {
                requestNumber: reqData.reqNum,
                type: reqData.type as any,
                subject: reqData.subject,
                description: reqData.description,
                priority: reqData.priority as any,
                status: reqData.status as any,
                currentLevel: reqData.currentLevel,
                requiredLevel: reqData.requiredLevel,
                requesterId: requesterUser.id,
                metadata: reqData.metadata || null,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                createdAt: createdDate,
            },
        });

        // Create approval steps based on required levels
        for (let level = 1; level <= reqData.requiredLevel; level++) {
            let stepStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
            let approverId: string | null = null;
            let decidedAt: Date | null = null;
            let notes: string | null = null;

            if (reqData.status === 'APPROVED' && level <= reqData.currentLevel) {
                stepStatus = 'APPROVED';
                // Assign different approvers based on level
                approverId = level === 1 ? users['ahmad.fauzi@anri.go.id'].id : users['budi.santoso@anri.go.id'].id;
                decidedAt = new Date(createdDate.getTime() + level * 60 * 60 * 1000); // 1 hour apart
                notes = `Approved - ${level === 1 ? 'Security check passed' : 'Executive approval granted'}`;
            } else if (reqData.status === 'REJECTED' && level === 1) {
                stepStatus = 'REJECTED';
                approverId = users['ahmad.fauzi@anri.go.id'].id;
                decidedAt = new Date(createdDate.getTime() + 30 * 60 * 1000);
                notes = reqData.reqNum === 'REQ-2024-0110' ? 'Gunakan platform internal untuk training' : 'Tidak sesuai dengan kebijakan keamanan ANRI';
            } else if (reqData.status === 'PENDING' && level === 1) {
                // Level 1 approved for pending requests awaiting level 2
                if (reqData.currentLevel >= 1 && reqData.requiredLevel > 1) {
                    stepStatus = 'APPROVED';
                    approverId = users['ahmad.fauzi@anri.go.id'].id;
                    decidedAt = new Date(createdDate.getTime() + 60 * 60 * 1000);
                    notes = 'Security review completed';
                }
            }

            await prisma.approvalStep.create({
                data: {
                    requestId: approval.id,
                    level,
                    roleRequired: level === 1 ? 'IT_SECURITY' : 'EXECUTIVE',
                    approverId,
                    status: stepStatus,
                    notes,
                    decidedAt,
                },
            });
        }
    }
    console.log(`  ✓ Created ${approvalRequestsData.length} approval requests with multi-level workflow`);

    // ========================================================================
    // 16. CREATE AUDIT LOGS (500+)
    // ========================================================================
    console.log('\n🔐 Creating cryptographic audit logs...');
    const actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN', 'LOGOUT', 'POLICY_TRIGGER'];
    const entityTypes = ['Document', 'User', 'Zone', 'PolicyRule', 'Session', 'AnomalyAlert'];
    let previousHash = '';

    for (let i = 0; i < 520; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const user = userList[Math.floor(Math.random() * userList.length)] as any;
        const timestamp = randomDate(30);

        const logData = {
            action,
            entityType,
            entityId: `ent-${Math.random().toString(36).substring(7)}`,
            userId: user.id,
            timestamp: timestamp.toISOString(),
        };

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
    console.log(`  ✓ Created 520 audit logs with cryptographic chain`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEED COMPLETE!');
    console.log('='.repeat(60));
    console.log(`
📊 Data Summary:
   • Users:            ${usersData.length}
   • Zones:            ${zonesData.length}
   • RFID Readers:     ${rfidReadersData.length}
   • Documents:        ${documentsData.length}
   • Movements:        ${movements.length}
   • Anomaly Alerts:   ${Math.min(anomalyMovements.length, 25)}
   • Policy Rules:     ${policyRulesData.length}
   • Violations:       220
   • Device Statuses:  30
   • KPI Metrics:      84
   • Risk Postures:    30
   • Audit Logs:       520
   
   TOTAL: 1000+ records ready for demo! 🚀
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
