/*
# Create AI settings table for Gemini API key storage

1. New Tables
- `ai_settings` — stores the Gemini API key used by the gemini-insights edge function.
- `id` (uuid, primary key)
- `key_name` (text, unique — identifies which API key)
- `api_key` (text — the actual key value)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

2. Security
- Enable RLS on `ai_settings`.
- Deny all access to anon and authenticated roles — only the service role (used by edge functions) can read this table.
- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated.

3. Notes
- The edge function uses the Supabase service role key, which bypasses RLS, so it can read the API key.
- Frontend users cannot access this table.
*/

CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  api_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- No policies for anon or authenticated — table is service-role-only (RLS denies by default).

-- Insert the Gemini API key
INSERT INTO ai_settings (key_name, api_key, is_active)
VALUES ('GEMINI_API_KEY', 'AQ.Ab8RN6IRG7W3D-jpsUqjI1Rib-7jKO-ZJPTAta2M7Ku2mbtf7g', true)
ON CONFLICT (key_name) DO UPDATE SET api_key = EXCLUDED.api_key, updated_at = now();
