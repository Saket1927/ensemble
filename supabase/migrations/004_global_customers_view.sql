-- ENSEMBLE Phase 1: Global Customer Identity View for Master Admin
-- Aggregates cross-restaurant customer behavior (restricted strictly to Master Admin)

CREATE OR REPLACE VIEW master_global_customers AS
SELECT
    m.phone AS customer_phone,
    MAX(m.name) AS customer_name,
    COUNT(DISTINCT s.restaurant_id) AS total_restaurants_frequented,
    ARRAY_AGG(DISTINCT r.name) AS restaurant_names,
    COUNT(DISTINCT s.id) AS total_lifetime_visits,
    COALESCE(SUM(t.total_amount), 0) AS total_lifetime_spend,
    ROUND(COALESCE(AVG(t.total_amount), 0), 2) AS average_spend_per_visit,
    COUNT(DISTINCT rev.id) AS total_reviews_written,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'redeemed') AS total_rewards_redeemed,
    MAX(s.created_at) AS last_seen_at
FROM session_members m
JOIN table_sessions s ON m.session_id = s.id
JOIN restaurants r ON s.restaurant_id = r.id
LEFT JOIN open_tabs t ON t.session_id = s.id AND t.status = 'paid'
LEFT JOIN reviews rev ON rev.customer_phone = m.phone
LEFT JOIN customer_coupons c ON c.customer_phone = m.phone
GROUP BY m.phone;

-- Security barrier: Grant SELECT on this view only to master_admin / service_role
REVOKE ALL ON master_global_customers FROM anon, authenticated;
GRANT SELECT ON master_global_customers TO postgres, service_role;
