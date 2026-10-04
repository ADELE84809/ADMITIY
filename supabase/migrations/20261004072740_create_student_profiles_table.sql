/*
# Create student_profiles table

## Overview
Adds a student_profiles table to persist college-planning profile data
so that AI personalization features can work with real student data.

## New Tables
- `student_profiles` — one row per authenticated user
  - grade, gpa, gpa_scale, class_rank, sat_math, sat_reading, act_composite,
    test_optional, ap_courses, ib_courses, dual_enrollment, course_rigor,
    activities (jsonb), honors (jsonb), essay_progress,
    intended_major, interests[], goals, preferred_locations[],
    school_type_preference, created_at, updated_at

## Security
- RLS enabled, owner-scoped CRUD (TO authenticated, auth.uid() = user_id)
- user_id defaults to auth.uid()
*/

CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  grade text,
  gpa text,
  gpa_scale text DEFAULT '4.0',
  class_rank text,
  sat_math integer,
  sat_reading integer,
  act_composite integer,
  test_optional boolean DEFAULT false,
  ap_courses text,
  ib_courses text,
  dual_enrollment text,
  course_rigor text,
  activities jsonb DEFAULT '[]',
  honors jsonb DEFAULT '[]',
  essay_progress text,
  intended_major text,
  interests text[] DEFAULT '{}',
  goals text,
  preferred_locations text[] DEFAULT '{}',
  school_type_preference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON student_profiles;
CREATE POLICY "select_own_profile" ON student_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON student_profiles;
CREATE POLICY "insert_own_profile" ON student_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON student_profiles;
CREATE POLICY "update_own_profile" ON student_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON student_profiles;
CREATE POLICY "delete_own_profile" ON student_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);