# 🇷🇼 FIN-GAP RWANDA

**District Financial Exclusion & Poverty Mismatch Tool**

*Built for the NISR 2026 Big Data Hackathon — Track 2: Financial Inclusion & Poverty Reduction.*

---

## 1. What this project does

FIN-GAP RWANDA is an interactive dashboard that helps policymakers, civil society and development
partners find **where financial inclusion is failing relative to poverty levels**.

Cross-analysing district poverty rates against financial-access data, it computes a **Mismatch Gap**:
the difference between a district's *actual* rate of full financial exclusion and the rate we would
*expect* given its poverty level.

- **Large positive gap → "Severely Underserved".** Exclusion is worse than poverty alone explains,
  pointing to structural barriers (distance to agents, network coverage, financial literacy).
- **Gap near zero → "Balanced".** Exclusion tracks poverty as expected.
- **Negative gap → "Well-Served".** Exclusion is *lower* than poverty predicts, suggesting effective
  interventions or unusual local economic drivers.

This turns national survey data into a **district-level prioritisation tool** that answers the
question policymakers actually ask: *where should the next financial-inclusion intervention be
targeted, and what kind?*

### Alignment with national priorities

| NST2 (2024–2029) pillar | How FIN-GAP RWANDA contributes |
|---|---|
| Economic Transformation — *"Resilient and broadened financial sector for private sector growth"* | Identifies districts where the financial sector is structurally under-serving the population |
| Social Transformation — *"Enhanced graduation from poverty and increased resilience"* | Links exclusion hotspots to concrete interventions owned by named institutions (BNR, MINICT, MINECOFIN, MINAGRI) |

The tool supports the **Vision 2050** ambition of universal access to financial services.

---

## 2. Data used

> ### ⚠️ Prototype data notice — please read
> The dataset bundled in this repository (`database/seed.sql`) is an **illustrative, synthetic
> dataset**. It was constructed by the team to reproduce the *column structure and approximate
> ranges* of the real sources below so that the prototype can run without restricted microdata.
>
> **It is not official NISR or AFR statistics.** The methodology is sound and fully reproducible,
> but the specific district figures must be replaced with the real microdata before any policy or
> publication use. See §3 for how to load the real data.

### Intended real sources

