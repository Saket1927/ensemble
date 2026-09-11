-- ENSEMBLE Phase 1: Centralized Offers & Unified 2-Coupon Engine

-- 1. CENTRALIZED OFFERS (Single source of truth)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    offer_type VARCHAR(64) DEFAULT 'discount' CHECK (offer_type IN ('discount', 'spin_reward', 'deal_of_the_day', 'deal_of_the_week', 'campaign')),
    discount_type VARCHAR(32) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_item', 'no_luck')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_bill NUMERIC(10, 2) DEFAULT 0.00,
    probability NUMERIC(5, 2) DEFAULT 20.00, -- For Spin & Win wheels
    applicable_days TEXT[] DEFAULT ARRAY['All Days'],
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    usage_limit INTEGER DEFAULT 500,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (restaurant_id, code)
);

-- 2. CUSTOMER HELD COUPONS (Unified 2-Coupon Engine)
CREATE TABLE IF NOT EXISTS customer_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(32) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    voucher_code VARCHAR(64) NOT NULL,
    reward_label VARCHAR(255) NOT NULL,
    discount_type VARCHAR(32) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    
    -- Slot: 'active' (usable now) vs 'queued' (next visit)
    slot VARCHAR(32) NOT NULL CHECK (slot IN ('active', 'queued', 'pending_approval')),
    source VARCHAR(32) NOT NULL CHECK (source IN ('spin_win', 'review', 'instagram', 'bill_upload', 'referral', 'manual')),
    
    status VARCHAR(32) DEFAULT 'held' CHECK (status IN ('held', 'redeemed', 'expired', 'deleted')),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- 20-day clock calculated fresh upon activation
    redeemed_at TIMESTAMPTZ,
    redeemed_tab_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOCIAL SUBMISSIONS (Instagram proof queue with mandatory screenshot)
CREATE TABLE IF NOT EXISTS social_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    platform VARCHAR(32) DEFAULT 'Instagram' CHECK (platform IN ('Instagram', 'Facebook', 'WhatsApp', 'TikTok')),
    screenshot_url TEXT NOT NULL, -- Mandatory screenshot
    instagram_handle VARCHAR(128), -- Optional handle
    hashtags TEXT,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES restaurant_staff(id),
    reviewed_at TIMESTAMPTZ,
    auto_delete_at TIMESTAMPTZ, -- Scheduled 2 days after review
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER BILL UPLOADS (Independent audit queue - Never visible to restaurant)
CREATE TABLE IF NOT EXISTS master_bill_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    bill_photo_url TEXT NOT NULL,
    reported_app_total NUMERIC(10, 2),
    audited_status VARCHAR(32) DEFAULT 'pending' CHECK (audited_status IN ('pending', 'verified', 'discrepancy_flagged')),
    bonus_scratch_won JSONB, -- Instant reward won on upload
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- RLS for coupons & offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_bill_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active offers for their restaurant"
    ON offers FOR SELECT
    USING (is_active = TRUE OR restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Staff can manage offers"
    ON offers FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Customer can access their own coupons by phone"
    ON customer_coupons FOR ALL
    USING (TRUE);

CREATE POLICY "Staff can view coupons in their restaurant"
    ON customer_coupons FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Customer can submit social proofs"
    ON social_submissions FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Staff can review social submissions in own restaurant"
    ON social_submissions FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

-- MASTER ADMIN ONLY for bill uploads
CREATE POLICY "Customers can insert bill upload"
    ON master_bill_uploads FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Only Master Admin can view bill audits"
    ON master_bill_uploads FOR ALL
    USING (is_master_admin());
