-- ============================================================
-- FIN-GAP RWANDA: PostgreSQL Database Schema
-- Project: District Financial Exclusion & Poverty Mismatch Tool
-- NISR 2026 Big Data Hackathon — Track 2
-- Data Sources: EICV7 (2023-2024) + FinScope Rwanda 2024
-- ============================================================

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS policy_recommendations;
DROP TABLE IF EXISTS district_demographics;
DROP TABLE IF EXISTS exclusion_drivers;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS provinces;

-- ============================================================
-- TABLE 1: provinces
-- ============================================================
CREATE TABLE provinces (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    region      VARCHAR(50)  NOT NULL  -- e.g., 'Central', 'South', 'West', 'North', 'East'
);

-- ============================================================
-- TABLE 2: districts
-- Core financial inclusion + poverty metrics per district
-- Source: EICV7 (poverty) + FinScope 2024 (financial access)
-- ============================================================
CREATE TABLE districts (
    id                          SERIAL PRIMARY KEY,
    province_id                 INTEGER NOT NULL REFERENCES provinces(id),
    name                        VARCHAR(100) NOT NULL UNIQUE,
    code                        VARCHAR(10)  NOT NULL UNIQUE,  -- e.g., 'RW-01'

    -- EICV7 Poverty Indicators
    poverty_rate                NUMERIC(5,2) NOT NULL,           -- % households below poverty line
    extreme_poverty_rate        NUMERIC(5,2) NOT NULL,           -- % households below extreme poverty line
    mean_monthly_consumption    NUMERIC(10,2) NOT NULL,          -- Mean monthly household consumption (RWF)

    -- FinScope 2024 Financial Access Indicators
    banked_rate                 NUMERIC(5,2) NOT NULL,           -- % with formal bank account
    mobile_money_rate           NUMERIC(5,2) NOT NULL,           -- % using mobile money (MTN/Airtel)
    informal_only_rate          NUMERIC(5,2) NOT NULL,           -- % using only informal savings (ikimina/tontine)
    fully_excluded_rate         NUMERIC(5,2) NOT NULL,           -- % with no financial service at all
    financial_access_rate       NUMERIC(5,2) NOT NULL,           -- % with any financial service

    -- Computed Analytics (calculated by PHP backend)
    exclusion_risk_score        NUMERIC(5,2) NOT NULL,           -- 0-100 risk score (higher = worse)
    mismatch_gap                NUMERIC(6,2) NOT NULL,           -- Actual exclusion - Expected exclusion
    mismatch_status             VARCHAR(30)  NOT NULL,           -- 'Severely Underserved' | 'Moderately Underserved' | 'Balanced' | 'Well-Served'

    created_at                  TIMESTAMP DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: district_demographics
-- Demographic breakdown of financial exclusion per district
-- Source: EICV7 + FinScope cross-tabulations
-- ============================================================
CREATE TABLE district_demographics (
    id                      SERIAL PRIMARY KEY,
    district_id             INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,

    -- Gender Gap in Exclusion
    female_exclusion_rate   NUMERIC(5,2) NOT NULL,   -- % of adult women fully excluded
    male_exclusion_rate     NUMERIC(5,2) NOT NULL,   -- % of adult men fully excluded

    -- Urban / Rural Split
    urban_ratio             NUMERIC(5,2) NOT NULL,   -- % of district population in urban areas

    -- Employment Structure
    informal_employment     NUMERIC(5,2) NOT NULL,   -- % of workers in informal sector

    -- Education Level
    primary_edu_or_less     NUMERIC(5,2) NOT NULL    -- % of adults with primary education or below
);

-- ============================================================
-- TABLE 4: exclusion_drivers
-- Key structural reasons for exclusion in each district
-- Source: EICV7 + FinScope qualitative and derived variables
-- ============================================================
CREATE TABLE exclusion_drivers (
    id              SERIAL PRIMARY KEY,
    district_id     INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    driver          TEXT NOT NULL,          -- Description of exclusion driver
    display_order   INTEGER DEFAULT 1       -- Order to display (1 = most important)
);

-- ============================================================
-- TABLE 5: policy_recommendations
-- Targeted policy actions per district
-- Linked to NST2 priorities and BNR/MINECOFIN mandates
-- ============================================================
CREATE TABLE policy_recommendations (
    id              SERIAL PRIMARY KEY,
    district_id     INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    target_body     VARCHAR(100) NOT NULL,  -- e.g., 'BNR', 'MINECOFIN', 'MINICT', 'MFIs'
    recommendation  TEXT NOT NULL,
    display_order   INTEGER DEFAULT 1
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_districts_province     ON districts(province_id);
CREATE INDEX idx_districts_status       ON districts(mismatch_status);
CREATE INDEX idx_districts_gap          ON districts(mismatch_gap DESC);
CREATE INDEX idx_demographics_district  ON district_demographics(district_id);
CREATE INDEX idx_drivers_district       ON exclusion_drivers(district_id);
CREATE INDEX idx_policy_district        ON policy_recommendations(district_id);
