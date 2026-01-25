# ANRI Sovereign Risk Intelligence Platform

🛡️ **Enterprise AI Monitoring & Risk Intelligence System**

Platform untuk Arsip Nasional Republik Indonesia (ANRI) yang menyediakan kemampuan deteksi risiko berbasis AI untuk aset fisik dan digital.

---

## ✨ Features

### 🔐 Security & Compliance
- Role-based access control (RBAC)
- Cryptographic audit trail (HMAC-SHA256)
- Explainable AI (XAI) for all decisions

### 📊 Dashboards
- Executive Dashboard - Strategic KPIs
- Security Console - Real-time monitoring
- Compliance Center - Audit trail & metrics

### 📁 Document Intelligence
- RFID-based document tracking
- Movement timeline visualization
- Incident replay with playback controls

### 🤖 AI Modules
- Behavioral profiling engine
- Multi-factor anomaly detection
- Human-readable AI explanations

### 📋 Reports
- 6 report templates
- PDF/Excel/CSV export
- Scheduled automation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/anri-go-id/anri-platform.git
cd anri-platform

# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@anri.go.id | admin123 |
| Executive | executive@anri.go.id | executive123 |
| Security | security@anri.go.id | security123 |
| Compliance | compliance@anri.go.id | compliance123 |

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f anri-platform
```

---

## 📁 Project Structure

```
anri-platform/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── documents/       # Document pages
│   │   └── ...
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── charts/          # Chart components
│   │   └── layouts/         # Layout components
│   └── lib/                 # Utilities & modules
│       ├── ai/              # AI modules
│       ├── auth/            # Authentication
│       ├── crypto/          # Cryptography
│       └── policy/          # Policy engine
├── prisma/                  # Database schema
├── Dockerfile               # Production build
└── docker-compose.yml       # Container orchestration
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard metrics |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/[id]/timeline` | Document timeline |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts` | Update alert status |
| GET | `/api/audit` | Audit trail |
| POST | `/api/audit` | Create audit log |
| GET | `/api/health` | Health check |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma 7
- **Styling**: Custom CSS Design System
- **Charts**: ApexCharts
- **Auth**: JWT + bcrypt

---

## 📄 License

© 2024 Arsip Nasional Republik Indonesia. All rights reserved.
