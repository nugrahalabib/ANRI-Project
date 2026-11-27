<a href="https://demo-anri.spead.ai"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/banner-dark.svg"><img src="docs/readme/banner-light.svg" width="100%" alt="ANRI Risk Intelligence. A demo platform that tracks archive items by RFID, scores unusual movements and keeps a signed audit trail."></picture></a>

<p align="center"><a href="https://demo-anri.spead.ai"><b>Open demo-anri.spead.ai</b></a> · <a href="#getting-started">Getting started</a> · <a href="https://github.com/nugrahalabib">More of my work</a> · <a href="https://nugrahalabib.com">nugrahalabib.com</a></p>

## Overview

ANRI Sovereign Risk Intelligence Platform is a prototype that Spead AI built to take part in a procurement process of Arsip Nasional Republik Indonesia (ANRI), the national archives. It runs on simulated data and is not an official ANRI system. It shows how an archive could watch the movement of its physical records: every item carries an RFID tag, readers in each room log where it goes, and the platform flags movements that do not fit the item's usual pattern. All data in the demo is simulated. It is not an official ANRI system.

The demo models four questions an archive has to answer: where a sensitive record is right now, whether a movement was unusual and why, whether staff followed internet and access policies, and whether the audit trail can be trusted later. Executives, security staff and compliance officers each get their own dashboard for these questions.

Every alert stores its risk score and the factors behind it in plain language, and a rule module for scoring movements sits in the codebase. Audit entries are chained with HMAC signatures, so a changed or deleted entry breaks the chain. A Gemini 2.5 Flash assistant can answer questions using live counts from the database.

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/features-dark.svg"><img src="docs/readme/features-light.svg" width="100%" alt="What ANRI Risk Intelligence does: Six roles, three dashboards, RFID document tracking, Incident replay, Anomaly scores with reasons, Policy engine, Chained audit trail, Approvals and compliance, Assistant with live context."></picture>

## Why it exists

ANRI Sovereign Risk Intelligence Platform is a demo that Nugraha Labib Mujaddid built in January 2026 for Arsip Nasional Republik Indonesia (ANRI), the national archives. It shows how an archive could follow its physical records with RFID, flag movements that do not fit a record's usual pattern, check staff internet use against policy, and keep an audit trail that reveals tampering. Executives, security staff and compliance officers each get a dashboard for their own questions. Every number and record in it is simulated: it is a concept demo, not an ANRI system.

An archive keeps records of different classifications, public, restricted and secret, in rooms with different security levels. The demo models the questions that follow from that: where a sensitive record is right now, who moved it and whether the move was normal, and which alerts need attention first.

It also models the digital side and the paper trail: whether staff devices follow internet and access policies, whether moving a secret record or entering a high security zone was approved step by step, and whether the audit log can still be trusted months later. The screens group these questions into two use cases, document monitoring and internet monitoring, with dashboards on top.

| Who | What they do with it |
| --- | --- |
| **Executive** | Reads the overall risk posture, the 30 day risk trend, open alerts and compliance indicators on one page. |
| **IT security** | Works the alert matrix, reviews incidents and replays movements, manages policy rules and isolates devices. |
| **Compliance officer** | Follows regulations, audit schedules and pending actions, and reviews the audit trail and violations. |
| **Archivist** | Tracks documents, their zones and movement history, and requests approval to move restricted or secret records. |
| **Auditor** | Has read access to documents, alerts, policies and the audit trail, and can export audit data. |
| **System admin** | Has every permission: users, zones, settings and all dashboards. |

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/journey-dark.svg"><img src="docs/readme/journey-light.svg" width="100%" alt="How it works, step by step"></picture>

## Tour

### 1. Dashboards for three audiences

The executive overview puts six indicators, the overall risk gauge and a 30 day risk trend on one page. The security console is a tactical view with the alert matrix and reader status. The compliance center tracks regulations, audit readiness and pending actions. A banner on every page marks the demo mode and simulated data.

- Six indicator cards with sparklines and month over month change
- Overall risk split into document, digital activity and compliance risk
- Alert matrix with risk score, route between zones and status
- Regulatory framework list with compliance status per regulation

<img src="docs/readme/screens/01-executive-overview.jpg" width="100%" alt="Executive overview: indicators, overall risk gauge and the 30 day risk trend, all from simulated data.">

<sub>Executive overview: indicators, overall risk gauge and the 30 day risk trend, all from simulated data.</sub>

