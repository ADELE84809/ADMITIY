import { useState, useEffect, useMemo } from 'react'
import {
  Microscope, Search, ExternalLink, MapPin, Clock, DollarSign,
  Building2, Star, Award, Target, Check,
} from 'lucide-react'
import { supabase, type ResearchOpportunity } from '../lib/supabase'
import AiInsight from '../components/AiInsight'

const fieldColors: Record<string, string> = {
  'STEM': 'bg-primary-100 text-primary-700',
  'Humanities': 'bg-accent-100 text-accent-700',
  'Social Science': 'bg-secondary-100 text-secondary-700',
  'Biomedical': 'bg-error-100 text-error-700',
  'Computer Science': 'bg-primary-200 text-primary-800',
  'Mathematics': 'bg-warning-100 text-warning-700',
}

const prestigeColors: Record<string, string> = {
  'Moderate': 'bg-neutral-100 text-neutral-600',
  'High': 'bg-accent-100 text-accent-700',
  'Very High': 'bg-error-100 text-error-700',
}

export default function Research() {
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterField, setFilterField] = useState('all')
  const [filterPaid, setFilterPaid] = useState('all')
  const [sortBy, setSortBy] = useState('prestige')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('research_opportunities').select('*').order('name', { ascending: true })
      if (data) setOpportunities(data as ResearchOpportunity[])
      setLoading(false)
    }
    load()
  }, [])

  const fields = useMemo(() => Array.from(new Set(opportunities.map(o => o.field))).sort(), [opportunities])

  const filtered = useMemo(() => {
    let result = opportunities.filter(o => {
      const matchSearch = !search ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.organization.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase())
      const matchField = filterField === 'all' || o.field === filterField
      const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' && o.is_paid) || (filterPaid === 'unpaid' && !o.is_paid)
      return matchSearch && matchField && matchPaid
    })
    const prestigeOrder = { 'Very High': 3, 'High': 2, 'Moderate': 1 }
    if (sortBy === 'prestige') result = result.sort((a, b) => (prestigeOrder[b.prestige as keyof typeof prestigeOrder] || 0) - (prestigeOrder[a.prestige as keyof typeof prestigeOrder] || 0))
    if (sortBy === 'name') result = result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [opportunities, search, filterField, filterPaid, sortBy])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer-bg h-56 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Research Opportunities</h1>
        <p className="text-neutral-600 text-sm">Explore {opportunities.length} verified research programs for high school students with real data on selectivity, outcomes, and prestige.</p>
      </div>

      <div className="card p-4 mb-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <Microscope className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 text-sm mb-1">Why Research Matters</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Research experience is one of the strongest extracurricular signals for selective colleges. Students who
              participate in prestigious programs like RSI, SSP, or Simons have significantly higher admission rates at
              top universities. Published research or ISEF presentations are major differentiators.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-6 border-warning-200 bg-warning-50">
        <p className="text-xs text-warning-700 leading-relaxed">
          <strong>Disclaimer:</strong> Always verify eligibility, deadlines, and program details on the official program website. Admission criteria and funding may change.
        </p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input type="text" placeholder="Search research programs..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterField} onChange={e => setFilterField(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All Fields</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="all">All (Paid/Unpaid)</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid/Free Only</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="prestige">Sort: Prestige</option>
              <option value="name">Sort: Name</option>
            </select>
            <span className="ml-auto text-sm text-neutral-500 self-center">{filtered.length} programs</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Microscope className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No research programs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(o => (
            <div key={o.id} className="card-hover p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-neutral-900 text-base">{o.name}</h3>
                    <span className={`badge ${fieldColors[o.field] || 'bg-neutral-100 text-neutral-600'} text-xs`}>{o.field}</span>
                    <span className={`badge ${prestigeColors[o.prestige] || prestigeColors['Moderate']} text-xs`}>
                      <Star className="w-3 h-3 mr-0.5" />{o.prestige} Prestige
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">{o.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <div>
                        <p className="text-[10px] text-neutral-400">Organization</p>
                        <p className="font-medium text-neutral-700">{o.organization}</p>
                      </div>
                    </div>
                    {o.location && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <div>
                          <p className="text-[10px] text-neutral-400">Location</p>
                          <p className="font-medium text-neutral-700">{o.location}</p>
                        </div>
                      </div>
                    )}
                    {o.duration && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <div>
                          <p className="text-[10px] text-neutral-400">Duration</p>
                          <p className="font-medium text-neutral-700">{o.duration}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                      <div>
                        <p className="text-[10px] text-neutral-400">Compensation</p>
                        <p className="font-medium text-neutral-700">{o.is_paid ? o.stipend || 'Paid' : o.stipend || 'Unpaid'}</p>
                      </div>
                    </div>
                  </div>

                  {o.evidence && (
                    <div className="bg-neutral-50 rounded-lg p-3 border-l-2 border-primary-300 mb-3">
                      <p className="text-xs font-semibold text-neutral-700 mb-0.5 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Proven Data
                      </p>
                      <p className="text-xs text-neutral-600 leading-relaxed italic">{o.evidence}</p>
                    </div>
                  )}

                  {o.eligibility && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-neutral-700 mb-1">Eligibility</p>
                      <p className="text-xs text-neutral-600 leading-relaxed">{o.eligibility}</p>
                    </div>
                  )}

                  {o.skills_gained && o.skills_gained.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-neutral-700 mb-1">Skills Gained</p>
                      <div className="flex flex-wrap gap-1.5">
                        {o.skills_gained.map(s => <span key={s} className="badge bg-primary-50 text-primary-700 text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-100">
                    {o.application_deadline && (
                      <p className="text-xs text-error-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Deadline: {o.application_deadline}
                      </p>
                    )}
                    <a
                      href={o.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs inline-flex items-center gap-1"
                    >
                      Visit Program <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="mt-3">
                    <AiInsight
                      type="opportunity_explanation"
                      title="Why This Opportunity Fits You"
                      compact
                      contextData={{ opportunity: { name: o.name, organization: o.organization, field: o.field, description: o.description, eligibility: o.eligibility, prestige: o.prestige, skills_gained: o.skills_gained } }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
