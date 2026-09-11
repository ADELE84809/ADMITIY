import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Building2, MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase, type University } from '../lib/supabase'

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [sortBy, setSortBy] = useState('ranking')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('universities').select('*').order('ranking', { ascending: true })
      if (error) {
        console.error('Error loading universities:', error)
      }
      if (data) setUniversities(data as University[])
      setLoading(false)
    }
    load()
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    universities.forEach(u => u.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [universities])

  const filtered = useMemo(() => {
    let result = universities.filter(u => {
      const matchSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.location.toLowerCase().includes(search.toLowerCase()) ||
        u.short_name?.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || u.type === filterType
      const matchTag = filterTag === 'all' || u.tags?.includes(filterTag)
      return matchSearch && matchType && matchTag
    })
    if (sortBy === 'ranking') result = result.sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
    if (sortBy === 'acceptance') result = result.sort((a, b) => (a.acceptance_rate || 1) - (b.acceptance_rate || 1))
    if (sortBy === 'name') result = result.sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'tuition') result = result.sort((a, b) => (a.tuition || 999999) - (b.tuition || 999999))
    return result
  }, [universities, search, filterType, filterTag, sortBy])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer-bg h-72 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Universities</h1>
        <p className="text-neutral-600 text-sm">Browse {universities.length} universities with real admissions data. Click any university for a detailed profile.</p>
      </div>

      {/* Verification Notice */}
      <div className="card p-3 mb-6 border-warning-200 bg-warning-50">
        <p className="text-xs text-warning-700 leading-relaxed">
          <strong>Disclaimer:</strong> Data shown here is compiled for your convenience. Always verify acceptance rates,
          deadlines, tuition, and requirements on the official university website before applying.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, location, or abbreviation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Types</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Tags</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="ranking">Sort: Ranking</option>
              <option value="acceptance">Sort: Acceptance Rate</option>
              <option value="name">Sort: Name</option>
              <option value="tuition">Sort: Tuition</option>
            </select>
            <span className="ml-auto text-sm text-neutral-500 self-center">{filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* University Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No universities found</p>
          <p className="text-sm text-neutral-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(uni => (
            <Link
              key={uni.id}
              to={`/universities/${uni.id}`}
              className="card-hover overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-neutral-100">
                {uni.image_url ? (
                  <img
                    src={uni.image_url}
                    alt={`${uni.name} campus`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-neutral-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`badge ${uni.type === 'private' ? 'bg-primary-100 text-primary-700' : 'bg-success-100 text-success-700'}`}>
                    {uni.type}
                  </span>
                </div>
                {uni.ranking && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-700">
                    #{uni.ranking}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-neutral-900 text-base group-hover:text-primary-600 transition-colors">{uni.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {uni.location}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Accept Rate</p>
                      <p className="text-xs font-semibold text-neutral-700">{uni.acceptance_rate ? (uni.acceptance_rate * 100).toFixed(1) + '%' : 'Check site'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <div>
                      <p className="text-[10px] text-neutral-400">Enrollment</p>
                      <p className="text-xs font-semibold text-neutral-700">{uni.enrollment ? uni.enrollment.toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                  <div>
                    <p className="text-[10px] text-neutral-400">SAT Range</p>
                    <p className="text-xs font-semibold text-neutral-700">{uni.sat_min && uni.sat_max ? `${uni.sat_min}-${uni.sat_max}` : 'Check site'}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