<p><img src="docs/readme/screens/02-security-console.jpg" width="49%" alt="Security console: critical alerts with risk scores and the zones each record passed."> <img src="docs/readme/screens/03-compliance-center.jpg" width="49%" alt="Compliance center: compliance indicators, regulations and pending actions."></p>

<sub>Left: Security console: critical alerts with risk scores and the zones each record passed. · Right: Compliance center: compliance indicators, regulations and pending actions.</sub>

### 2. Document tracking

Every record has an RFID tag, a classification and a current zone. The document list shows the last movement and a risk score per record; each record has a movement history with the readers that saw it and the alerts it raised.

- Filters by classification and zone, and counts of secret, restricted and alerted records
- Movement history with time, from and to zone, and the reader
- Alert log next to the history, with the reason for each alert

<img src="docs/readme/screens/04-document-tracking.jpg" width="100%" alt="Document tracking: RFID tags, classifications, current zones and risk scores.">

<sub>Document tracking: RFID tags, classifications, current zones and risk scores.</sub>

<p><img src="docs/readme/screens/05-document-history.jpg" width="100%" alt="Movement history of one simulated secret record, with its alert log."></p>

<sub>Movement history of one simulated secret record, with its alert log.</sub>

### 3. Alerts and incident replay

Alerts carry a type, a severity, a risk score, a plain-language explanation and the factors that contributed to the score. An incident can be replayed step by step on a zone map with playback controls and speed settings.

- Six alert types: unauthorised zone, after-hours access, unusual frequency, pattern deviation, classification mismatch and rapid movement
- Alert detail with document, classification, route and contributing factors
- Replay with step forward, step back, reset and 0.5x to 2x speed

<img src="docs/readme/screens/07-alert-explanation.jpg" width="100%" alt="Alert detail: the document, its route, the risk score and the explanation behind it.">

<sub>Alert detail: the document, its route, the risk score and the explanation behind it.</sub>

<p><img src="docs/readme/screens/06-incident-replay.jpg" width="100%" alt="Incident replay: the record's path on the zone map and the movement log, step by step."></p>

<sub>Incident replay: the record's path on the zone map and the movement log, step by step.</sub>

### 4. Zones and approvals

Zones have a security level, readers and a document count, and can be put into lockdown. Moving restricted or secret records, entering a high security zone or asking for a policy exception goes through an approval request with priority, levels and status.

- Zone detail with security level, documents, readers, 24 hour access and active alerts
- Lockdown toggle per zone
- Approval requests for document movement, zone access and policy exceptions

<img src="docs/readme/screens/08-zone-management.jpg" width="100%" alt="Zone management: a high security archive room with its readers, documents and alerts.">

<sub>Zone management: a high security archive room with its readers, documents and alerts.</sub>

<p><img src="docs/readme/screens/13-movement-approvals.jpg" width="100%" alt="Movement approvals: requests to move simulated secret records, with priority and status."></p>

<sub>Movement approvals: requests to move simulated secret records, with priority and status.</sub>

### 5. Internet policy monitoring

The second use case watches staff internet use. Policy rules match domains by pattern and category and carry an action and a severity. A simulator tests any address against the active rules, and the violations log and behavioural analytics show what was blocked, warned or logged.

- Rule categories: DNS block, URL filter, content, time, bandwidth and application control
- Actions: block, warn, log only, suspend access, isolate device
- Hourly activity pattern and top blocked domains

<img src="docs/readme/screens/09-policy-simulator.jpg" width="100%" alt="Policy engine: the simulator shows which active rule would block a test address.">

<sub>Policy engine: the simulator shows which active rule would block a test address.</sub>

<p><img src="docs/readme/screens/10-policy-violations.jpg" width="49%" alt="Violations log: time, user role, matched policy, target domain, action and severity."> <img src="docs/readme/screens/11-behavioral-analytics.jpg" width="49%" alt="Behavioural analytics: hourly activity, top blocked domains and a user risk table (names blurred)."></p>

<sub>Left: Violations log: time, user role, matched policy, target domain, action and severity. · Right: Behavioural analytics: hourly activity, top blocked domains and a user risk table (names blurred).</sub>

### 6. Audit trail and assistant

The audit trail lists every logged action with its HMAC signature, and a button checks the integrity of the whole chain. A floating assistant, Ask ANRI, answers questions about alerts, documents, violations and compliance using live counts from the database; it needs a Gemini API key to reply.

- Filters by action, entity and date, and CSV export
- Chain verification from the audit page
- Assistant with quick topics for alerts, documents, violations, compliance and navigation

