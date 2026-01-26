// PRESIDENTIAL DEMO - COMPREHENSIVE SEED DATA
// Data arrays only - no Prisma needed here
const crypto = require('crypto');

// Helpers
const randomDate = (daysAgo) => new Date(Date.now() - Math.random() * daysAgo * 86400000);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRFID = () => 'ANRI-' + 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.split('').sort(() => Math.random() - 0.5).slice(0, 6).join('');
const generateMAC = () => Array(6).fill().map(() => Math.random().toString(16).substr(2, 2).toUpperCase()).join(':');
const generateSignature = (data) => crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
const generateHash = (data) => crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);

// ============= USERS DATA (15 users with specific roles) =============
const usersData = [
    { email: 'budi.santoso@anri.go.id', name: 'Dr. Ir. Budi Santoso, M.Sc.', role: 'EXECUTIVE', department: 'Direktorat Utama' },
    { email: 'siti.nurhaliza@anri.go.id', name: 'Prof. Dr. Siti Nurhaliza, M.A.', role: 'EXECUTIVE', department: 'Manajemen Eksekutif' },
    { email: 'ahmad.fauzi@anri.go.id', name: 'Ahmad Fauzi, S.Kom.', role: 'IT_SECURITY', department: 'Unit IT' },
    { email: 'maya.kusuma@anri.go.id', name: 'Maya Kusuma, S.Kom., CISSP', role: 'IT_SECURITY', department: 'NSOC' },
    { email: 'agus.setiawan@anri.go.id', name: 'Agus Setiawan, S.Kom.', role: 'IT_SECURITY', department: 'Unit IT' },
    { email: 'rina.wulandari@anri.go.id', name: 'Rina Wulandari, S.T.', role: 'SYSTEM_ADMIN', department: 'Unit IT' },
    { email: 'citra.dewi@anri.go.id', name: 'Citra Dewi, S.H., M.H.', role: 'COMPLIANCE_OFFICER', department: 'Kepatuhan & Audit' },
    { email: 'putri.handayani@anri.go.id', name: 'Putri Handayani, S.E., Ak.', role: 'COMPLIANCE_OFFICER', department: 'Audit Internal' },
    { email: 'hendra.wijaya@anri.go.id', name: 'Hendra Wijaya, S.Ars.', role: 'ARCHIVIST', department: 'Preservasi Arsip' },
    { email: 'dewi.sartika@anri.go.id', name: 'Dewi Sartika, S.Ars.', role: 'ARCHIVIST', department: 'Preservasi Arsip' },
    { email: 'dimas.pratama@anri.go.id', name: 'Dimas Pratama, A.Md.', role: 'ARCHIVIST', department: 'Kearsipan Dinamis' },
    { email: 'rudi.hartono@anri.go.id', name: 'Rudi Hartono, S.E.', role: 'AUDITOR', department: 'Inspektorat' },
    { email: 'sri.mulyani@anri.go.id', name: 'Sri Mulyani, S.H.', role: 'AUDITOR', department: 'Inspektorat' },
    { email: 'bambang.susanto@anri.go.id', name: 'Bambang Susanto', role: 'ARCHIVIST', department: 'Kearsipan Dinamis' },
    { email: 'admin@anri.go.id', name: 'Administrator Sistem', role: 'SYSTEM_ADMIN', department: 'Unit IT' },
];

