/*
# Create student_profiles table

## Overview
Adds a student_profiles table to persist college-planning profile data
(grade, GPA, test scores, activities, interests, goals) so that AI
personalization features can work with real student data. Previously this
data only existed transiently in the ProfileScorer component's local state.

## New Tables
- `student_profiles`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users, unique — one profile per user)
  - `grade` (text) — current grade level, e.g. "11th grade"
  - `gpa` (text) — unweighted GPA, e.g. "3.85"
  - `gpa_scale` (text) — e.g. "4.0"
  - `class_rank` (text) — e.g. "12/350"
  - `sat_math` (integer) — SAT math section score
  - `sat_reading` (integer) — SAT reading/writing section score
  - `act_composite` (integer) — ACT composite score
  - `test_optional` (boolean) — applying test-optional
  - `ap_courses` (text) — comma-separated AP courses
  - `ib_courses` (text) — comma-separated IB courses
  - `dual_enrollment` (text) — dual enrollment courses
  - `course_rigor` (text) — self-assessed rigor level
  - `activities` (jsonb) — array of activity objects
  - `honors` (jsonb) — array of honor objects
  - `essay_progress` (text) — essay progress stage
  - `intended_major` (text) — intended field/major
  - `interests` (text[]) — tags for interests
  - `goals` (text) — student's college goals
  - `preferred_locations` (text[]) — preferred study locations
  - `school_type_preference` (text) — public/private/either
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

## Security
- RLS enabled, owner-scoped CRUD (authenticated, auth.uid() = user_id)
- user_id defaults to auth.uid()
*/