<img src="docs/readme/screens/12-audit-trail.jpg" width="100%" alt="Audit trail with signatures per entry (detail and address columns blurred).">

<sub>Audit trail with signatures per entry (detail and address columns blurred).</sub>

<p><img src="docs/readme/screens/14-assistant.jpg" width="100%" alt="The Ask ANRI assistant panel opened over the executive overview."></p>

<sub>The Ask ANRI assistant panel opened over the executive overview.</sub>

## How it is built

One Next.js 16 application (App Router, React 19, TypeScript) holds both the screens and the API. Pages are client components that fetch from 28 route handlers under /api; the handlers use Prisma 5 with a MySQL database described by 23 models. Charts use ApexCharts; styling is CSS Modules with a custom dark design.

Sign-in checks a bcrypt hash, creates a session row and returns an HS256 JWT (jose) in an httpOnly cookie that lasts eight hours. Role permissions are defined in one map (src/lib/auth/rbac.ts) and checked when a page opens.

The risk logic lives in src/lib: anomaly rules with capped weights, behavioural baselines per document (normal hours, allowed zones, typical frequency), explanation formatting for executive and compliance readers, and a policy engine. In this demo the alerts, scores and violations on screen come from the seed script; the scoring and baseline modules are written but not yet called from the API routes. The audit signer is wired: sign-in, sign-out, approvals and the audit routes write HMAC-signed, hash-chained entries.

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/architecture-dark.svg"><img src="docs/readme/architecture-light.svg" width="100%" alt="How ANRI Risk Intelligence is built."></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/data-model-dark.svg"><img src="docs/readme/data-model-light.svg" width="100%" alt="Data model"></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/flow-1-dark.svg"><img src="docs/readme/flow-1-light.svg" width="100%" alt="Signing an audit entry"></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/flow-2-dark.svg"><img src="docs/readme/flow-2-light.svg" width="100%" alt="Scoring a movement (rule module)"></picture>

### Security

- Passwords are hashed with bcrypt at cost 12.
- Session tokens are HS256 JWTs in an httpOnly, SameSite=Lax cookie that is Secure in production, and each session is also checked against the database.
- Audit entries are signed with HMAC-SHA256 and chained by hash; the verify route recomputes every link in the chain and reports entries that do not match.
- Responses set X-Frame-Options, X-Content-Type-Options and Referrer-Policy, and the X-Powered-By header is off.
- The optional Nginx config redirects HTTP to HTTPS and rate-limits the API and the login route.
- The Gemini API key is read from the environment only.

### Decisions

| Decision | Why |
| --- | --- |
| Rules instead of a trained model | Every score can be explained factor by factor, which matters more to an archive's auditors than a black box, and it works without training data. |
| Simulated data everywhere | The demo had to look complete without RFID hardware, network logs or any real ANRI records. |
| One Next.js app for UI and API | A three day build with one deployable image and no separate backend to run. |
| Hash-chained, signed audit log | Changing or deleting an old entry breaks the chain, so tampering is visible when the chain is verified. |

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/readme/stack-dark.svg"><img src="docs/readme/stack-light.svg" width="100%" alt="ANRI Risk Intelligence stack."></picture>

### Highlights

- Every audit entry carries an HMAC-SHA256 signature and the hash of the entry before it, and /api/audit/verify checks the whole chain.
- Sessions are HS256 JWTs in an httpOnly cookie and are also stored in the database, so logging out ends the session on the server.
- The anomaly rule module caps each check's weight (after hours 30%, unauthorised zone 40%, frequency 20%, rapid moves 30%) and returns the factors with every score.
- All demo data is generated: a seed script fills zones, readers, documents, movements, alerts and violations, and the live activity feed is generated in the browser.
- The production image runs as a non-root user with a health check, and Prisma targets the Alpine OpenSSL 3 engine.

## Getting started

This is a demo with simulated data. It runs on your machine with Node.js and a MySQL database; the
RFID readers, devices and internet activity are generated by the seed script, so no hardware is needed.

### Requirements

- Node.js 20 (the Dockerfile uses `node:20-alpine`)
- MySQL 8. The Prisma schema uses the `mysql` provider (`prisma/schema.prisma`). The old README said
  SQLite; that is not what the code uses.
- A Gemini API key only if you want the assistant to answer. Everything else works without it.

### Environment variables

Create a `.env` file in the project root (it is git-ignored). Names only; choose your own values.

