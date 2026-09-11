import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign, Search, ExternalLink, Calendar, Check, AlertCircle,
  Clock, TrendingUp, Award,
} from 'lucide-react'
import { supabase, type Scholarship } from '../lib/supabase'

const categoryColors: Record<string, string> = {
  'Merit': 'bg-primary-100 text-primary-700',
  'Need-based': 'bg-success-100 text-success-700',
  'Minority': 'bg-accent-100 text-accent-700',
  'STEM': 'bg-primary-200 text-primary-800',
  'Arts': 'bg-error-100 text-error-700',
  'Athletic': 'bg-warning-100 text-warning-700',
  'Community': 'bg-secondary-100 text-secondary-700',
  'First-gen': 'bg-neutral-200 text-neutral-700',
}

const levelColors: Record<string, string> = {
  'National': 'bg-primary-600 text-white',
  'State': 'bg-secondary-600 text-white',
  'Local': 'bg-neutral-500 text-white',
  'University-specific': 'bg-accent-600 text-white',
}

export default function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('posted')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_new', true)
        .order('posted_date', { ascending: false })
      if (data) setScholarships(data as Scholarship[])
      setLoading(false)
    }
    load()
  }, [])

  const categories = useMemo(() => Array.from(new Set(scholarships.map(s => s.category).filter(Boolean) as string[])).sort(), [scholarships])

  const filtered = useMemo(() => {
    let result = scholarships.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.provider.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'all' || s.category === filterCategory
      return matchSearch && matchCat
    })
    if (sortBy === 'amount') {
      result = result.sort((a, b) => {
        const parseAmount = (s: string) => {
          const match = s.match(/(\d[\d,]*)/)
          return match ? parseInt(match[1].replace(/,/g, '')) : 0
        }
        return parseAmount(b.amount) - parseAmount(a.amount)
      })
    }
    if (sortBy === 'posted') result = result.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
    if (sortBy === 'name') result = result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [scholarships, search, filterCategory, sortBy])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer-bg h-56 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Scholarships</h1>
        <p className="text-neutral-600 text-sm">Browse {scholarships.length} recent scholarship opportunities. We only list new and actively accepting scholarships.</p>
      </div>

      <div className="card p-3 mb-6 border-warning-200 bg-warning-50">
        <p className="text-xs text-warning-700 leading-relaxed">
          <strong>Disclaimer:</strong> Always verify deadlines, eligibility, and requirements on the official scholarship provider's website before applying. Deadlines and criteria may change.
        </p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search scholarships..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="posted">Sort: Newest</option>
              <option value="amount">Sort: Amount</option>
              <option value="name">Sort: Name</option>
            </select>
            <span className="ml-auto text-sm text-neutral-500 self-center">{filtered.length} scholarships</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No scholarships found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <div key={s.id} className="card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {s.category && <span className={`badge ${categoryColors[s.category] || 'bg-neutral-100 text-neutral-600'} text-xs`}>{s.category}</span>}
                  {s.level && <span className={`badge ${levelColors[s.level] || 'bg-neutral-500 text-white'} text-xs`}>{s.level}</span>}
                </div>
                {s.is_new && <span className="badge bg-success-500 text-white text-xs animate-pulse">NEW</span>}
              </div>

              <h3 className="font-bold text-neutral-900 text-sm mb-1">{s.name}</h3>
              <p className="text-xs text-neutral-500 mb-2">by {s.provider}</p>
              <p className="text-xs text-neutral-600 leading-relaxed flex-1 line-clamp-3">{s.description}</p>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-success-600 shrink-0" />
                  <span className="font-bold text-success-700">{s.amount}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <Calendar className="w-3.5 h-3.5 text-error-500 shrink-0" />
                  <span>Deadline: <strong>{s.deadline}</strong></span>
                </div>
              </div>

              {s.requirements && s.requirements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase mb-1">Requirements</p>
                  <ul className="space-y-0.5">
                    {s.requirements.slice(0, 3).map((req, i) => (
                      <li key={i} className="text-[11px] text-neutral-600 flex items-start gap-1">
                        <Check className="w-3 h-3 text-success-500 mt-0.5 shrink-0" /> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={s.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs mt-4 w-full justify-center inline-flex items-center gap-1"
              >
                Apply Now <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
