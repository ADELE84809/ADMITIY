import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function getSessionId(): string {
  const key = 'admitiy_session_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export type AuthUser = {
  id: string
  email: string
}

export type University = {
  id: string
  name: string
  short_name: string | null
  location: string
  state: string | null
  country: string
  type: string
  ranking: number | null
  acceptance_rate: number | null
  sat_min: number | null
  sat_max: number | null
  act_min: number | null
  act_max: number | null
  tuition: number | null
  enrollment: number | null
  image_url: string | null
  website_url: string
  description: string | null
  campus_life: string | null
  notable_programs: string[] | null
  admission_requirements: string | null
  application_deadline: string | null
  early_deadline: string | null
  financial_aid: string | null
  mascot: string | null
  founded: number | null
  colors: string | null
  tags: string[] | null
}

export type Extracurricular = {
  id: string
  name: string
  category: string
  description: string
  impact: string
  time_commitment: string | null
  difficulty: string
  prestige: string
  evidence: string | null
  examples: string[] | null
  skills_developed: string[] | null
  college_value: string | null
  tags: string[] | null
}

export type Scholarship = {
  id: string
  name: string
  provider: string
  amount: string
  deadline: string
  eligibility: string
  description: string
  category: string | null
  level: string | null
  website_url: string
  requirements: string[] | null
  is_new: boolean
  posted_date: string
}

export type ResearchOpportunity = {
  id: string
  name: string
  organization: string
  field: string
  description: string
  eligibility: string
  location: string | null
  duration: string | null
  is_paid: boolean
  stipend: string | null
  is_remote: boolean
  application_deadline: string | null
  website_url: string
  evidence: string | null
  prestige: string
  skills_gained: string[] | null
}

export type Roadmap = {
  id: string
  session_id: string
  title: string
  description: string | null
  target_grade: string | null
  target_year: string | null
  focus_areas: string[] | null
  ai_generated: boolean
  created_at: string
}

export type RoadmapTask = {
  id: string
  roadmap_id: string
  title: string
  description: string | null
  category: string | null
  priority: string
  deadline: string | null
  completed: boolean
  completed_at: string | null
  xp_reward: number
  sort_order: number
}

export type UserProgress = {
  id: string
  session_id: string
  xp: number
  level: number
  streak_days: number
  last_active_date: string | null
  badges: string[]
  completed_tasks: number
  universities_explored: number
  scholarships_saved: number
  simulations_completed: number
}

export type Notification = {
  id: string
  session_id: string
  title: string
  message: string
  type: string
  icon: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export type ApplicationSimulation = {
  id: string
  session_id: string
  university_name: string
  personal_info: Record<string, unknown> | null
  academic_info: Record<string, unknown> | null
  test_scores: Record<string, unknown> | null
  extracurriculars_list: Record<string, unknown> | null
  essays: Record<string, unknown> | null
  status: string
  submitted_at: string | null
  created_at: string
}

export type SatResource = {
  id: string
  name: string
  type: string
  description: string
  section: string | null
  is_free: boolean
  website_url: string
  rating: number
  evidence: string | null
}

export const XP_PER_LEVEL = 500

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function getXpForNextLevel(xp: number): number {
  return (getLevel(xp) * XP_PER_LEVEL)
}

export function getXpProgress(xp: number): number {
  const currentLevelXp = (getLevel(xp) - 1) * XP_PER_LEVEL
  const nextLevelXp = getLevel(xp) * XP_PER_LEVEL
  return Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
}

export const BADGES = [
  { id: 'first_steps', name: 'First Steps', icon: 'Footprints', description: 'Created your first roadmap', xp: 50 },
  { id: 'explorer', name: 'Explorer', icon: 'Compass', description: 'Explored 5 universities', xp: 100 },
  { id: 'scholar', name: 'Scholar', icon: 'GraduationCap', description: 'Completed 10 roadmap tasks', xp: 150 },
  { id: 'test_ready', name: 'Test Ready', icon: 'ClipboardCheck', description: 'Completed an application simulation', xp: 200 },
  { id: 'streak_7', name: 'Week Warrior', icon: 'Flame', description: '7-day streak', xp: 100 },
  { id: 'streak_30', name: 'Unstoppable', icon: 'Trophy', description: '30-day streak', xp: 300 },
  { id: 'degree_hunter', name: 'Degree Hunter', icon: 'Target', description: 'Explored 10 universities', xp: 200 },
  { id: 'scholarship_seeker', name: 'Scholarship Seeker', icon: 'DollarSign', description: 'Viewed 5 scholarships', xp: 100 },
  { id: 'research_star', name: 'Research Star', icon: 'Microscope', description: 'Viewed 3 research opportunities', xp: 100 },
  { id: 'roadmap_master', name: 'Roadmap Master', icon: 'Map', description: 'Completed all tasks in a roadmap', xp: 250 },
] as const
