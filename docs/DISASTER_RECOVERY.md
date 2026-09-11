# ENSEMBLE Disaster Recovery & Migration Runbook

## Overview
This runbook provides step-by-step instructions for emergency restoration of the ENSEMBLE SaaS platform, as well as migrating from Phase 1 (Supabase) to Phase 2 (Self-hosted Postgres + Local Storage + Custom WebSockets on a VPS).

---

## 1. Automated Backup Cadence
- **Development/Testing Cadence**: Weekly automated export (`BACKUP_CADENCE=weekly`).
- **Production Cadence**: Daily automated export (`BACKUP_CADENCE=daily`).
- **Retention Policy**: Retains the last 3 snapshot archives; older archives are pruned automatically.
- **Storage Lifecycle Compliance**:
  - Instagram screenshots in `social-proofs` older than 2 days post-moderation are excluded from archives (Section 8).
  - Bill upload photos in `bill-uploads` are archived at month-end and purged from active storage (Section 14a).

---

## 2. Emergency Restore Procedure (Phase 1 — New Supabase Project)

If the primary Supabase project suffers an outage or corruption:

1. **Provision New Environment**:
   - Create a new project in the Supabase Dashboard.
   - Note the new `PROJECT_URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY`.

2. **Restore Schema & Tenant Records**:
   ```bash
   psql "$NEW_DATABASE_URL" < backups/latest/schema_and_data.sql
   ```

3. **Verify Row-Level Security (RLS)**:
   - Run `supabase/migrations/002_rls_policies.sql` to confirm tenant isolation is active.

4. **Restore Storage Buckets**:
   - Re-create buckets `menu-images`, `social-proofs`, `bill-uploads`.
   - Sync archived files using the restore script:
     ```bash
     npx ts-node backup/restore-backup.ts
     ```

5. **Update App Configuration**:
   - Update `.env` with new credentials:
     ```env
     VITE_SUPABASE_URL=https://new-project.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     ```

6. **DNS & Subdomain Routing**:
   - Point DNS wildcard `*.ensemble.com` to the frontend host (e.g. Vercel).
   - Verify tenant routing: `heritage.ensemble.com`, `bambaihouse.ensemble.com`.

---

## 3. Phase 2 Migration Procedure (Self-Hosted VPS)

Because ENSEMBLE's data access layer is abstracted behind `IDatabaseProvider`, `IStorageProvider`, and `IRealtimeProvider`:

1. Deploy PostgreSQL 16 on the VPS.
2. Execute `psql "$VPS_POSTGRES_URL" < backups/latest/schema_and_data.sql`.
3. Set `STORAGE_PROVIDER=local` in the environment to save uploaded menu photos and receipts directly to the VPS disk.
4. Set `REALTIME_PROVIDER=ws` to connect to a self-hosted Node.js WebSocket service.
5. **No frontend or business logic rewrite is required** — only connection configs are changed.
