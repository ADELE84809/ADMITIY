import { supabase } from './supabase'

export type StudentProfile = {
  grade?: string
  gpa?: string
  gpa_scale?: string
  class_rank?: string
  sat_math?: number | null
  sat_reading?: number | null
  act_composite?: number | null
  test_optional?: boolean
  ap_courses?: string
  ib_courses?: string
  dual_enrollment?: string
  course_rigor?: string
  activities?: unknown[]
  honors?: unknown[]
  essay_progress?: string
  intended_major?: string
  interests?: string[]
  goals?: string
  preferred_locations?: string[]
  school_type_preference?: string
}

export type AiInsightData = {
  whyMatch: string
  strengths: string[]
  gaps: string[]
  nextSteps: string[]
  thingsToVerify: string[]
  confidence: 'high' | 'medium' | 'low'
}

export type InsightType =
  | 'profile_analysis'
  | 'university_explanation'
  | 'scholarship_explanation'
  | 'opportunity_explanation'
  | 'roadmap_suggestions'

let cachedProfile: StudentProfile | null = null

export async function getStudentProfile(): Promise<StudentProfile | null> {
  if (cachedProfile) return cachedProfile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (data) {
    cachedProfile = data as StudentProfile
    return cachedProfile
  }
  return null
}

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: existing } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing) {
    await supabase.from('student_profiles').update({
      ...profile,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)
  } else {
    await supabase.from('student_profiles').insert({
      user_id: user.id,
      ...profile,
    })
  }
  cachedProfile = null
}

export async function fetchAiInsight(
  type: InsightType,
  profile: StudentProfile | null,
  contextData?: Record<string, unknown>
): Promise<AiInsightData | null> {
  if (!profile) return null

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-insights`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  } else {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type, profile, ...contextData }),
    })

    if (!response.ok) return null

    const data = await response.json()
    if (data?.error) return null
    if (!data || typeof data.whyMatch !== 'string') return null

    return {
      whyMatch: data.whyMatch,
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      gaps: Array.isArray(data.gaps) ? data.gaps : [],
      nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
      thingsToVerify: Array.isArray(data.thingsToVerify) ? data.thingsToVerify : [],
      confidence: ['high', 'medium', 'low'].includes(data.confidence) ? data.confidence : 'low',
    }
  } catch {
    return null
  }
}
