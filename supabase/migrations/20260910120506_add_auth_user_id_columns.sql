/*
# Add user_id columns and update RLS for authenticated users

## Overview
This migration converts user-specific tables from anonymous session_id-based access
to authenticated user_id-based access. Public reference data tables (universities,
extracurriculars, scholarships, research_opportunities, sat_resources) remain readable
by anon + authenticated. User-specific tables (roadmaps, roadmap_tasks, user_progress,
notifications, application_simulations) get a user_id column with DEFAULT auth.uid()
and owner-scoped RLS policies.

## Changes
1. Add `user_id uuid` columns to: roadmaps, roadmap_tasks, user_progress, notifications, application_simulations
2. All user_id columns default to auth.uid()
3. Drop old anon-read/write policies on user-specific tables
4. Create authenticated-only owner-scoped CRUD policies (4 per table)
5. Public tables keep existing anon + authenticated read policies

## Security
- User-specific tables: TO authenticated with auth.uid() = user_id ownership checks
- Public reference tables: unchanged (anon + authenticated read)
*/
DO $$ BEGIN
  ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS user_id uuid;
END $$;

DO $$ BEGIN
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS user_id uuid;
END $$;

DO $$ BEGIN
  ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id uuid;
END $$;

DO $$ BEGIN
  ALTER TABLE application_simulations ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE application_simulations ADD COLUMN IF NOT EXISTS user_id uuid;
END $$;

-- roadmap_tasks: no direct user_id, scoped through parent roadmaps
-- We add user_id for simpler queries
DO $$ BEGIN
  ALTER TABLE roadmap_tasks ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE roadmap_tasks ADD COLUMN IF NOT EXISTS user_id uuid;
END $$;

-- ====== ROADMAPS: drop old, create new ======
DROP POLICY IF EXISTS "anon_all_roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "anon_insert_roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "anon_update_roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "anon_delete_roadmaps" ON roadmaps;

CREATE POLICY "select_own_roadmaps" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_roadmaps" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_roadmaps" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_roadmaps" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ====== ROADMAP_TASKS ======
DROP POLICY IF EXISTS "anon_all_roadmap_tasks" ON roadmap_tasks;
DROP POLICY IF EXISTS "anon_insert_roadmap_tasks" ON roadmap_tasks;
DROP POLICY IF EXISTS "anon_update_roadmap_tasks" ON roadmap_tasks;
DROP POLICY IF EXISTS "anon_delete_roadmap_tasks" ON roadmap_tasks;

CREATE POLICY "select_own_roadmap_tasks" ON roadmap_tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_roadmap_tasks" ON roadmap_tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_roadmap_tasks" ON roadmap_tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_roadmap_tasks" ON roadmap_tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ====== USER_PROGRESS ======
DROP POLICY IF EXISTS "anon_all_progress" ON user_progress;
DROP POLICY IF EXISTS "anon_insert_progress" ON user_progress;
DROP POLICY IF EXISTS "anon_update_progress" ON user_progress;
DROP POLICY IF EXISTS "anon_delete_progress" ON user_progress;

CREATE POLICY "select_own_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ====== NOTIFICATIONS ======
DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;

CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ====== APPLICATION_SIMULATIONS ======
DROP POLICY IF EXISTS "anon_all_simulations" ON application_simulations;
DROP POLICY IF EXISTS "anon_insert_simulations" ON application_simulations;
DROP POLICY IF EXISTS "anon_update_simulations" ON application_simulations;
DROP POLICY IF EXISTS "anon_delete_simulations" ON application_simulations;

CREATE POLICY "select_own_simulations" ON application_simulations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_simulations" ON application_simulations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_simulations" ON application_simulations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_simulations" ON application_simulations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for user_id queries
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_user ON roadmap_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sim_user ON application_simulations(user_id);
