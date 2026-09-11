/*
# Admitiy Platform Schema

## Overview
Creates the full database schema for Admitiy, a college admissions platform.
This is a single-tenant app (no sign-in screen) — all data is shared/public.
Users interact via the anon key, so all policies use `TO anon, authenticated`.

## Tables Created
1. **universities** — Directory of universities with real admissions data, photos, and detailed info
2. **extracurriculars** — Verified extracurricular activities with impact data and categories
3. **scholarships** — Scholarship listings (only recent/new entries with deadlines)
4. **research_opportunities** — Research programs and positions with real proven data
5. **roadmaps** — Custom roadmaps users can create and track
6. **roadmap_tasks** — Individual tasks within a roadmap
7. **user_progress** — Gamification: XP, level, badges, streaks (stored per session ID)
8. **notifications** — Notification messages for the bell icon
9. **application_simulations** — Saved Common App-like application simulations
10. **sat_resources** — SAT prep resources and links

## Security
- RLS enabled on all tables
- All policies use `TO anon, authenticated` since this is a no-auth app
- Public data (universities, extracurriculars, scholarships, research, sat_resources) is read-only for anon
- User-specific data (roadmaps, roadmap_tasks, user_progress, notifications, application_simulations) allows full CRUD for anon
*/

-- ========================
-- UNIVERSITIES
-- ========================
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  location text NOT NULL,
  state text,
  country text DEFAULT 'USA',
  type text NOT NULL, -- 'public' or 'private'
  ranking integer,
  acceptance_rate numeric,
  sat_min integer,
  sat_max integer,
  act_min integer,
  act_max integer,
  tuition integer,
  enrollment integer,
  image_url text,
  website_url text NOT NULL,
  description text,
  campus_life text,
  notable_programs text[],
  admission_requirements text,
  application_deadline text,
  early_deadline text,
  financial_aid text,
  mascot text,
  founded integer,
  colors text,
  tags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_universities" ON universities;
CREATE POLICY "anon_read_universities" ON universities FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- EXTRACURRICULARS
-- ========================
CREATE TABLE IF NOT EXISTS extracurriculars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'Academic', 'Leadership', 'Community Service', 'Arts', 'Sports', 'STEM', 'Research', 'Work', 'Other'
  description text NOT NULL,
  impact text NOT NULL, -- what impact this activity demonstrates
  time_commitment text, -- e.g. "3-5 hrs/week"
  difficulty text DEFAULT 'Moderate', -- 'Easy', 'Moderate', 'Hard', 'Very Hard'
  prestige text DEFAULT 'Moderate', -- 'Low', 'Moderate', 'High', 'Very High'
  evidence text, -- real proven data about the activity
  examples text[], -- specific programs or examples
  skills_developed text[],
  college_value text, -- how colleges view this activity
  tags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE extracurriculars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_extracurriculars" ON extracurriculars;
CREATE POLICY "anon_read_extracurriculars" ON extracurriculars FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- SCHOLARSHIPS (recent/new only)
-- ========================
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  amount text NOT NULL,
  deadline text NOT NULL,
  eligibility text NOT NULL,
  description text NOT NULL,
  category text, -- 'Merit', 'Need-based', 'Minority', 'STEM', 'Arts', 'Athletic', 'Community', 'First-gen'
  level text, -- 'National', 'State', 'Local', 'University-specific'
  website_url text NOT NULL,
  requirements text[],
  is_new boolean DEFAULT true,
  posted_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_scholarships" ON scholarships;
CREATE POLICY "anon_read_scholarships" ON scholarships FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- RESEARCH OPPORTUNITIES
-- ========================
CREATE TABLE IF NOT EXISTS research_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text NOT NULL,
  field text NOT NULL, -- 'STEM', 'Humanities', 'Social Science', 'Biomedical', 'Computer Science', etc.
  description text NOT NULL,
  eligibility text NOT NULL,
  location text,
  duration text,
  is_paid boolean DEFAULT false,
  stipend text,
  is_remote boolean DEFAULT false,
  application_deadline text,
  website_url text NOT NULL,
  evidence text, -- proven data about outcomes, selectivity, etc.
  prestige text DEFAULT 'Moderate', -- 'Moderate', 'High', 'Very High'
  skills_gained text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_research" ON research_opportunities;
