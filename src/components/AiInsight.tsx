import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle,
  CheckCircle2, TrendingUp, ArrowRight, ShieldAlert, Lightbulb,
} from 'lucide-react'
import {
  fetchAiInsight, getStudentProfile,
  type AiInsightData, type InsightType, type StudentProfile,
} from '../lib/ai'

type Props = {
  type: InsightType
  contextData?: Record<string, unknown>
  title?: string
  compact?: boolean
}

export default function AiInsight({ type, contextData, title = 'AI Insight', compact = false }: Props) {
  const [insight, setInsight] = useState<AiInsightData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [noProfile, setNoProfile] = useState(false)
  const [expanded, setExpanded] = useState(!compact)

  const loadInsight = useCallback(async () => {
    setLoading(true)
    setError(false)
    const profile: StudentProfile | null = await getStudentProfile()
    if (!profile) {
      setNoProfile(true)
      setLoading(false)
      return
    }
    setNoProfile(false)
    const result = await fetchAiInsight(type, profile, contextData)
    if (result) {
      setInsight(result)
    } else {
      setError(true)
    }
    setLoading(false)
  }, [type, JSON.stringify(contextData)])

  useEffect(() => {
    loadInsight()
  }, [loadInsight])

  const confidenceColor = insight?.confidence === 'high'
    ? 'bg-success-100 text-success-700'
    : insight?.confidence === 'medium'
    ? 'bg-accent-100 text-accent-700'
    : 'bg-neutral-100 text-neutral-600'

  if (loading) {
    return (
      <div className="card p-4 border-primary-100 bg-primary-50/30">
        <div className="flex items-center gap-2 text-sm text-primary-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium">Generating AI insights...</span>
        </div>
      </div>
    )
  }

  if (noProfile) {
    return (
      <div className="card p-4 border-neutral-200 bg-neutral-50">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            Complete your <a href="/profile-scorer" className="text-primary-600 font-medium hover:underline">profile</a> to get personalized AI insights for this page.
          </p>
        </div>
      </div>
    )
  }

  if (error || !insight) {
    return (
      <div className="card p-4 border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>AI insights are temporarily unavailable.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4 border-primary-200 bg-gradient-to-br from-primary-50/50 to-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${confidenceColor} text-[10px] capitalize`}>{insight.confidence} confidence</span>
          {compact && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-neutral-100 transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 animate-slide-down">
          <p className="text-sm text-neutral-700 leading-relaxed">{insight.whyMatch}</p>

          {insight.strengths.length > 0 && (
            <InsightSection icon={CheckCircle2} label="Strengths" items={insight.strengths} color="text-success-600" />
          )}
          {insight.gaps.length > 0 && (
            <InsightSection icon={TrendingUp} label="Areas to Improve" items={insight.gaps} color="text-accent-600" />
          )}
          {insight.nextSteps.length > 0 && (
            <InsightSection icon={ArrowRight} label="Next Steps" items={insight.nextSteps} color="text-primary-600" />
          )}
          {insight.thingsToVerify.length > 0 && (
            <InsightSection icon={ShieldAlert} label="Things to Verify" items={insight.thingsToVerify} color="text-warning-600" />
          )}

          <p className="text-[10px] text-neutral-400 italic flex items-center gap-1 pt-1 border-t border-neutral-100">
            <Lightbulb className="w-3 h-3" /> AI-generated guidance. Always verify official university, scholarship, and program requirements from their official sources.
          </p>
        </div>
      )}
    </div>
  )
}

function InsightSection({ icon: Icon, label, items, color }: { icon: React.ElementType; label: string; items: string[]; color: string }) {
  return (
    <div>
      <p className={`text-xs font-semibold ${color} flex items-center gap-1 mb-1`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <ul className="space-y-1 ml-4">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-neutral-600 leading-relaxed flex items-start gap-1.5">
            <span className="text-neutral-300 mt-0.5">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
