"use strict";
// Comprehensive Seed Data for ANRI Platform - Presidential Demo
// This creates 1000+ realistic records across all use cases
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
var prisma_1 = require("../src/generated/prisma");
var bcrypt = __importStar(require("bcryptjs"));
var crypto = __importStar(require("crypto"));
var adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
});
var prisma = new prisma_1.PrismaClient({ adapter: adapter });
// Helper functions
function generateRFIDTag() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var tag = 'ANRI-';
    for (var i = 0; i < 6; i++) {
        tag += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tag;
}
function randomDate(daysAgo) {
    var now = new Date();
    var past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}
function generateSignature(data) {
    return crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
}
function generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}
// ============================================================================
// USERS DATA
// ============================================================================
var usersData = [
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
var zonesData = [
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
var rfidReadersData = [
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
var documentsData = [
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
// ============================================================================
// POLICY RULES DATA
// ============================================================================
var policyRulesData = [
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
// MAIN SEED FUNCTION
// ============================================================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, _i, usersData_1, userData, passwordHash, user, zones, _a, zonesData_1, zoneData, zone, readers, _b, rfidReadersData_1, readerData, reader, documents, _c, documentsData_1, docData, document_1, allowedZones, movements, zoneList, readerList, docList, _loop_1, i, anomalyTypes, severities, anomalyMovements, _d, _e, mov, anomalyType, severity, explanations, factors, policies, _f, policyRulesData_1, policyData, policy, violationTargets, userList, policyList, i, policy, user, target, devicesData, _g, devicesData_1, device, kpiCategories, baseValues, month, period, _h, kpiCategories_1, category, improvement, value, day, date, improvement, actions, entityTypes, previousHash, i, action, entityType, user, timestamp, logData, signature, currentHash;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log('🚀 Starting comprehensive database seed...\n');
                    // Clear existing data
                    console.log('🗑️  Clearing existing data...');
                    return [4 /*yield*/, prisma.auditLog.deleteMany()];
                case 1:
                    _j.sent();
                    return [4 /*yield*/, prisma.policyViolation.deleteMany()];
                case 2:
                    _j.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany()];
                case 3:
                    _j.sent();
                    return [4 /*yield*/, prisma.anomalyAlert.deleteMany()];
                case 4:
                    _j.sent();
                    return [4 /*yield*/, prisma.documentMovement.deleteMany()];
                case 5:
                    _j.sent();
                    return [4 /*yield*/, prisma.documentBaseline.deleteMany()];
                case 6:
                    _j.sent();
                    return [4 /*yield*/, prisma.document.deleteMany()];
                case 7:
                    _j.sent();
                    return [4 /*yield*/, prisma.rFIDReader.deleteMany()];
                case 8:
                    _j.sent();
                    return [4 /*yield*/, prisma.zoneAccessPermission.deleteMany()];
                case 9:
                    _j.sent();
                    return [4 /*yield*/, prisma.zone.deleteMany()];
                case 10:
                    _j.sent();
                    return [4 /*yield*/, prisma.policyRule.deleteMany()];
                case 11:
                    _j.sent();
                    return [4 /*yield*/, prisma.deviceStatus.deleteMany()];
                case 12:
                    _j.sent();
                    return [4 /*yield*/, prisma.kPIMetric.deleteMany()];
                case 13:
                    _j.sent();
                    return [4 /*yield*/, prisma.riskPosture.deleteMany()];
                case 14:
                    _j.sent();
                    return [4 /*yield*/, prisma.accessRequest.deleteMany()];
                case 15:
                    _j.sent();
                    return [4 /*yield*/, prisma.session.deleteMany()];
                case 15:
                    _j.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 16:
                    _j.sent();
                    // ========================================================================
                    // 1. CREATE USERS
                    // ========================================================================
                    console.log('\n👥 Creating users...');
                    users = {};
                    _i = 0, usersData_1 = usersData;
                    _j.label = 17;
                case 17:
                    if (!(_i < usersData_1.length)) return [3 /*break*/, 21];
                    userData = usersData_1[_i];
                    return [4 /*yield*/, bcrypt.hash('Demo2024!', 12)];
                case 18:
                    passwordHash = _j.sent();
                    return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: userData.email,
                            name: userData.name,
                            passwordHash: passwordHash,
                            role: userData.role,
                            department: userData.department,
                            isActive: true,
                        },
                    })];
                case 19:
                    user = _j.sent();
                    users[userData.email] = user;
                    console.log("  \u2713 Created user: ".concat(user.name));
                    _j.label = 20;
                case 20:
                    _i++;
                    return [3 /*break*/, 17];
                case 21:
                    // ========================================================================
                    // 2. CREATE ZONES
                    // ========================================================================
                    console.log('\n🏢 Creating zones...');
                    zones = {};
                    _a = 0, zonesData_1 = zonesData;
                    _j.label = 22;
                case 22:
                    if (!(_a < zonesData_1.length)) return [3 /*break*/, 25];
                    zoneData = zonesData_1[_a];
                    return [4 /*yield*/, prisma.zone.create({
                        data: {
                            name: zoneData.name,
                            code: zoneData.code,
                            description: zoneData.description,
                            securityLevel: zoneData.securityLevel,
                            floor: zoneData.floor,
                            building: zoneData.building,
                            isActive: true,
                        },
                    })];
                case 23:
                    zone = _j.sent();
                    zones[zoneData.code] = zone;
                    console.log("  \u2713 Created zone: ".concat(zone.name));
                    _j.label = 24;
                case 24:
                    _a++;
                    return [3 /*break*/, 22];
                case 25:
                    // ========================================================================
                    // 3. CREATE RFID READERS
                    // ========================================================================
                    console.log('\n📡 Creating RFID readers...');
                    readers = {};
                    _b = 0, rfidReadersData_1 = rfidReadersData;
                    _j.label = 26;
                case 26:
                    if (!(_b < rfidReadersData_1.length)) return [3 /*break*/, 29];
                    readerData = rfidReadersData_1[_b];
                    return [4 /*yield*/, prisma.rFIDReader.create({
                        data: {
                            readerId: readerData.readerId,
                            name: readerData.name,
                            type: readerData.type,
                            zoneId: zones[readerData.zoneCode].id,
                            isOnline: readerData.isOnline,
                            lastPing: readerData.isOnline ? new Date() : randomDate(1),
                        },
                    })];
                case 27:
                    reader = _j.sent();
                    readers[readerData.readerId] = reader;
                    console.log("  \u2713 Created reader: ".concat(reader.name, " (").concat(readerData.isOnline ? 'ONLINE' : 'OFFLINE', ")"));
                    _j.label = 28;
                case 28:
                    _b++;
                    return [3 /*break*/, 26];
                case 29:
                    // ========================================================================
                    // 4. CREATE DOCUMENTS WITH BASELINES
                    // ========================================================================
                    console.log('\n📄 Creating documents with behavioral baselines...');
                    documents = {};
                    _c = 0, documentsData_1 = documentsData;
                    _j.label = 30;
                case 30:
                    if (!(_c < documentsData_1.length)) return [3 /*break*/, 34];
                    docData = documentsData_1[_c];
                    return [4 /*yield*/, prisma.document.create({
                        data: {
                            rfidTag: docData.rfidTag,
                            title: docData.title,
                            description: "Dokumen resmi ANRI: ".concat(docData.title),
                            classification: docData.classification,
                            organizationUnit: docData.orgUnit,
                            currentZoneId: zones[docData.zoneCode].id,
                            isActive: true,
                        },
                    })];
                case 31:
                    document_1 = _j.sent();
                    allowedZones = docData.classification === 'SECRET'
                        ? JSON.stringify([zones['ZONA-A1'].id])
                        : docData.classification === 'RESTRICTED'
                            ? JSON.stringify([zones['ZONA-A1'].id, zones['ZONA-A2'].id, zones['ZONA-B1'].id, zones['ZONA-B2'].id])
                            : JSON.stringify(Object.values(zones).map(function (z) { return z.id; }));
                    return [4 /*yield*/, prisma.documentBaseline.create({
                        data: {
                            documentId: document_1.id,
                            normalHoursStart: 8,
                            normalHoursEnd: 17,
                            allowedZones: allowedZones,
                            typicalMovementFreq: Math.random() * 3 + 0.5,
                            featureVector: JSON.stringify({ movements: [], patterns: [] }),
                            modelVersion: 'v1.2.0',
                            lastTrainedAt: randomDate(7),
                            confidenceScore: 0.85 + Math.random() * 0.14,
                        },
                    })];
                case 32:
                    _j.sent();
                    documents[docData.rfidTag] = document_1;
                    _j.label = 33;
                case 33:
                    _c++;
                    return [3 /*break*/, 30];
                case 34:
                    console.log("  \u2713 Created ".concat(documentsData.length, " documents with baselines"));
                    // ========================================================================
                    // 5. CREATE DOCUMENT MOVEMENTS (100+)
                    // ========================================================================
                    console.log('\n🚶 Creating document movements...');
                    movements = [];
                    zoneList = Object.values(zones);
                    readerList = Object.values(readers);
                    docList = Object.values(documents);
                    _loop_1 = function (i) {
                        var doc, fromZone, toZone, reader, isAnomaly, movement;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    doc = docList[Math.floor(Math.random() * docList.length)];
                                    fromZone = zoneList[Math.floor(Math.random() * zoneList.length)];
                                    toZone = zoneList[Math.floor(Math.random() * zoneList.length)];
                                    reader = readerList.find(function (r) { return r.zoneId === toZone.id; }) || readerList[0];
                                    isAnomaly = Math.random() < 0.2;
                                    return [4 /*yield*/, prisma.documentMovement.create({
                                        data: {
                                            documentId: doc.id,
                                            fromZoneId: fromZone.id,
                                            toZoneId: toZone.id,
                                            readerId: reader.id,
                                            isAuthorized: !isAnomaly,
                                            riskScore: isAnomaly ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
                                            timestamp: randomDate(30),
                                        },
                                    })];
                                case 1:
                                    movement = _k.sent();
                                    movements.push(__assign(__assign({}, movement), { isAnomaly: isAnomaly, doc: doc, fromZone: fromZone, toZone: toZone }));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _j.label = 35;
                case 35:
                    if (!(i < 120)) return [3 /*break*/, 38];
                    return [5 /*yield**/, _loop_1(i)];
                case 36:
                    _j.sent();
                    _j.label = 37;
                case 37:
                    i++;
                    return [3 /*break*/, 35];
                case 38:
                    console.log("  \u2713 Created ".concat(movements.length, " document movements"));
                    // ========================================================================
                    // 6. CREATE ANOMALY ALERTS (20+)
                    // ========================================================================
                    console.log('\n⚠️  Creating anomaly alerts...');
                    anomalyTypes = ['UNAUTHORIZED_ZONE', 'AFTER_HOURS_ACCESS', 'UNUSUAL_FREQUENCY', 'PATTERN_DEVIATION', 'RAPID_MOVEMENT'];
                    severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                    anomalyMovements = movements.filter(function (m) { return m.isAnomaly; });
                    _d = 0, _e = anomalyMovements.slice(0, 25);
                    _j.label = 39;
                case 39:
                    if (!(_d < _e.length)) return [3 /*break*/, 42];
                    mov = _e[_d];
                    anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
                    severity = severities[Math.floor(Math.random() * severities.length)];
                    explanations = {
                        UNAUTHORIZED_ZONE: "Dokumen dengan klasifikasi ".concat(mov.doc.classification, " terdeteksi di zona ").concat(mov.toZone.name, " yang tidak diizinkan. Zona ini memiliki tingkat keamanan ").concat(mov.toZone.securityLevel, " yang tidak sesuai dengan klasifikasi dokumen."),
                        AFTER_HOURS_ACCESS: "Pergerakan dokumen terdeteksi pada pukul ".concat(18 + Math.floor(Math.random() * 6), ":").concat(Math.floor(Math.random() * 60).toString().padStart(2, '0'), " WIB, di luar jam operasional normal (08:00-17:00 WIB)."),
                        UNUSUAL_FREQUENCY: "Dokumen ini mengalami ".concat(8 + Math.floor(Math.random() * 12), " pergerakan dalam 24 jam terakhir, melebihi baseline normal sebesar ").concat(Math.floor(Math.random() * 5) + 1, " pergerakan per hari."),
                        PATTERN_DEVIATION: "Pola pergerakan dokumen menyimpang ".concat(65 + Math.floor(Math.random() * 30), "% dari profil behavioral yang sudah dipelajari. Rute ").concat(mov.fromZone.name, " \u2192 ").concat(mov.toZone.name, " belum pernah tercatat sebelumnya."),
                        RAPID_MOVEMENT: "Dokumen berpindah melalui ".concat(3 + Math.floor(Math.random() * 5), " zona dalam ").concat(5 + Math.floor(Math.random() * 10), " menit terakhir, mengindikasikan potensi pemindahan tidak terotorisasi."),
                    };
                    factors = [
                        { factor: 'Zone Security Mismatch', weight: 0.3 + Math.random() * 0.2 },
                        { factor: 'Time Anomaly', weight: 0.2 + Math.random() * 0.15 },
                        { factor: 'Frequency Deviation', weight: 0.25 + Math.random() * 0.15 },
                        { factor: 'Pattern Deviation', weight: 0.15 + Math.random() * 0.1 },
                    ];
                    return [4 /*yield*/, prisma.anomalyAlert.create({
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
                    })];
                case 40:
                    _j.sent();
                    _j.label = 41;
                case 41:
                    _d++;
                    return [3 /*break*/, 39];
                case 42:
                    console.log("  \u2713 Created ".concat(Math.min(anomalyMovements.length, 25), " anomaly alerts"));
                    // ========================================================================
                    // 7. CREATE POLICY RULES
                    // ========================================================================
                    console.log('\n📋 Creating policy rules...');
                    policies = {};
                    _f = 0, policyRulesData_1 = policyRulesData;
                    _j.label = 43;
                case 43:
                    if (!(_f < policyRulesData_1.length)) return [3 /*break*/, 46];
                    policyData = policyRulesData_1[_f];
                    return [4 /*yield*/, prisma.policyRule.create({
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
                    })];
                case 44:
                    policy = _j.sent();
                    policies[policyData.name] = policy;
                    console.log("  \u2713 Created policy: ".concat(policy.name));
                    _j.label = 45;
                case 45:
                    _f++;
                    return [3 /*break*/, 43];
                case 46:
                    // ========================================================================
                    // 8. CREATE POLICY VIOLATIONS (200+)
                    // ========================================================================
                    console.log('\n🚫 Creating policy violations...');
                    violationTargets = [
                        'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
                        'bet365.com', 'pokerstars.com', 'youtube.com', 'netflix.com',
                        'steam.com', 'epicgames.com', 'thepiratebay.org', 'tokopedia.com',
                        'shopee.co.id', 'mega.nz', 'dropbox.com', 'mail.google.com',
                    ];
                    userList = Object.values(users);
                    policyList = Object.values(policies);
                    i = 0;
                    _j.label = 47;
                case 47:
                    if (!(i < 220)) return [3 /*break*/, 50];
                    policy = policyList[Math.floor(Math.random() * policyList.length)];
                    user = userList[Math.floor(Math.random() * userList.length)];
                    target = violationTargets[Math.floor(Math.random() * violationTargets.length)];
                    return [4 /*yield*/, prisma.policyViolation.create({
                        data: {
                            policyId: policy.id,
                            userId: user.id,
                            deviceId: "WS-".concat(String(Math.floor(Math.random() * 300) + 1).padStart(3, '0')),
                            ipAddress: "192.168.".concat(Math.floor(Math.random() * 5) + 1, ".").concat(Math.floor(Math.random() * 254) + 1),
                            requestUrl: "https://".concat(target, "/page/").concat(Math.random().toString(36).substring(7)),
                            dnsQuery: target,
                            matchedPattern: policy.pattern.split(',')[0],
                            actionTaken: policy.action,
                            severity: policy.severity,
                            userNotified: Math.random() > 0.3,
                            metadata: JSON.stringify({ browser: 'Chrome', os: 'Windows 11', department: user.department }),
                            timestamp: randomDate(30),
                        },
                    })];
                case 48:
                    _j.sent();
                    _j.label = 49;
                case 49:
                    i++;
                    return [3 /*break*/, 47];
                case 50:
                    console.log("  \u2713 Created 220 policy violations");
                    // ========================================================================
                    // 9. CREATE DEVICE STATUS (45 diverse devices)
                    // ========================================================================
                    console.log('\n💻 Creating enterprise device statuses...');
                    devicesData = [
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
                    _g = 0, devicesData_1 = devicesData;
                    _j.label = 51;
                case 51:
                    if (!(_g < devicesData_1.length)) return [3 /*break*/, 54];
                    device = devicesData_1[_g];
                    return [4 /*yield*/, prisma.deviceStatus.create({
                        data: {
                            deviceId: device.deviceId,
                            hostname: device.hostname,
                            ipAddress: device.ip,
                            macAddress: "".concat(Math.random().toString(16).substr(2, 2).toUpperCase(), ":").concat(Math.random().toString(16).substr(2, 2).toUpperCase(), ":").concat(Math.random().toString(16).substr(2, 2).toUpperCase(), ":").concat(Math.random().toString(16).substr(2, 2).toUpperCase(), ":").concat(Math.random().toString(16).substr(2, 2).toUpperCase(), ":").concat(Math.random().toString(16).substr(2, 2).toUpperCase()),
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
                    })];
                case 52:
                    _j.sent();
                    _j.label = 53;
                case 53:
                    _g++;
                    return [3 /*break*/, 51];
                case 54:
                    console.log("  \u2713 Created ".concat(devicesData.length, " enterprise device statuses"));
                    // ========================================================================
                    // 10. CREATE KPI METRICS (84 - 12 months x 7 KPIs)
                    // ========================================================================
                    console.log('\n📊 Creating KPI metrics...');
                    kpiCategories = ['MTTD', 'MTTR', 'COMPLIANCE_RATE', 'ANOMALY_ACCURACY', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK', 'SYSTEM_HEALTH'];
                    baseValues = {
                        MTTD: 5, MTTR: 60, COMPLIANCE_RATE: 88, ANOMALY_ACCURACY: 85,
                        POLICY_VIOLATIONS: 150, DOCUMENT_RISK: 35, SYSTEM_HEALTH: 92,
                    };
                    month = 0;
                    _j.label = 55;
                case 55:
                    if (!(month < 12)) return [3 /*break*/, 60];
                    period = "2024-".concat(String(month + 1).padStart(2, '0'));
                    _h = 0, kpiCategories_1 = kpiCategories;
                    _j.label = 56;
                case 56:
                    if (!(_h < kpiCategories_1.length)) return [3 /*break*/, 59];
                    category = kpiCategories_1[_h];
                    improvement = month * 0.5;
                    value = baseValues[category];
                    if (['MTTD', 'MTTR', 'POLICY_VIOLATIONS', 'DOCUMENT_RISK'].includes(category)) {
                        value = Math.max(value - improvement * (category === 'MTTD' ? 0.3 : 1), category === 'MTTD' ? 2 : 20);
                    }
                    else {
                        value = Math.min(value + improvement * 0.6, 99);
                    }
                    return [4 /*yield*/, prisma.kPIMetric.create({
                        data: {
                            name: "".concat(category, " - ").concat(period),
                            category: category,
                            value: value + (Math.random() - 0.5) * 5,
                            target: category.includes('RATE') || category.includes('ACCURACY') || category === 'SYSTEM_HEALTH' ? 95 : null,
                            trend: month > 0 ? ['UP', 'DOWN', 'STABLE'][Math.floor(Math.random() * 3)] : null,
                            period: period,
                            calculatedAt: new Date(2024, month, 28),
                        },
                    })];
                case 57:
                    _j.sent();
                    _j.label = 58;
                case 58:
                    _h++;
                    return [3 /*break*/, 56];
                case 59:
                    month++;
                    return [3 /*break*/, 55];
                case 60:
                    console.log("  \u2713 Created 84 KPI metrics (12 months)");
                    // ========================================================================
                    // 11. CREATE RISK POSTURE (30 days)
                    // ========================================================================
                    console.log('\n🎯 Creating risk posture snapshots...');
                    day = 0;
                    _j.label = 61;
                case 61:
                    if (!(day < 30)) return [3 /*break*/, 64];
                    date = new Date();
                    date.setDate(date.getDate() - day);
                    improvement = (30 - day) * 0.3;
                    return [4 /*yield*/, prisma.riskPosture.create({
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
                    })];
                case 62:
                    _j.sent();
                    _j.label = 63;
                case 63:
                    day++;
                    return [3 /*break*/, 61];
                case 64:
                    console.log("  \u2713 Created 30 risk posture snapshots");
                    // ========================================================================
                    // 12. CREATE AUDIT LOGS (500+)
                    // ========================================================================
                    console.log('\n🔐 Creating cryptographic audit logs...');
                    actions = ['CREATE', 'UPDATE', 'ACCESS', 'MOVE', 'ALERT', 'LOGIN', 'LOGOUT', 'POLICY_TRIGGER'];
                    entityTypes = ['Document', 'User', 'Zone', 'PolicyRule', 'Session', 'AnomalyAlert'];
                    previousHash = '';
                    i = 0;
                    _j.label = 65;
                case 65:
                    if (!(i < 520)) return [3 /*break*/, 68];
                    action = actions[Math.floor(Math.random() * actions.length)];
                    entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
                    user = userList[Math.floor(Math.random() * userList.length)];
                    timestamp = randomDate(30);
                    logData = {
                        action: action,
                        entityType: entityType,
                        entityId: "ent-".concat(Math.random().toString(36).substring(7)),
                        userId: user.id,
                        timestamp: timestamp.toISOString(),
                    };
                    signature = generateSignature(JSON.stringify(logData));
                    currentHash = generateHash(JSON.stringify(logData) + previousHash);
                    return [4 /*yield*/, prisma.auditLog.create({
                        data: {
                            action: action,
                            entityType: entityType,
                            entityId: logData.entityId,
                            userId: user.id,
                            previousValue: action === 'UPDATE' ? JSON.stringify({ status: 'old' }) : null,
                            newValue: action === 'UPDATE' ? JSON.stringify({ status: 'new' }) : null,
                            metadata: JSON.stringify({ source: 'system', version: '1.0' }),
                            ipAddress: "192.168.".concat(Math.floor(Math.random() * 5) + 1, ".").concat(Math.floor(Math.random() * 254) + 1),
                            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            signature: signature,
                            previousHash: previousHash || null,
                            timestamp: timestamp,
                        },
                    })];
                case 66:
                    _j.sent();
                    previousHash = currentHash;
                    _j.label = 67;
                case 67:
                    i++;
                    return [3 /*break*/, 65];
                case 68:
                    console.log("  \u2713 Created 520 audit logs with cryptographic chain");
                    // ========================================================================
                    // SUMMARY
                    // ========================================================================
                    console.log('\n' + '='.repeat(60));
                    console.log('✅ DATABASE SEED COMPLETE!');
                    console.log('='.repeat(60));
                    console.log("\n\uD83D\uDCCA Data Summary:\n   \u2022 Users:            ".concat(usersData.length, "\n   \u2022 Zones:            ").concat(zonesData.length, "\n   \u2022 RFID Readers:     ").concat(rfidReadersData.length, "\n   \u2022 Documents:        ").concat(documentsData.length, "\n   \u2022 Movements:        ").concat(movements.length, "\n   \u2022 Anomaly Alerts:   ").concat(Math.min(anomalyMovements.length, 25), "\n   \u2022 Policy Rules:     ").concat(policyRulesData.length, "\n   \u2022 Violations:       220\n   \u2022 Device Statuses:  30\n   \u2022 KPI Metrics:      84\n   \u2022 Risk Postures:    30\n   \u2022 Audit Logs:       520\n   \n   TOTAL: 1000+ records ready for demo! \uD83D\uDE80\n"));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$disconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
