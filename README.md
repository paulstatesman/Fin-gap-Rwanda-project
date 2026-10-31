# 🇷🇼 FIN-GAP RWANDA

**District Financial Exclusion & Poverty Mismatch Tool**

*Built for the NISR 2026 Big Data Hackathon — Track 2: Financial Inclusion & Poverty Reduction.*

---

## 1. What this project does

FIN-GAP RWANDA is an interactive dashboard that helps policymakers, civil society, and development
partners find **where financial inclusion is failing relative to poverty levels**.

Cross-analysing district poverty rates against financial-access data, it computes a **Mismatch Gap**:
the difference between a district's *actual* rate of full financial exclusion and the rate we would
*expect* given its poverty level.

- **Large positive gap → "Severely Underserved".** Exclusion is worse than poverty alone explains,
  pointing to structural barriers (distance to agents, network coverage, gender gap, literacy).
- **Gap near zero → "Balanced".** Exclusion tracks poverty as expected.
- **Negative gap → "Well-Served".** Exclusion is *lower* than poverty predicts, suggesting effective
  interventions or unusual local economic drivers.

This turns national survey data into a **district-level prioritisation tool** that answers the
question policymakers actually ask: *where should the next financial-inclusion intervention be
targeted, and what kind?*

### Alignment with national priorities

| NST2 (2024–2029) Pillar | How FIN-GAP RWANDA Contributes |
|---|---|
| **Economic Transformation** — *"Resilient and broadened financial sector for private sector growth"* | Identifies districts where the financial sector is structurally under-serving the population. |
| **Social Transformation** — *"Enhanced graduation from poverty and increased resilience"* | Links exclusion hotspots to concrete interventions owned by named institutions (BNR, MINICT, MINECOFIN, MINAGRI). |

The tool directly supports Rwanda's **Vision 2050** ambition of universal financial access and digital inclusion.

---

## 2. Data used

> ### ⚠️ Prototype data notice — please read
> The dataset bundled in this repository (`database/seed.sql`) is an **illustrative, synthetic
> dataset**. It was constructed by the team to reproduce the *column structure and approximate
> ranges* of the real sources below so that the prototype can run without restricted microdata.
>
> **It is not official NISR or AFR statistics.** The methodology is sound and fully reproducible,
> but the specific district figures must be replaced with the real microdata before any official policy or
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
- `frontend/src/services/localDistricts.json` — bundled district data allowing the tool to run 100% offline and standalone.

Reference points from the real FinScope 2024 report that informed the design: 96% of Rwandan adults
were financially included and 4% excluded nationally, with 12 districts above the national exclusion
level and the Northern and Western provinces recording higher-than-average exclusion.

---

## 3. Running it locally (works on any machine)

**Prerequisites:** Node.js 18+ (for frontend) and optionally PHP 8+ with `pdo_pgsql` and PostgreSQL 13+ (for live backend).

### 3.1 Frontend (React)

The frontend runs with or without the backend running (offline fallback built in):

```bash
cd frontend
npm install
npm start
```

The dashboard opens at <http://localhost:3000>.

### 3.2 Backend API (Optional - PHP)

```bash
# Setup database
createdb fingap_rwanda
psql -d fingap_rwanda -f database/schema.sql
psql -d fingap_rwanda -f database/seed.sql

# Start PHP built-in server
cd backend
export DATABASE_URL="postgresql://user:password@host:5432/fingap_rwanda"
php -S localhost:8000 router.php
```

Verify backend status: <http://localhost:8000/api/national-summary>

### 3.3 API reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/districts` | All districts with metrics. Supports `?province=`, `?status=`, `?sort=`, `?order=` |
| `GET` | `/api/districts/{id}` | Full district detail: demographics, exclusion drivers, policy recommendations |
| `GET` | `/api/national-summary` | National KPI banner figures |
| `GET` | `/api/model` | Live-fitted regression coefficients and R² powering the Mismatch Gap and simulator |
| `POST` | `/api/simulate` | Policy scenario simulation (JSON body) |

---

## 4. How to use the dashboard

The deployed app is at **<https://fingap-rw.vercel.app>** — no login required.

| Tab | What to do |
|---|---|
| **Heatmap** | Multi-view geographic visualization (Vector Map, Heat Matrix Grid, and Satellite Map). Click any district to open the Inspector and read its demographic breakdown, core metrics, exclusion drivers, and targeted Advice. |
| **Matrix** | Scatter plot of poverty vs. exclusion. Districts in the upper-left quadrant are the priority targets (high exclusion despite lower poverty). Click any point to inspect it. |
| **Simulator** | Choose a district, adjust the three intervention sliders (Mobile Phone Penetration, Agent Network Density, Financial Literacy Coverage), and click **Run Simulation**. Instantly projects the reduction in exclusion rate, risk score, and newly banked citizens. |
| **Policy Brief** | Contains national NST2 alignment tables, plus an interactive **Report Generator**: select any district to dynamically generate an executive policy brief for local government leaders, with instant **Print/Download as PDF** capability. |
| **Methodology** | Full explanation of data sources, the mathematical Mismatch Gap definition, and the **live regression** (formula, fitted coefficients, and R²) powering the tool. |

### The modelling approach in one line each

- **Mismatch Gap** — OLS regression of exclusion on poverty; the residual is the gap.
- **Simulator** — regression sensitivity model weighted on mobile access, physical agent density, and education share; fitted coefficients act as intervention impact multipliers.
- Computed dynamically both at request time on the backend (`backend/model.php`) and in the client-side engine (`frontend/src/services/api.js`) for seamless offline resilience.

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
│   ├── src/
│   │   ├── components/ Heatmap, matrix, simulator, policy brief, methodology, inspector
│   │   └── services/   API client & local simulation engine
│   └── public/
├── database/           schema.sql + seed.sql (data)
├── docs/               NISR hackathon webinar decks
└── submission/         Final hackathon deliverables
    ├── demo-video.mp4           Demonstration video (Git LFS)
    ├── student-cards/           Student ID eligibility cards
    └── SUBMISSION_CHECKLIST.md  Detailed submission checklist
```

---

## 6. Submission checklist (per NISR requirements)

| Requirement | Status |
|---|---|
| Public GitHub repository | ✅ Completed (this repo) |
| README explaining data, information, and interaction | ✅ Completed (`README.md`) |
| Full source code | ✅ Completed (`backend/` + `frontend/`) |
| Deployed, publicly accessible app | ✅ Completed (<https://fingap-rw.vercel.app>) |
| Video demonstration (`.mp4`, ≤ 3 min) | ✅ Completed (`submission/demo-video.mp4`) |
| Data file + link to the data | ✅ Completed (`database/` + `localDistricts.json`) |
| Student cards / eligibility documents | ✅ Completed (`submission/student-cards/`) |
| Sample login credentials | N/A — no login required |

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

- **Frontend:** React 18, Chart.js (Mismatch Matrix), Leaflet + OpenStreetMap (interactive map), FontAwesome
- **Backend:** PHP 8 (custom REST API; OLS regression implemented from scratch, no external ML dependencies)
- **Database:** PostgreSQL
- **Deployment:** Vercel (frontend), Render (backend + database)
