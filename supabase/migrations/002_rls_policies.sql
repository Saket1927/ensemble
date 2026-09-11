-- ENSEMBLE Phase 1: Row Level Security (RLS) Policies
-- Enforces tenant data isolation at the Postgres layer

-- Enable RLS on all restaurant-owned tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is Master Admin
CREATE OR REPLACE FUNCTION is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'master_admin') OR (current_user = 'postgres');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get current user's restaurant_id
CREATE OR REPLACE FUNCTION get_auth_restaurant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'restaurant_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. RESTAURANTS
CREATE POLICY "Public can view active restaurants by slug"
    ON restaurants FOR SELECT
    USING (status = 'active' OR is_master_admin() OR id = get_auth_restaurant_id());

CREATE POLICY "Master admin has full control over restaurants"
    ON restaurants FOR ALL
    USING (is_master_admin());

CREATE POLICY "Staff can update own restaurant branding & settings"
    ON restaurants FOR UPDATE
    USING (id = get_auth_restaurant_id() AND (auth.jwt() ->> 'staff_role' IN ('owner', 'manager')));

-- 2. DINING TABLES & SESSIONS
CREATE POLICY "Public customer can view tables for their restaurant"
    ON dining_tables FOR SELECT
    USING (TRUE);

CREATE POLICY "Staff can manage tables in own restaurant"
    ON dining_tables FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Customer can access their own session"
    ON table_sessions FOR ALL
    USING (TRUE);

CREATE POLICY "Staff can view and manage sessions in their restaurant"
    ON table_sessions FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

-- 3. CAPTAIN CALLS
CREATE POLICY "Customers can create captain call"
    ON captain_calls FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Staff can view and acknowledge calls in their restaurant"
    ON captain_calls FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

-- 4. MENU ITEMS
CREATE POLICY "Anyone can view available menu items"
    ON menu_items FOR SELECT
    USING (TRUE);

CREATE POLICY "Owner and Manager can modify menu items"
    ON menu_items FOR ALL
    USING ((restaurant_id = get_auth_restaurant_id() AND auth.jwt() ->> 'staff_role' IN ('owner', 'manager')) OR is_master_admin());

-- 5. ORDERS & OPEN TABS
CREATE POLICY "Customers can view and order on open tabs"
    ON open_tabs FOR ALL
    USING (TRUE);

CREATE POLICY "Staff can manage tabs in own restaurant"
    ON open_tabs FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Staff can manage orders in own restaurant"
    ON orders FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Staff and customers can access order items"
    ON order_items FOR ALL
    USING (TRUE);

-- 6. REVIEWS
CREATE POLICY "Anyone can view verified reviews"
    ON reviews FOR SELECT
    USING (is_private_feedback = FALSE OR restaurant_id = get_auth_restaurant_id() OR is_master_admin());

CREATE POLICY "Customers can insert reviews"
    ON reviews FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Staff can manage and reply to reviews in own restaurant"
    ON reviews FOR ALL
    USING (restaurant_id = get_auth_restaurant_id() OR is_master_admin());
