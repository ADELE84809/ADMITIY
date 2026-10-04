import { useState, useEffect } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Building2, Users, TrendingUp, DollarSign,
  Calendar, Award, BookOpen, GraduationCap, ExternalLink, AlertTriangle,
  CheckCircle2, ExternalLink as LinkIcon, Copy,
} from 'lucide-react'
import { supabase, type University } from '../lib/supabase'
import AiInsight from '../components/AiInsight'

type OutletContext = { addNotification: (title: string, message: string, type?: string, link?: string) => void; userId: string }

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>()
  const [uni, setUni] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const { addNotification, userId } = useOutletContext<OutletContext>()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('universities').select('*').eq('id', id).maybeSingle()
      if (error) console.error(error)
      if (data) {
        setUni(data as University)
        // Increment universities explored
        const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle()
        if (progress) {
          const newCount = (progress as { universities_explored: number }).universities_explored + 1
          await supabase.from('user_progress').update({ universities_explored: newCount }).eq('user_id', userId)
          if (newCount === 5) {
            await addNotification('Achievement Unlocked!', 'You explored 5 universities. Explorer badge earned!', 'achievement')
          }
          if (newCount === 10) {
            await addNotification('Achievement Unlocked!', 'You explored 10 universities. Degree Hunter badge earned!', 'achievement')
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [id, userId, addNotification])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="shimmer-bg h-64 rounded-xl mb-6" />
        <div className="shimmer-bg h-96 rounded-xl" />
      </div>
    )
  }

  if (!uni) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">University not found</p>
          <Link to="/universities" className="text-primary-600 hover:underline mt-2 inline-block">Back to universities</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/universities" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Universities
      </Link>

      {/* Hero Image */}
      <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-6 bg-neutral-200">
        {uni.image_url ? (
          <img src={uni.image_url} alt={`${uni.name} campus`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-neutral-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${uni.type === 'private' ? 'bg-primary-500/90' : 'bg-success-500/90'} text-white`}>
              {uni.type}
            </span>
            {uni.ranking && <span className="badge bg-white/90 text-neutral-700">National Rank #{uni.ranking}</span>}
            {uni.founded && <span className="badge bg-white/20 text-white">Est. {uni.founded}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{uni.name}</h1>
          <p className="text-white/80 text-sm mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {uni.location}, {uni.country}
          </p>
        </div>
      </div>

      {/* Verification Warning */}
      <div className="card p-4 mb-6 border-warning-200 bg-warning-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning-800 text-sm mb-1">This page is for convenience only — always double-check!</h3>
            <p className="text-xs text-warning-700 leading-relaxed">
              The information on this page is compiled to help you plan efficiently. Admissions data, deadlines, tuition,
              and requirements can change at any time. Before making any decisions or submitting applications, please verify
              all information on the official {uni.name} website. If data is unavailable or uncertain, we will note that you
              should check the official website directly.
            </p>
            <a
              href={uni.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 mt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit official website
            </a>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Acceptance Rate"
          value={uni.acceptance_rate ? (uni.acceptance_rate * 100).toFixed(1) + '%' : 'Check official site'}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          icon={BookOpen}
          label="SAT Range"
          value={uni.sat_min && uni.sat_max ? `${uni.sat_min}-${uni.sat_max}` : 'Check official site'}
          color="bg-secondary-100 text-secondary-600"
        />
        <StatCard
          icon={Award}
          label="ACT Range"
          value={uni.act_min && uni.act_max ? `${uni.act_min}-${uni.act_max}` : 'Check official site'}
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          icon={DollarSign}
          label="Annual Tuition"
          value={uni.tuition ? '$' + uni.tuition.toLocaleString() : 'Check official site'}
          color="bg-error-100 text-error-600"
        />
      </div>

      {/* Description */}
      {uni.description && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-neutral-900 text-lg mb-3">About {uni.short_name || uni.name}</h2>
          <p className="text-neutral-700 text-sm leading-relaxed">{uni.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Admission Requirements */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-neutral-900 text-base">Admission Requirements</h2>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{uni.admission_requirements || 'Please check the official website for the most current admission requirements.'}</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <p className="text-xs text-neutral-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Regular Deadline</p>
              <p className="text-sm font-semibold text-neutral-800 mt-0.5">{uni.application_deadline || 'Check official site'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Early Deadline</p>
              <p className="text-sm font-semibold text-neutral-800 mt-0.5">{uni.early_deadline || 'Check official site'}</p>
            </div>
          </div>
        </div>

        {/* Financial Aid */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-success-600" />
            <h2 className="font-bold text-neutral-900 text-base">Financial Aid</h2>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{uni.financial_aid || 'Please check the official website for detailed financial aid information.'}</p>
        </div>
      </div>

      {/* Notable Programs */}
      {uni.notable_programs && uni.notable_programs.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-neutral-900 text-base mb-3">Notable Programs</h2>
          <div className="flex flex-wrap gap-2">
            {uni.notable_programs.map(prog => (
              <span key={prog} className="badge bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 text-sm">
                {prog}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Campus Life */}
      {uni.campus_life && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-neutral-900 text-base mb-3">Campus Life</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">{uni.campus_life}</p>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <InfoCard label="Enrollment" value={uni.enrollment ? uni.enrollment.toLocaleString() : 'N/A'} />
        <InfoCard label="Mascot" value={uni.mascot || 'N/A'} />
        <InfoCard label="Founded" value={uni.founded ? String(uni.founded) : 'N/A'} />
        <InfoCard label="Colors" value={uni.colors || 'N/A'} />
      </div>

      {/* Tags */}
      {uni.tags && uni.tags.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-xs text-neutral-500 font-medium mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {uni.tags.map(tag => (
              <span key={tag} className="badge bg-neutral-100 text-neutral-600 text-xs">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* AI University Fit Analysis */}
      <div className="mb-6">
        <AiInsight
          type="university_explanation"
          title="Why This Matches You"
          contextData={{ university: uni }}
        />
      </div>

      {/* CTA */}
      <div className="card p-5 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Ready to apply to {uni.short_name || uni.name}?</h3>
            <p className="text-sm text-neutral-600 mt-1">Practice your application with our simulator or build a custom roadmap.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/simulator" className="btn-primary text-sm">Practice Application</Link>
            <Link to="/roadmaps" className="btn-secondary text-sm">Build Roadmap</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-bold text-neutral-900 mt-0.5">{value}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-neutral-800 mt-1">{value}</p>
    </div>
  )
}