CREATE POLICY "anon_read_research" ON research_opportunities FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- ROADMAPS (user-created, tracked by session ID)
-- ========================
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text NOT NULL,
  description text,
  target_grade text,
  target_year text,
  focus_areas text[],
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_roadmaps" ON roadmaps;
CREATE POLICY "anon_all_roadmaps" ON roadmaps FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_roadmaps" ON roadmaps;
CREATE POLICY "anon_insert_roadmaps" ON roadmaps FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_roadmaps" ON roadmaps;
CREATE POLICY "anon_update_roadmaps" ON roadmaps FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_roadmaps" ON roadmaps;
CREATE POLICY "anon_delete_roadmaps" ON roadmaps FOR DELETE TO anon, authenticated USING (true);

-- ========================
-- ROADMAP TASKS
-- ========================
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text, -- 'Academic', 'Test Prep', 'Extracurricular', 'Application', 'Financial', 'Research'
  priority text DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  deadline text,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  xp_reward integer DEFAULT 10,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_roadmap_tasks" ON roadmap_tasks;
CREATE POLICY "anon_all_roadmap_tasks" ON roadmap_tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_roadmap_tasks" ON roadmap_tasks;
CREATE POLICY "anon_insert_roadmap_tasks" ON roadmap_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_roadmap_tasks" ON roadmap_tasks;
CREATE POLICY "anon_update_roadmap_tasks" ON roadmap_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_roadmap_tasks" ON roadmap_tasks;
CREATE POLICY "anon_delete_roadmap_tasks" ON roadmap_tasks FOR DELETE TO anon, authenticated USING (true);

-- ========================
-- USER PROGRESS (gamification, per session)
-- ========================
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak_days integer DEFAULT 0,
  last_active_date date,
  badges text[] DEFAULT '{}',
  completed_tasks integer DEFAULT 0,
  universities_explored integer DEFAULT 0,
  scholarships_saved integer DEFAULT 0,
  simulations_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_progress" ON user_progress;
CREATE POLICY "anon_all_progress" ON user_progress FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_progress" ON user_progress;
CREATE POLICY "anon_insert_progress" ON user_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_progress" ON user_progress;
CREATE POLICY "anon_update_progress" ON user_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_progress" ON user_progress;
CREATE POLICY "anon_delete_progress" ON user_progress FOR DELETE TO anon, authenticated USING (true);

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- 'info', 'success', 'warning', 'deadline', 'achievement'
  icon text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_notifications" ON notifications;
CREATE POLICY "anon_all_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ========================
-- APPLICATION SIMULATIONS
-- ========================
CREATE TABLE IF NOT EXISTS application_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  university_name text NOT NULL,
  personal_info jsonb,
  academic_info jsonb,
  test_scores jsonb,
  extracurriculars_list jsonb,
  essays jsonb,
  status text DEFAULT 'draft', -- 'draft', 'submitted'
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE application_simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_simulations" ON application_simulations;
CREATE POLICY "anon_all_simulations" ON application_simulations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_simulations" ON application_simulations;
CREATE POLICY "anon_insert_simulations" ON application_simulations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_simulations" ON application_simulations;
CREATE POLICY "anon_update_simulations" ON application_simulations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_simulations" ON application_simulations;
CREATE POLICY "anon_delete_simulations" ON application_simulations FOR DELETE TO anon, authenticated USING (true);

-- ========================
-- SAT RESOURCES
-- ========================
CREATE TABLE IF NOT EXISTS sat_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'Practice Test', 'Study Guide', 'Video Course', 'Flashcards', 'Book', 'Tool', 'Tips'
  description text NOT NULL,
  section text, -- 'Math', 'Reading', 'Writing', 'Full Test', 'General'
  is_free boolean DEFAULT true,
  website_url text NOT NULL,
  rating numeric DEFAULT 0,
  evidence text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sat_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_sat_resources" ON sat_resources;
CREATE POLICY "anon_read_sat_resources" ON sat_resources FOR SELECT TO anon, authenticated USING (true);

-- ========================
-- INDEXES
-- ========================
CREATE INDEX IF NOT EXISTS idx_roadmaps_session ON roadmaps(session_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap ON roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_session ON user_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_session ON notifications(session_id);
CREATE INDEX IF NOT EXISTS idx_app_sim_session ON application_simulations(session_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_posted ON scholarships(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