| Name | Used by | Needed |
| --- | --- | --- |
| `DATABASE_URL` | Prisma, seed scripts | Yes. A MySQL URL, for example `mysql://USER:PASSWORD@127.0.0.1:3306/anri` |
| `AUTH_SECRET` | `src/lib/auth/session.ts`, signs session tokens | Yes. A long random string |
| `AUDIT_SIGNING_KEY` | `src/lib/crypto/auditSigning.ts`, signs audit entries | Yes. A long random string |
| `GEMINI_API_KEY` | `src/app/api/ai/chat/route.ts`, the assistant | Optional |

Both secrets fall back to a built-in development value when they are missing, so always set them.
Note that `docker-compose.yml` sets `JWT_SECRET` and `AUDIT_SECRET`, which the code does not read: use
`AUTH_SECRET` and `AUDIT_SIGNING_KEY` instead.

### Run it locally

```bash
git clone https://github.com/nugrahalabib/ANRI-Project.git
cd ANRI-Project
npm ci

# a throwaway MySQL 8 database, if you do not have one
docker run -d --name anri-mysql -e MYSQL_ROOT_PASSWORD=change-me -e MYSQL_DATABASE=anri -p 127.0.0.1:3306:3306 mysql:8.0

npm run db:generate    # prisma generate
npm run db:push        # create the tables from prisma/schema.prisma
npm run db:seed        # node prisma/seed.js: users, zones, readers, documents, movements, alerts, violations
npm run dev            # http://localhost:3000
```

The seed script creates demo accounts for each role; their sign-in details are in `prisma/seed.js`.
Seeding is slow (it hashes each password with bcrypt cost 12 and inserts one row at a time), so give it
several minutes.

Other scripts in `package.json`: `npm run build`, `npm run start`, `npm run lint`, `npm run db:studio`.
There is no `npm test` script. The two test files in `src/__tests__/` are written for Jest, which is not
installed.

### Run with Docker

The `Dockerfile` builds a standalone Next.js image (Node 20 Alpine, non-root user, health check on
`/api/health`, Prisma engine for Alpine OpenSSL 3). It does not create tables, so push the schema first
with `npm run db:push` against the same database.

```bash
docker build -t anri-platform .
docker run -d -p 3000:3000 --env-file .env anri-platform
```

`docker-compose.yml` needs two fixes before it works: its `DATABASE_URL` points to an SQLite file while
the schema is MySQL, and its secret names do not match the code (see above). `nginx.conf` is an optional
reverse proxy with HTTP to HTTPS redirect and request rate limits for the API and the login route; it
expects certificates in `./ssl`.

### Project structure

```
ANRI-Project/
├── prisma/
│   ├── schema.prisma        # 23 models: users, zones, readers, documents, movements, alerts, policies, audit, approvals
│   └── seed.js              # simulated demo data (npm run db:seed)
├── scripts/seed-data/       # data arrays used by the seed
├── src/
│   ├── app/
│   │   ├── api/             # 28 route handlers (auth, documents, alerts, policies, audit, approvals, ai/chat, ...)
│   │   ├── dashboard/       # executive, security and compliance dashboards
│   │   ├── documents/       # document list and movement timelines
│   │   ├── incidents/       # incident list and replay
│   │   └── ...              # alerts, zones, policies, violations, audit, approvals, devices, reports, users, settings
│   ├── components/          # layouts, charts (ApexCharts), dashboard widgets, AI assistant
│   └── lib/
│       ├── ai/              # anomaly scoring, behavioural baselines, explanations
│       ├── auth/            # sessions (jose, bcryptjs) and role permissions
│       ├── crypto/          # HMAC-signed, hash-chained audit log
│       ├── policy/          # policy rules and enforcement
│       └── simulation/      # RFID and internet activity simulators
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

### What was verified

On 26 Nov 2026 these steps were run on a clean copy of the repository: `npm ci`, a MySQL 8.0 container,
`npx prisma generate`, `npx prisma db push`, `node prisma/seed.js` and `next dev`. On that (slow) machine
the seed needed more than 15 minutes; it was stopped during the audit log step and the last two steps
(audit logs, risk posture history) were finished with the same code. The screenshots in this README come
from that run, signed in with a local account and with the seeded people renamed to role labels. The
Docker image was not built in that run.

### License

All rights reserved. See [LICENSE](LICENSE). ANRI is named because the demo
was made for it; this is not an official ANRI system and the data is simulated.

---

<sub>Made by [Nugraha Labib Mujaddid](https://github.com/nugrahalabib) · [nugrahalabib.com](https://nugrahalabib.com) · [nugrahalabib@gmail.com](mailto:nugrahalabib@gmail.com)</sub>