| Source | Publisher | What it provides | Access |
|---|---|---|---|
| **EICV7 (2023/24)** — Integrated Household Living Conditions Survey | National Institute of Statistics of Rwanda (NISR) | Poverty rates, extreme poverty, household consumption, demographic structure per district | [NISR Microdata Portal](https://microdata.statistics.gov.rw/index.php/catalog) — free account + access request |
| **FinScope Rwanda 2024** | Access to Finance Rwanda (AFR), with MINECOFIN, BNR and NISR | Financial access strands: banked, other formal, informal only, excluded | [FinScope 2024 report (PDF)](https://www.minecofin.gov.rw/fileadmin/user_upload/Minecofin/Publications/REPORTS/Finance_Sector_Development/Rwanda-Finscope-2024-Report_.pdf) · [afr.rw](https://www.afr.rw) |

**Recommended citation for FinScope:** *Access to Finance Rwanda, FinScope 2024 report, June 2024.*

**Data files in this repository:**

- `database/schema.sql` — PostgreSQL schema (provinces, districts, demographics, exclusion drivers, policy recommendations).
- `database/seed.sql` — the illustrative dataset currently loaded (30 districts). **Load the real
  data here to switch the app to official figures.**

Reference points from the real FinScope 2024 report that informed the design: 96% of Rwandan adults
were financially included and 4% excluded nationally, with 12 districts above the national exclusion
level and the Northern and Western provinces recording higher-than-average exclusion.

---

## 3. Running it locally (works on any machine)

**Prerequisites:** PHP 8+ with `pdo_pgsql`, Node.js 18+, and a PostgreSQL 13+ database.

### 3.1 Database

```bash
createdb fingap_rwanda
psql -d fingap_rwanda -f database/schema.sql
psql -d fingap_rwanda -f database/seed.sql
```

### 3.2 Backend API (PHP)

```bash
cd backend
# Point the app at your database (any of these work)
export DATABASE_URL="postgresql://user:password@host:5432/fingap_rwanda"
# ...or use DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD

php -S localhost:8000 router.php
```

Verify it is alive: <http://localhost:8000/api/national-summary>

### 3.3 Frontend (React)

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

The dashboard opens at <http://localhost:3000>.

### 3.4 API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/districts` | All districts with metrics. Supports `?province=`, `?status=`, `?sort=`, `?order=` |
| `GET` | `/api/districts/{id}` | Full district detail: demographics, exclusion drivers, policy recommendations |
| `GET` | `/api/national-summary` | National KPI banner figures |
| `GET` | `/api/model` | Live-fitted regression coefficients and R² powering the Mismatch Gap and simulator |
| `POST` | `/api/simulate` | Policy scenario simulation (JSON body) |

CORS is handled centrally in `backend/cors.php` and allows the deployed frontend origin.

---

## 4. How to use the dashboard

The deployed app is at **<https://fingap-rw.vercel.app>** — no login required.

| Tab | What to do |
|---|---|
| **Heatmap** | Each bubble is a district, coloured by Mismatch Gap (red = severely underserved). Click any bubble to open the inspector and read that district's exclusion drivers and tailored policy recommendations. |
| **Matrix** | Scatter plot of poverty vs. exclusion. Districts in the upper-left quadrant are the priority targets. Click any point to inspect it. |
| **Simulator** | Choose a district, then drag the three intervention sliders (phone penetration, agent density, financial literacy) and press **Run Simulation**. The projection shows the modelled change in exclusion rate, risk score and the estimated number of newly-included adults. |
| **Policy Brief** | Auto-generated, district-specific recommendations assigned to the responsible institution (BNR, MINICT, MINECOFIN, MINAGRI). |
| **Methodology** | Full explanation of the data sources, the Mismatch Gap definition, and the **live-fitted regression** (equation, coefficients and R²) behind every number in the app. |

### The modelling approach in one line each

- **Mismatch Gap** — OLS regression of exclusion on poverty; the residual is the gap.
- **Simulator** — a second OLS regression of exclusion on mobile money penetration, formal banking
  access and low-education share; the fitted coefficients *are* the intervention sensitivities.
- Both regressions are computed **from the live database at request time** (`backend/model.php`) and
  exposed via `/api/model`, so the app displays real fitted numbers rather than hard-coded
  assumptions. No external ML libraries are required.

---

## 5. Repository structure

```
├── backend/            PHP REST API
│   ├── api/            Endpoints (districts, national-summary, simulate, model)
│   ├── config/         Database connection (PDO)
│   ├── cors.php        Central CORS policy
│   ├── model.php       OLS regression utilities + model builder
│   ├── index.php       Route dispatcher
│   └── Dockerfile      Deployment image
├── frontend/           React dashboard
│   └── src/
│       ├── components/ Map, matrix, simulator, policy brief, methodology
│       └── services/   API client
├── database/           schema.sql + seed.sql  (data)
└── docs/               NISR hackathon webinar decks
```

---

## 6. Submission checklist (per NISR requirements)

| Requirement | Status |
|---|---|
| Public GitHub repository | ✅ this repo |
| README explaining data, information and interaction | ✅ this file |
| Full source code | ✅ `backend/` + `frontend/` |
| Deployed, publicly accessible app | ✅ <https://fingap-rw.vercel.app> |
| Video demonstration (`.webm`/`.gif`, ≤ 3 min) | ⏳ to be added |
| Data file + link to the data | ✅ `database/` + links in §2 |
| Student cards / eligibility documents (both members) | ⏳ to be added |
| Sample login credentials (only if login required) | N/A — no login required |

---

## 7. Disclosure & attribution

**AI tool disclosure.** In line with the competition rules, the team discloses that AI coding
assistants were used during development for code scaffolding, debugging and documentation drafting.
All analytical decisions, the problem framing, the data model and the final submission remain the
team's own original work, and the team takes full responsibility for it.

**Originality.** This submission is the team's own original work. It has not been submitted to any
other competition or entity. All external data sources and references are acknowledged in §2.

**Intellectual property.** By entering the competition, the team agrees to assign and transfer all
intellectual property rights in the submitted work to the National Institute of Statistics of Rwanda
(NISR), as set out in the competition requirements.

---

## 8. Tech stack

- **Frontend:** React 18, Chart.js (Mismatch Matrix), Leaflet + OpenStreetMap (interactive map)
- **Backend:** PHP 8 (custom REST API; OLS regression implemented from scratch, no ML dependencies)
- **Database:** PostgreSQL
- **Deployment:** Vercel (frontend), Render (backend + database)