// ============= ZONES (8 zones) =============
const zonesData = [
    { code: 'ZONA-A1', name: 'Ruang Arsip Rahasia', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 2', building: 'Gedung A - Arsip Pusat', description: 'Penyimpanan arsip klasifikasi RAHASIA dan SANGAT RAHASIA dari K/L strategis', capacity: 5000 },
    { code: 'ZONA-A2', name: 'Ruang Digitalisasi', securityLevel: 'RESTRICTED', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang pemindaian dan digitalisasi dokumen dengan peralatan scanner industri', capacity: 1000 },
    { code: 'ZONA-B1', name: 'Kantor Kearsipan Dinamis', securityLevel: 'STANDARD', floor: 'Lantai 1', building: 'Gedung B - Administrasi', description: 'Kantor utama unit kearsipan dinamis untuk arsip aktif', capacity: 3000 },
    { code: 'ZONA-B2', name: 'Ruang Rapat VIP', securityLevel: 'HIGH_SECURITY', floor: 'Lantai 3', building: 'Gedung B - Administrasi', description: 'Ruang rapat untuk pertemuan tingkat tinggi dan demo kepresidenan', capacity: 50 },
    { code: 'ZONA-C1', name: 'Gudang Penyimpanan Arsip Inaktif', securityLevel: 'RESTRICTED', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Gudang penyimpanan arsip inaktif dengan kontrol suhu dan kelembaban', capacity: 20000 },
    { code: 'ZONA-L1', name: 'Lobby Utama', securityLevel: 'PUBLIC', floor: 'Lantai Dasar', building: 'Gedung A - Arsip Pusat', description: 'Area lobby dan resepsionis untuk pengunjung', capacity: 100 },
    { code: 'ZONA-R1', name: 'Ruang Baca Publik', securityLevel: 'PUBLIC', floor: 'Lantai 1', building: 'Gedung A - Arsip Pusat', description: 'Ruang baca untuk pengunjung dan peneliti', capacity: 50 },
    { code: 'ZONA-S1', name: 'Ruang Server & Data Center', securityLevel: 'HIGH_SECURITY', floor: 'Basement', building: 'Gedung C - Penyimpanan', description: 'Data center utama dan server room dengan akses biometrik', capacity: 10 },
];

// ============= RFID READERS (12 readers) =============
const rfidReadersData = [
    { readerId: 'RDR-1001', name: 'Portal Utama Gedung A', type: 'PORTAL', zoneCode: 'ZONA-L1', isOnline: true },
    { readerId: 'RDR-1002', name: 'Portal Arsip Rahasia Entry', type: 'PORTAL', zoneCode: 'ZONA-A1', isOnline: true },
    { readerId: 'RDR-1003', name: 'Portal Arsip Rahasia Exit', type: 'PORTAL', zoneCode: 'ZONA-A1', isOnline: true },
    { readerId: 'RDR-1004', name: 'Fixed Reader Digitalisasi', type: 'FIXED', zoneCode: 'ZONA-A2', isOnline: true },
    { readerId: 'RDR-1005', name: 'Portal Gudang Arsip', type: 'PORTAL', zoneCode: 'ZONA-C1', isOnline: true },
    { readerId: 'RDR-1006', name: 'Fixed Reader Kearsipan', type: 'FIXED', zoneCode: 'ZONA-B1', isOnline: true },
    { readerId: 'RDR-1007', name: 'Portal VIP Room', type: 'PORTAL', zoneCode: 'ZONA-B2', isOnline: true },
    { readerId: 'RDR-1008', name: 'Fixed Reader Ruang Baca', type: 'FIXED', zoneCode: 'ZONA-R1', isOnline: true },
    { readerId: 'RDR-1009', name: 'Portal Server Room', type: 'PORTAL', zoneCode: 'ZONA-S1', isOnline: true },
    { readerId: 'RDR-1010', name: 'Mobile Reader Audit', type: 'MOBILE', zoneCode: 'ZONA-B1', isOnline: true },
    { readerId: 'RDR-1011', name: 'Mobile Reader Inspeksi', type: 'MOBILE', zoneCode: 'ZONA-A2', isOnline: true },
    { readerId: 'RDR-1012', name: 'Portal Gudang Exit', type: 'PORTAL', zoneCode: 'ZONA-C1', isOnline: false },
];

// ============= DOCUMENTS (50 documents) =============
const documentsData = [
    // SECRET (15)
    { rfidTag: 'ANRI-X8K9M2', title: 'Arsip Rahasia Kepegawaian Eselon I 2024', classification: 'SECRET', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-P3Q7R1', title: 'Dokumen Intelijen Keamanan Negara Vol. XII', classification: 'SECRET', orgUnit: 'BIN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-K2L4W9', title: 'SK Presiden No. 45/2024 - Pengangkatan Menteri Kabinet', classification: 'SECRET', orgUnit: 'Sekretariat Negara', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-M5N8V4', title: 'Perjanjian Bilateral Pertahanan Indonesia-Australia 2024', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-J7H2F6', title: 'Laporan Audit BPK Khusus - Dana COVID-19', classification: 'SECRET', orgUnit: 'BPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-T9Y3B5', title: 'Dokumen Strategi Nasional Cybersecurity 2024-2029', classification: 'SECRET', orgUnit: 'BSSN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-R4S8D2', title: 'Notulen Rapat Kabinet Terbatas - Penanganan IKN', classification: 'SECRET', orgUnit: 'Sekretariat Kabinet', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-G6E1C7', title: 'Dokumen Investigasi KPK - Korupsi Infrastruktur', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-U8I5O3', title: 'Rencana Operasi Militer Perbatasan Kalimantan', classification: 'SECRET', orgUnit: 'TNI', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-Z1A4Q9', title: 'Dokumen Negosiasi FTA ASEAN-EU', classification: 'SECRET', orgUnit: 'Kemendag', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-W2X5Y8', title: 'Laporan Surveillance Keamanan Nasional Q4-2024', classification: 'SECRET', orgUnit: 'BIN', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-V3C6D9', title: 'MoU Kerjasama Pertahanan Indonesia-AS', classification: 'SECRET', orgUnit: 'Kemenhan', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-B4E7F1', title: 'Dokumen Strategis Ekonomi Nasional 2025', classification: 'SECRET', orgUnit: 'Bappenas', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-H5I8J2', title: 'Laporan Rahasia Kekayaan Pejabat Negara', classification: 'SECRET', orgUnit: 'KPK', zoneCode: 'ZONA-A1' },
    { rfidTag: 'ANRI-N6O9P3', title: 'Dokumen Perundingan Wilayah Laut Natuna', classification: 'SECRET', orgUnit: 'Kemlu', zoneCode: 'ZONA-A1' },
    // RESTRICTED (20)
    { rfidTag: 'ANRI-B2C5D8', title: 'SK Pengangkatan Pejabat Eselon III No. 123/2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-E3F6G9', title: 'Laporan Keuangan Triwulan IV 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H4I7J1', title: 'Perjanjian Kerjasama ANRI-UNESCO', classification: 'RESTRICTED', orgUnit: 'Humas', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-K5L8M2', title: 'Dokumen Tender Renovasi Gedung C', classification: 'RESTRICTED', orgUnit: 'Bagian Umum', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-N6O9P3R', title: 'Arsip Rapat Koordinasi Eselon I', classification: 'RESTRICTED', orgUnit: 'Sekretariat', zoneCode: 'ZONA-B2' },
    { rfidTag: 'ANRI-Q7R1S4', title: 'Laporan Evaluasi Kinerja Pegawai 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-T8U2V5', title: 'Dokumen SOP Pengelolaan Arsip Digital', classification: 'RESTRICTED', orgUnit: 'Bagian Organisasi', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-W9X3Y6', title: 'Arsip Sengketa Kepegawaian 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-A1B4C7', title: 'Laporan Inventarisasi Aset ANRI 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-C1' },
    { rfidTag: 'ANRI-D2E5F8', title: 'Dokumen Rencana Strategis ANRI 2025-2029', classification: 'RESTRICTED', orgUnit: 'Biro Perencanaan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-G3H6I9', title: 'SK Mutasi Pegawai Batch Januari 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-J4K7L1', title: 'Kontrak Pengadaan Server IBM 2024', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-M5N8O2', title: 'Laporan Audit Internal Q4 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-P6Q9R3', title: 'Dokumen Akreditasi Laboratorium Preservasi', classification: 'RESTRICTED', orgUnit: 'Lab Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-S7T1U4', title: 'Arsip Pengaduan Whistleblower 2024', classification: 'RESTRICTED', orgUnit: 'Inspektorat', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-V8W2X5', title: 'MoU Kerjasama dengan Arsip Nasional Belanda', classification: 'RESTRICTED', orgUnit: 'Kerjasama Internasional', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-Y9Z3A6', title: 'Laporan Pengembangan SDM ANRI 2024', classification: 'RESTRICTED', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-B1C4D7', title: 'Dokumen Sertifikasi ISO 27001 ANRI', classification: 'RESTRICTED', orgUnit: 'Unit IT', zoneCode: 'ZONA-S1' },
    { rfidTag: 'ANRI-E2F5G8', title: 'SK Penetapan Tunjangan Kinerja 2024', classification: 'RESTRICTED', orgUnit: 'Biro Keuangan', zoneCode: 'ZONA-B1' },
    { rfidTag: 'ANRI-H3I6J9', title: 'Arsip Hibah Peralatan dari Pemerintah Jepang', classification: 'RESTRICTED', orgUnit: 'Kerjasama Internasional', zoneCode: 'ZONA-A2' },
    // PUBLIC (15)
    { rfidTag: 'ANRI-K4L7M1', title: 'Pengumuman Penerimaan CPNS ANRI 2024', classification: 'PUBLIC', orgUnit: 'Biro Kepegawaian', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-N5O8P2X', title: 'Surat Edaran Kepala ANRI No. 01/SE/2024', classification: 'PUBLIC', orgUnit: 'Sekretariat', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Q6R9S3X', title: 'Laporan Tahunan ANRI 2023', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-T7U1V4', title: 'Buku Pedoman Kearsipan untuk K/L', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-W8X2Y5', title: 'Katalog Arsip Periode Kolonial Belanda', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-Z9A3B6', title: 'Majalah Arsip Nasional Edisi 54', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-C1D4E7', title: 'Prosiding Konferensi Kearsipan Nasional 2024', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-F2G5H8', title: 'Brosur Layanan ANRI 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-L1' },
    { rfidTag: 'ANRI-I3J6K9', title: 'Peraturan ANRI No. 5 Tahun 2024', classification: 'PUBLIC', orgUnit: 'Hukum', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-L4M7N1', title: 'Standar Deskripsi Arsip Indonesia (SDAI)', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-O5P8Q2', title: 'Panduan Digitalisasi Arsip Nasional', classification: 'PUBLIC', orgUnit: 'Pusat Preservasi', zoneCode: 'ZONA-A2' },
    { rfidTag: 'ANRI-R6S9T3', title: 'Katalog Pameran Arsip Kemerdekaan RI', classification: 'PUBLIC', orgUnit: 'Pusat Layanan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-U7V1W4', title: 'Laporan Survei Kepuasan Masyarakat 2024', classification: 'PUBLIC', orgUnit: 'Humas', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-X8Y2Z5', title: 'Direktori Lembaga Kearsipan Daerah 2024', classification: 'PUBLIC', orgUnit: 'Pusat Pembinaan', zoneCode: 'ZONA-R1' },
    { rfidTag: 'ANRI-A9B3C6', title: 'Modul Pelatihan Arsiparis Dasar', classification: 'PUBLIC', orgUnit: 'Pusat Pendidikan', zoneCode: 'ZONA-R1' },
];

module.exports = { usersData, zonesData, rfidReadersData, documentsData, randomDate, randomInt, randomChoice, generateRFID, generateMAC, generateSignature, generateHash };
