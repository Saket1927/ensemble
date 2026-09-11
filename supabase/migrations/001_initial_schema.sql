-- ENSEMBLE Phase 1: Database Schema
-- Multi-tenant schema with restaurant_id tenant isolation

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TENANTS / RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_title VARCHAR(255),
    tagline TEXT,
    description TEXT,
    cuisine VARCHAR(128),
    address TEXT,
    city VARCHAR(128),
    latitude NUMERIC(10, 7) DEFAULT 19.2183,
    longitude NUMERIC(10, 7) DEFAULT 72.9781,
    geofence_radius_meters INTEGER DEFAULT 150,
    phone VARCHAR(32),
    email VARCHAR(128),
    website VARCHAR(255),
    google_review_url TEXT,
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    plan VARCHAR(64) DEFAULT 'Growth' CHECK (plan IN ('Starter', 'Growth', 'Enterprise')),
    plan_features JSONB DEFAULT '{"captain_module": true, "ordering": true, "social_rewards": true, "spin_rewards": true, "bill_upload": true, "custom_branding": true}'::jsonb,
    charges_config JSONB DEFAULT '{"gst_percent": 5, "service_charge_percent": 5, "packaging_fee": 0}'::jsonb,
    branding JSONB DEFAULT '{}'::jsonb,
    socials JSONB DEFAULT '{}'::jsonb,
    hashtags TEXT[] DEFAULT ARRAY['#EnsembleDining'],
    tables_count INTEGER DEFAULT 30,
    opening_time TIME DEFAULT '11:00:00',
    closing_time TIME DEFAULT '23:30:00',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESTAURANT STAFF (3-Tier RBAC: Owner, Manager, Captain)
CREATE TABLE IF NOT EXISTS restaurant_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    auth_user_id UUID, -- References auth.users in Supabase
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('owner', 'manager', 'captain')),
    assigned_tables INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLES & STATUS
CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    status VARCHAR(32) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'bill_requested', 'paid_pending_reset', 'cleaning')),
    assigned_captain_id UUID REFERENCES restaurant_staff(id),
    total_scans INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, table_number)
);

-- 5. MULTI-PERSON TABLE SESSIONS
CREATE TABLE IF NOT EXISTS table_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    host_name VARCHAR(128) NOT NULL,
    host_phone VARCHAR(32) NOT NULL,
    geofence_verified BOOLEAN DEFAULT FALSE,
    geofence_overridden_by UUID REFERENCES restaurant_staff(id),
    status VARCHAR(32) DEFAULT 'active' CHECK (status IN ('active', 'bill_requested', 'closed', 'discarded')),
    payment_method VARCHAR(32) CHECK (payment_method IN ('cash', 'online', NULL)),
    closed_by UUID REFERENCES restaurant_staff(id),
    closed_at TIMESTAMPTZ,
    reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SESSION MEMBERS (Joiners)
CREATE TABLE IF NOT EXISTS session_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    is_host BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CALL CAPTAIN QUEUE
CREATE TABLE IF NOT EXISTS captain_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    assigned_captain_id UUID REFERENCES restaurant_staff(id),
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT TRUE,
    is_chef_special BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDERS & OPEN TABS
CREATE TABLE IF NOT EXISTS open_tabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    subtotal NUMERIC(10, 2) DEFAULT 0.00,
    gst_amount NUMERIC(10, 2) DEFAULT 0.00,
    service_charge_amount NUMERIC(10, 2) DEFAULT 0.00,
    packaging_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    applied_coupon_id UUID,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'open' CHECK (status IN ('open', 'payment_pending', 'paid', 'void')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tab_id UUID NOT NULL REFERENCES open_tabs(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    ordered_by_phone VARCHAR(32) NOT NULL,
    ordered_by_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'delivered', 'cancelled')),
    estimated_prep_minutes INTEGER DEFAULT 20 CHECK (estimated_prep_minutes IN (10, 20, 30)),
    prep_timer_started_at TIMESTAMPTZ,
    prep_timer_expires_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    removed_by_captain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REVIEWS (With 4-5 star Google route & 1-3 star private feedback)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    dish_feedback JSONB DEFAULT '[]'::jsonb,
    photo_url TEXT,
    routed_to_google BOOLEAN DEFAULT FALSE,
    is_private_feedback BOOLEAN DEFAULT FALSE,
    reply TEXT,
    table_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
