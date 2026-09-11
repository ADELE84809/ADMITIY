import { useState, useEffect, useMemo } from 'react'
import {
  Trophy, Search, Filter, Clock, Star, Target, Zap,
  TrendingUp, Award, ChevronDown, ChevronUp, Lightbulb,
} from 'lucide-react'
import { supabase, type Extracurricular } from '../lib/supabase'

const categoryColors: Record<string, string> = {
  'STEM': 'bg-primary-100 text-primary-700',
  'Academic': 'bg-secondary-100 text-secondary-700',
  'Leadership': 'bg-accent-100 text-accent-700',
  'Community Service': 'bg-success-100 text-success-700',
  'Arts': 'bg-error-100 text-error-700',
  'Sports': 'bg-warning-100 text-warning-700',
  'Research': 'bg-primary-200 text-primary-800',
  'Work': 'bg-neutral-200 text-neutral-700',
  'Other': 'bg-neutral-100 text-neutral-600',
}

const prestigeColors: Record<string, string> = {
  'Low': 'text-neutral-400',
  'Moderate': 'text-neutral-600',
  'High': 'text-accent-600',
  'Very High': 'text-error-600',
}

const difficultyColors: Record<string, string> = {
  'Easy': 'text-success-600',
  'Moderate': 'text-accent-600',
  'Hard': 'text-error-500',
  'Very Hard': 'text-error-700',
}

export default function Extracurriculars() {
  const [activities, setActivities] = useState<Extracurricular[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPrestige, setFilterPrestige] = useState('all')
  const [sortBy, setSortBy] = useState('prestige')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('extracurriculars').select('*').order('name', { ascending: true })
      if (data) setActivities(data as Extracurricular[])
      setLoading(false)
    }
    load()
  }, [])

  const categories = useMemo(() => Array.from(new Set(activities.map(a => a.category))).sort(), [activities])

  const filtered = useMemo(() => {
    let result = activities.filter(a => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'all' || a.category === filterCategory
      const matchPrestige = filterPrestige === 'all' || a.prestige === filterPrestige
      return matchSearch && matchCat && matchPrestige
    })
    const prestigeOrder = { 'Very High': 4, 'High': 3, 'Moderate': 2, 'Low': 1 }
    if (sortBy === 'prestige') result = result.sort((a, b) => (prestigeOrder[b.prestige as keyof typeof prestigeOrder] || 0) - (prestigeOrder[a.prestige as keyof typeof prestigeOrder] || 0))
    if (sortBy === 'name') result = result.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'difficulty') result = result.sort((a, b) => {
      const order = { 'Easy': 1, 'Moderate': 2, 'Hard': 3, 'Very Hard': 4 }
      return (order[b.difficulty as keyof typeof order] || 0) - (order[a.difficulty as keyof typeof order] || 0)
    })
    return result
  }, [activities, search, filterCategory, filterPrestige, sortBy])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer-bg h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Extracurricular Activities</h1>
        <p className="text-neutral-600 text-sm">Browse {activities.length} verified extracurriculars with real data on impact, time commitment, and how colleges evaluate them.</p>
      </div>

      {/* Info Banner */}
      <div className="card p-4 mb-6 bg-gradient-to-br from-secondary-50 to-primary-50 border-secondary-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 text-sm mb-1">How to Choose Extracurriculars</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Colleges look for <strong>depth over breadth</strong> — 2-3 sustained activities with leadership and impact
              beat 10 superficial ones. Choose activities aligned with your interests and demonstrate genuine commitment.
              The prestige and difficulty ratings are based on real admissions outcomes data.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterPrestige} onChange={e => setFilterPrestige(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Prestige Levels</option>
              <option>Very High</option><option>High</option><option>Moderate</option><option>Low</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="prestige">Sort: Prestige</option>
              <option value="name">Sort: Name</option>
              <option value="difficulty">Sort: Difficulty</option>
            </select>
            <span className="ml-auto text-sm text-neutral-500 self-center">{filtered.length} activities</span>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const isExpanded = expanded === a.id
            return (
              <div key={a.id} className="card overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : a.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-neutral-900 text-sm">{a.name}</h3>
                        <span className={`badge ${categoryColors[a.category] || categoryColors['Other']} text-xs`}>{a.category}</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{a.description}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          <Star className="w-3 h-3" /> <span className={prestigeColors[a.prestige]}>Prestige: {a.prestige}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          <Zap className="w-3 h-3" /> <span className={difficultyColors[a.difficulty]}>Difficulty: {a.difficulty}</span>
                        </span>
                        {a.time_commitment && (
                          <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <Clock className="w-3 h-3" /> {a.time_commitment}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-neutral-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-neutral-100 p-4 space-y-3 animate-slide-down">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1">Impact</h4>
                      <p className="text-sm text-neutral-700 leading-relaxed">{a.impact}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1">How Colleges View It</h4>
                      <p className="text-sm text-neutral-700 leading-relaxed">{a.college_value || 'N/A'}</p>
                    </div>
                    {a.evidence && (
                      <div className="bg-neutral-50 rounded-lg p-3 border-l-2 border-primary-300">
                        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Proven Data
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed italic">{a.evidence}</p>
                      </div>
                    )}
                    {a.examples && a.examples.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1">Specific Programs/Examples</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {a.examples.map(ex => <span key={ex} className="badge bg-primary-50 text-primary-700 text-xs border border-primary-100">{ex}</span>)}
                        </div>
                      </div>
                    )}
                    {a.skills_developed && a.skills_developed.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1">Skills Developed</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {a.skills_developed.map(s => <span key={s} className="badge bg-secondary-50 text-secondary-700 text-xs">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
