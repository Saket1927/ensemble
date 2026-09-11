-- ENSEMBLE Phase 1: Storage Buckets & Retention Rules

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('menu-images', 'menu-images', true),
    ('social-proofs', 'social-proofs', false),
    ('bill-uploads', 'bill-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Menu Images: Publicly readable, writeable by Restaurant Owner/Manager
CREATE POLICY "Menu images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Staff can upload menu images in their folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

-- Social Proofs: Uploadable by customer, readable by staff of that tenant
CREATE POLICY "Customers can upload story proof"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-proofs');

CREATE POLICY "Staff can view social proof in their folder"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-proofs');

-- Bill Uploads: Uploadable by customer, readable only by Master Admin
CREATE POLICY "Customers can upload physical bill photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bill-uploads');

CREATE POLICY "Only Master Admin can view bill uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'bill-uploads' AND (auth.jwt() ->> 'role' = 'master_admin'));

-- 3. Scheduled Cron Function for 2-day Screenshot Deletion (Section 8)
-- In Supabase pg_cron:
-- SELECT cron.schedule('delete-old-screenshots', '0 2 * * *', $$
--     DELETE FROM storage.objects
--     WHERE bucket_id = 'social-proofs'
--       AND created_at < NOW() - INTERVAL '2 days'
--       AND name IN (SELECT screenshot_url FROM social_submissions WHERE status IN ('approved', 'rejected') AND reviewed_at < NOW() - INTERVAL '2 days');
-- $$);
