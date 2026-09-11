import { useState, useEffect, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Flame, Trophy, Star, Target, TrendingUp, Award, Zap,
  Building2, FileText, Map, BookOpen, DollarSign, Microscope,
  Footprints, Compass, GraduationCap, ClipboardCheck, Map as MapIcon,
} from 'lucide-react'
import {
  supabase, getLevel, getXpForNextLevel, getXpProgress,
  XP_PER_LEVEL, BADGES, type UserProgress,
} from '../lib/supabase'

type OutletContext = { addNotification: (title: string, message: string, type?: string, link?: string) => void; userId: string }

const quickLinks = [
  { path: '/universities', label: 'Explore Universities', icon: Building2, color: 'bg-primary-500' },
  { path: '/simulator', label: 'Practice Application', icon: FileText, color: 'bg-secondary-500' },
  { path: '/roadmaps', label: 'Build a Roadmap', icon: Map, color: 'bg-accent-500' },
  { path: '/sat-prep', label: 'SAT Prep Hub', icon: BookOpen, color: 'bg-error-500' },
  { path: '/scholarships', label: 'Find Scholarships', icon: DollarSign, color: 'bg-success-600' },
  { path: '/research', label: 'Research Programs', icon: Microscope, color: 'bg-primary-700' },
]

const badgeIconMap: Record<string, React.ElementType> = {
  Footprints, Compass, GraduationCap, ClipboardCheck, Flame, Trophy,
  Target, DollarSign, Microscope, MapIcon,
}

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const { addNotification, userId } = useOutletContext<OutletContext>()

  const loadProgress = useCallback(async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) {
      setProgress(data as UserProgress)
      const today = new Date().toISOString().split('T')[0]
      if (data.last_active_date !== today) {
        let newStreak = 1
        if (data.last_active_date) {
          const lastDate = new Date(data.last_active_date)
          const diff = Math.floor((Date.now() - lastDate.getTime()) / 86400000)
          if (diff === 1) newStreak = data.streak_days + 1
        }
        await supabase.from('user_progress').update({
          streak_days: newStreak,
          last_active_date: today,
        }).eq('user_id', userId)
        setProgress({ ...data, streak_days: newStreak, last_active_date: today } as UserProgress)
        if (newStreak === 7) {
          await addNotification('Achievement Unlocked!', 'You reached a 7-day streak! Keep it up!', 'achievement')
        }
      }
    } else {
      const today = new Date().toISOString().split('T')[0]
      const { data: newProgress } = await supabase.from('user_progress').insert({
        streak_days: 1,
        last_active_date: today,
      }).select().single()
      if (newProgress) setProgress(newProgress as UserProgress)
      await addNotification('Welcome to Admitiy!', 'Start exploring universities and building your roadmap to college success.', 'info', '/universities')
    }
    setLoading(false)
  }, [userId, addNotification])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-32 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <div key={i} className="shimmer-bg h-28 rounded-xl" />)}
        </div>
        <div className="shimmer-bg h-64 rounded-xl" />
      </div>
    )
  }

  const xp = progress?.xp || 0
  const level = getLevel(xp)
  const xpProgress = getXpProgress(xp)
  const nextLevelXp = getXpForNextLevel(xp)
  const earnedBadges = (progress?.badges || []) as string[]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero Welcome */}
      <div className="gradient-hero rounded-2xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white/5 rounded-full translate-y-48" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium mb-1">Welcome back to</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Admitiy</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
            Your all-in-one college admissions companion. Explore universities, build roadmaps,
            practice applications, find scholarships, and track your journey to college.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/universities" className="px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-white/90 transition-all text-sm">
              Start Exploring
            </Link>
            <Link to="/roadmaps" className="px-5 py-2.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-sm border border-white/20">
              Create Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* XP & Level */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">Lv {level}</span>
          </div>
          <p className="text-xs text-neutral-500 mb-2">{xp} / {nextLevelXp} XP</p>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-error-500" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">{progress?.streak_days || 0}</span>
          </div>
          <p className="text-xs text-neutral-500">Day streak</p>
          <p className="text-xs text-neutral-400 mt-1">Stay active daily!</p>
        </div>

        {/* Tasks Completed */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
              <CheckMark />
            </div>
            <span className="text-2xl font-bold text-neutral-900">{progress?.completed_tasks || 0}</span>
          </div>
          <p className="text-xs text-neutral-500">Tasks completed</p>
          <p className="text-xs text-neutral-400 mt-1">Keep it up!</p>
        </div>

        {/* Universities Explored */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">{progress?.universities_explored || 0}</span>
          </div>
          <p className="text-xs text-neutral-500">Universities explored</p>
          <p className="text-xs text-neutral-400 mt-1">Discover more!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="card-hover p-4 flex flex-col items-center text-center group"
            >
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-neutral-700 leading-tight">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent-500" />
          <h2 className="section-title">Badges & Achievements</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id)
            const Icon = badgeIconMap[badge.icon] || Award
            return (
              <div
                key={badge.id}
                className={`card p-3 flex flex-col items-center text-center transition-all duration-300 ${earned ? 'border-accent-300 bg-accent-50' : 'opacity-50'}`}
                title={badge.description}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${earned ? 'bg-accent-500' : 'bg-neutral-200'}`}>
                  <Icon className={`w-5 h-5 ${earned ? 'text-white' : 'text-neutral-400'}`} />
                </div>
                <p className={`text-[10px] font-semibold leading-tight ${earned ? 'text-accent-700' : 'text-neutral-500'}`}>
                  {badge.name}
                </p>
                {!earned && <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{badge.description}</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Verification Warning */}
      <div className="card p-4 sm:p-5 border-warning-200 bg-warning-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
            <AlertCircle />
          </div>
          <div>
            <h3 className="font-semibold text-warning-800 text-sm mb-1">Important: Always Verify Information</h3>
            <p className="text-xs text-warning-700 leading-relaxed">
              Admitiy is designed for your convenience and planning purposes. While we strive to provide accurate,
              up-to-date information, data may change. Always double-check admissions data, deadlines, and requirements
              on official university websites before making decisions. When specific data is not available, we will
              indicate that you should check the official website directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckMark() {
  return (
    <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function AlertCircle() {
  return (
    <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
