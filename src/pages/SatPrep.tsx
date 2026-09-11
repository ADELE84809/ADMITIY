import { useState, useEffect, useMemo } from 'react'
import { BookOpen, ExternalLink, Star, Search, Filter, Check, DollarSign, Clock, BarChart3, ArrowRight } from 'lucide-react'
import { supabase, type SatResource } from '../lib/supabase'

export default function SatPrep() {
  const [resources, setResources] = useState<SatResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSection, setFilterSection] = useState('all')
  const [filterFree, setFilterFree] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('sat_resources').select('*').order('rating', { ascending: false })
      if (data) setResources(data as SatResource[])
      setLoading(false)
    }
    load()
  }, [])

  const types = useMemo(() => Array.from(new Set(resources.map(r => r.type))).sort(), [resources])
  const sections = useMemo(() => Array.from(new Set(resources.map(r => r.section).filter(Boolean) as string[])).sort(), [resources])

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || r.type === filterType
      const matchSection = filterSection === 'all' || r.section === filterSection
      const matchFree = filterFree === 'all' || (filterFree === 'free' && r.is_free) || (filterFree === 'paid' && !r.is_free)
      return matchSearch && matchType && matchSection && matchFree
    })
  }, [resources, search, filterType, filterSection, filterFree])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer-bg h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">SAT Prep Hub</h1>
        <p className="text-neutral-600 text-sm">Curated SAT preparation resources — practice tests, study guides, books, video courses, and more. All resources are verified and rated.</p>
      </div>

      {/* SAT Info Card */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-neutral-900 text-base mb-1">About the Digital SAT</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              The SAT is now fully digital, adaptive, and shorter — approximately 2 hours and 14 minutes. It consists of two sections:
              Reading & Writing (combined) and Math, each divided into two modules. The test adapts to your performance.
              Scores range from 400 to 1600. Start preparing early and use official College Board materials for the most accurate practice.
            </p>
            <a href="https://satsuite.collegeboard.org/sat" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2">
              Official College Board SAT Page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* SAT Analyzer Tool Link */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-primary-600 to-primary-800 border-primary-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base mb-1">SAT Score Analyzer Tool</h2>
              <p className="text-sm text-white/80 leading-relaxed max-w-lg">
                Analyze your SAT scores, see where you stand for your target colleges, and get personalized recommendations to improve your scores.
              </p>
            </div>
          </div>
          <a
            href="https://sat-analyzer.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-white/90 transition-all text-sm shrink-0"
          >
            Open SAT Analyzer <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search SAT resources..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterFree} onChange={e => setFilterFree(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
            <span className="ml-auto text-sm text-neutral-500 self-center">{filtered.length} resources</span>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(r => (
            <div key={r.id} className="card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="badge bg-primary-50 text-primary-700 text-xs">{r.type}</span>
                <div className="flex items-center gap-1">
                  {r.is_free ? (
                    <span className="badge bg-success-100 text-success-700 text-xs"><DollarSign className="w-3 h-3 mr-0.5" />Free</span>
                  ) : (
                    <span className="badge bg-neutral-100 text-neutral-600 text-xs">Paid</span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-neutral-900 text-sm mb-1">{r.name}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed flex-1">{r.description}</p>

              {r.section && (
                <div className="flex items-center gap-1 mt-3 text-xs text-neutral-500">
                  <Filter className="w-3 h-3" /> {r.section}
                </div>
              )}

              {r.rating > 0 && (
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(r.rating) ? 'text-accent-500 fill-accent-500' : 'text-neutral-200'}`} />
                  ))}
                  <span className="text-xs text-neutral-500 ml-1">{r.rating.toFixed(1)}</span>
                </div>
              )}

              {r.evidence && (
                <p className="text-[11px] text-neutral-400 mt-2 italic leading-relaxed border-l-2 border-neutral-200 pl-2">
                  {r.evidence}
                </p>
              )}

              <a
                href={r.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs mt-4 w-full justify-center inline-flex items-center gap-1"
              >
                Visit Resource <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
