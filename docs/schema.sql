-- ============================================================================
-- SafePark Production Database Schema (PostgreSQL / Supabase)
-- Real-time Parking Intelligence, B2B Certification & Anti-Bias DB Triggers
-- ============================================================================

-- Enable PostGIS for Spatial Coordinates & Geofencing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users & Driver Accounts
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'driver' CHECK (role IN ('driver', 'operator', 'enterprise_admin')),
    auth_provider VARCHAR(50) DEFAULT 'email' CHECK (auth_provider IN ('email', 'apple', 'google')),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium_monthly', 'premium_annual')),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parking Facilities & Infrastructure Baseline
CREATE TABLE IF NOT EXISTS parking_facilities (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    hourly_rate NUMERIC(6, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT '$',
    total_spaces INTEGER NOT NULL,
    available_spaces INTEGER NOT NULL,
    structure_type VARCHAR(100) NOT NULL CHECK (
        structure_type IN ('covered_underground_garage', 'multi_level_deck', 'gated_surface_lot', 'open_surface_lot', 'curbside_street_metered', 'curbside_residential')
    ),
    surveillance_tier VARCHAR(100) DEFAULT 'none' CHECK (
        surveillance_tier IN ('monitored_cctv_24_7', 'unmonitored_recording_cctv', 'commercial_storefront_camera_overlap', 'none')
    ),
    has_barrier_gate BOOLEAN DEFAULT FALSE,
    has_active_patrol BOOLEAN DEFAULT FALSE,
    has_emergency_callboxes BOOLEAN DEFAULT FALSE,
    pedestrian_traffic_rating VARCHAR(50) DEFAULT 'medium',
    clear_sightlines BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SafePark Certified™ B2B Operator Enrollments
CREATE TABLE IF NOT EXISTS certified_garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(100) REFERENCES parking_facilities(id) ON DELETE CASCADE,
    operator_name VARCHAR(255) NOT NULL,
    certification_tier VARCHAR(50) NOT NULL CHECK (certification_tier IN ('platinum', 'gold', 'silver', 'unverified')),
    audit_score INTEGER NOT NULL CHECK (audit_score BETWEEN 0 AND 100),
    csi_baseline_boost INTEGER DEFAULT 0,
    stripe_subscription_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Active & Historical Driver Parking Sessions
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility_id VARCHAR(100) REFERENCES parking_facilities(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    csi_at_parking INTEGER NOT NULL,
    cabin_check_confirmed BOOLEAN DEFAULT FALSE,
    bluetooth_device_name VARCHAR(255),
    total_paid NUMERIC(8, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Anti-Bias Physical Hazard Community Submissions
CREATE TABLE IF NOT EXISTS hazard_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id VARCHAR(100) REFERENCES parking_facilities(id) ON DELETE CASCADE,
    hazard_type VARCHAR(100) NOT NULL CHECK (
        hazard_type IN (
            'broken_glass_pavement',
            'failed_street_lamp',
            'broken_security_gate',
            'camera_tampered_or_down',
            'obstructed_sightline_alcove',
            'pavement_debris_puncture_risk'
        )
    ),
    notes TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    photo_evidence_verified BOOLEAN DEFAULT FALSE,
    witness_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enterprise API Licensing Keys
CREATE TABLE IF NOT EXISTS enterprise_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(100) DEFAULT 'Enterprise OEM' CHECK (tier IN ('Enterprise OEM', 'Mobility Insurer', 'Fleet Telematics')),
    rate_limit_per_min INTEGER DEFAULT 10000,
    requests_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Server-Side Anti-Bias Database Trigger Function
-- Blocks subjective descriptions before database insertion
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_hazard_anti_bias()
RETURNS TRIGGER AS $$
DECLARE
    subjective_term TEXT;
    subjective_blacklist TEXT[] := ARRAY[
        'sketchy', 'suspicious', 'shady', 'ghetto', 'hood',
        'weird vibe', 'bad vibe', 'creepy', 'unsafe people',
        'dangerous people', 'loitering', 'bums', 'thugs', 'weirdos'
    ];
BEGIN
    IF NEW.notes IS NOT NULL THEN
        FOREACH subjective_term IN ARRAY subjective_blacklist LOOP
            IF POSITION(subjective_term in LOWER(NEW.notes)) > 0 THEN
                RAISE EXCEPTION 'AntiBiasViolation: Subjective descriptor "%" is prohibited under SafePark Civil Rights Safeguards.', subjective_term;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_anti_bias_before_insert
BEFORE INSERT OR UPDATE ON hazard_reports
FOR EACH ROW
EXECUTE FUNCTION validate_hazard_anti_bias();
