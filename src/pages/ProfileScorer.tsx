import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  GraduationCap, BookOpen, Trophy, Award, PenTool, BarChart3,
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, TrendingUp,
  Target, Zap, Lightbulb, ArrowRight, RefreshCw, Star,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { saveStudentProfile, type StudentProfile as AiProfile } from '../lib/ai'
import AiInsight from '../components/AiInsight'

type OutletContext = { addNotification: (title: string, message: string, type?: string, link?: string) => void; userId: string }

const scoreSteps = [
  { id: 0, label: 'Academics', icon: GraduationCap },
  { id: 1, label: 'Testing', icon: BookOpen },
  { id: 2, label: 'Activities', icon: Trophy },
  { id: 3, label: 'Honors', icon: Award },
  { id: 4, label: 'Writing', icon: PenTool },
  { id: 5, label: 'Results', icon: BarChart3 },
]

type ProfileData = {
  gpa: string
  gpaScale: string
  classRank: string
  classSize: string
  apCourses: string
  ibCourses: string
  dualEnrollment: string
  courseRigor: string
  satMath: string
  satReading: string
  actComposite: string
  testOptional: boolean
  activities: { name: string; role: string; hoursPerWeek: string; weeksPerYear: string; leadership: string; impact: string }[]
  honors: { title: string; level: string }[]
  essayProgress: string
  essayQuality: string
  supplementalEssays: string
  lettersRec: string
}

const initialData: ProfileData = {
  gpa: '', gpaScale: '4.0', classRank: '', classSize: '',
  apCourses: '', ibCourses: '', dualEnrollment: '', courseRigor: '',
  satMath: '', satReading: '', actComposite: '', testOptional: false,
  activities: [],
  honors: [],
  essayProgress: '', essayQuality: '', supplementalEssays: '', lettersRec: '',
}

export default function ProfileScorer() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfileData>(initialData)
  const [showResults, setShowResults] = useState(false)
  const { userId, addNotification } = useOutletContext<OutletContext>()

  const update = (field: keyof ProfileData, value: unknown) => setData(prev => ({ ...prev, [field]: value }))

  const addActivity = () => {
    if (data.activities.length >= 10) return
    update('activities', [...data.activities, { name: '', role: '', hoursPerWeek: '', weeksPerYear: '', leadership: '', impact: '' }])
  }
  const updateActivity = (i: number, field: string, value: string) => {
    const arr = [...data.activities]; arr[i] = { ...arr[i], [field]: value }; update('activities', arr)
  }
  const removeActivity = (i: number) => update('activities', data.activities.filter((_, idx) => idx !== i))

  const addHonor = () => {
    if (data.honors.length >= 8) return
    update('honors', [...data.honors, { title: '', level: '' }])
  }
  const updateHonor = (i: number, field: string, value: string) => {
    const arr = [...data.honors]; arr[i] = { ...arr[i], [field]: value }; update('honors', arr)
  }
  const removeHonor = (i: number) => update('honors', data.honors.filter((_, idx) => idx !== i))

  // ===== SCORING LOGIC =====
  const scores = computeScores(data)
  const overallScore = Math.round(
    scores.academics * 0.30 +
    scores.testing * 0.20 +
    scores.activities * 0.20 +
    scores.honors * 0.15 +
    scores.essays * 0.15
  )

  const handleComplete = async () => {
    setShowResults(true)
    const profileData: AiProfile = {
      gpa: data.gpa,
      gpa_scale: data.gpaScale,
      class_rank: data.classRank,
      sat_math: data.satMath ? parseInt(data.satMath) : null,
      sat_reading: data.satReading ? parseInt(data.satReading) : null,
      act_composite: data.actComposite ? parseInt(data.actComposite) : null,
      test_optional: data.testOptional,
      ap_courses: data.apCourses,
      ib_courses: data.ibCourses,
      dual_enrollment: data.dualEnrollment,
      course_rigor: data.courseRigor,
      activities: data.activities,
      honors: data.honors,
      essay_progress: data.essayProgress,
    }
    await saveStudentProfile(profileData).catch(() => {})
    await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle().then(async ({ data: prog }) => {
      if (prog) {
        const p = prog as { xp: number; badges: string[] }
        const newBadges = [...p.badges]
        if (!newBadges.includes('explorer')) newBadges.push('explorer')
        await supabase.from('user_progress').update({ xp: p.xp + 150, badges: newBadges }).eq('user_id', userId)
      }
    })
    await addNotification('Profile Scored!', `Your profile scored ${overallScore}/100. Check your results for personalized tips.`, 'achievement', '/profile-scorer')
    setStep(5)
  }

  if (showResults || step === 5) {
    return <Results data={data} scores={scores} overall={overallScore} onReset={() => { setShowResults(false); setStep(0); setData(initialData) }} />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-5 sm:p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Scorer</h1>
            <p className="text-white/70 text-xs mt-0.5">Evaluate your college application profile across 5 key dimensions</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card p-3 sm:p-4 mb-5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[520px] sm:min-w-0">
          {scoreSteps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => s.id < 5 && setStep(s.id)} className="flex flex-col items-center gap-1 group">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${step === s.id ? 'bg-primary-600 text-white scale-110' : step > s.id ? 'bg-success-500 text-white' : 'bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200'}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-medium ${step === s.id ? 'text-primary-700' : 'text-neutral-400'}`}>{s.label}</span>
              </button>
              {i < scoreSteps.length - 1 && <div className={`h-0.5 flex-1 mx-1.5 ${step > s.id ? 'bg-success-500' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-5 sm:p-6 mb-5 fade-in" key={step}>

        {/* STEP 0: ACADEMICS */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Academic Profile</h2>
              <p className="text-sm text-neutral-500">Tell us about your grades and course rigor. This is the most important factor in college admissions.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="GPA (unweighted)" value={data.gpa} onChange={v => update('gpa', v)} placeholder="3.85" />
              <Field label="GPA Scale" value={data.gpaScale} onChange={v => update('gpaScale', v)} placeholder="4.0" />
              <Field label="Class Rank (e.g. 12/350)" value={data.classRank} onChange={v => update('classRank', v)} placeholder="12/350" />
              <Field label="Class Size" value={data.classSize} onChange={v => update('classSize', v)} placeholder="350" />
              <Field label="AP Courses Taken" value={data.apCourses} onChange={v => update('apCourses', v)} placeholder="AP Calc BC, AP Physics, APUSH..." />
              <Field label="IB Courses Taken" value={data.ibCourses} onChange={v => update('ibCourses', v)} placeholder="HL Math, HL Chemistry..." />
              <Field label="Dual Enrollment / College Courses" value={data.dualEnrollment} onChange={v => update('dualEnrollment', v)} placeholder="List any college courses..." />
              <SelectField label="Course Rigor vs. Available" value={data.courseRigor} onChange={v => update('courseRigor', v)} options={['', 'Most rigorous available', 'Very rigorous', 'Moderately rigorous', 'Standard curriculum']} />
            </div>
          </div>
        )}

        {/* STEP 1: TESTING */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Test Scores</h2>
              <p className="text-sm text-neutral-500">Enter your standardized test scores. If applying test-optional, indicate that below.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <input type="checkbox" checked={data.testOptional} onChange={e => update('testOptional', e.target.checked)} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-neutral-700">I am applying test-optional</span>
            </label>
            {!data.testOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="SAT Math" value={data.satMath} onChange={v => update('satMath', v)} placeholder="750" />
                <Field label="SAT Reading & Writing" value={data.satReading} onChange={v => update('satReading', v)} placeholder="730" />
                <Field label="ACT Composite" value={data.actComposite} onChange={v => update('actComposite', v)} placeholder="34" />
              </div>
            )}
            {data.satMath && data.satReading && (
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                <p className="text-sm font-semibold text-primary-800">SAT Total: {Number(data.satMath) + Number(data.satReading)}</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ACTIVITIES */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-neutral-900 text-lg mb-1">Extracurricular Activities</h2>
                <p className="text-sm text-neutral-500">List up to 10 activities. Quality and depth matter more than quantity.</p>
              </div>
              <button onClick={addActivity} disabled={data.activities.length >= 10} className="btn-accent text-sm disabled:opacity-40">
                <Trophy className="w-4 h-4 inline mr-1" /> Add Activity
              </button>
            </div>
            {data.activities.length === 0 ? (
              <EmptyState icon={Trophy} text="No activities added yet" subtext="Add clubs, sports, volunteer work, jobs, research, etc." />
            ) : (
              <div className="space-y-3">
                {data.activities.map((act, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700">Activity {i + 1}</span>
                      <button onClick={() => removeActivity(i)} className="text-xs text-error-500 hover:text-error-700">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Activity Name" value={act.name} onChange={v => updateActivity(i, 'name', v)} placeholder="Science Olympiad" />
                      <Field label="Role / Position" value={act.role} onChange={v => updateActivity(i, 'role', v)} placeholder="Team Captain" />
                      <Field label="Hours per Week" value={act.hoursPerWeek} onChange={v => updateActivity(i, 'hoursPerWeek', v)} placeholder="8" />
                      <Field label="Weeks per Year" value={act.weeksPerYear} onChange={v => updateActivity(i, 'weeksPerYear', v)} placeholder="36" />
                      <SelectField label="Leadership Level" value={act.leadership} onChange={v => updateActivity(i, 'leadership', v)} options={['', 'No leadership', 'Member/Participant', 'Leadership role', 'Founder/President', 'Regional/State/National leadership']} />
                      <SelectField label="Impact Level" value={act.impact} onChange={v => updateActivity(i, 'impact', v)} options={['', 'Minimal impact', 'Some impact on school/community', 'Significant impact on community', 'Regional/state/national impact', 'International recognition']} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-neutral-400">{data.activities.length}/10 activities added</p>
          </div>
        )}

        {/* STEP 3: HONORS */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-neutral-900 text-lg mb-1">Honors & Awards</h2>
                <p className="text-sm text-neutral-500">List up to 8 honors or awards. Higher-level awards carry more weight.</p>
              </div>
              <button onClick={addHonor} disabled={data.honors.length >= 8} className="btn-accent text-sm disabled:opacity-40">
                <Award className="w-4 h-4 inline mr-1" /> Add Honor
              </button>
            </div>
            {data.honors.length === 0 ? (
              <EmptyState icon={Award} text="No honors added yet" subtext="Add awards like National Merit, competition wins, etc." />
            ) : (
              <div className="space-y-3">
                {data.honors.map((h, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-neutral-700">Honor {i + 1}</span>
                      <button onClick={() => removeHonor(i)} className="text-xs text-error-500 hover:text-error-700">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Honor Title" value={h.title} onChange={v => updateHonor(i, 'title', v)} placeholder="National Merit Finalist" />
                      <SelectField label="Level" value={h.level} onChange={v => updateHonor(i, 'level', v)} options={['', 'School-level', 'Regional/District', 'State', 'National', 'International']} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-neutral-400">{data.honors.length}/8 honors added</p>
          </div>
        )}

        {/* STEP 4: WRITING */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Essays & Recommendations</h2>
              <p className="text-sm text-neutral-500">Tell us about your essay progress and recommendation letters.</p>
            </div>
            <div className="space-y-4">
              <SelectFieldLarge label="Personal Essay Progress" value={data.essayProgress} onChange={v => update('essayProgress', v)} options={['', 'Not started', 'Brainstorming ideas', 'First draft complete', 'Revised with feedback', 'Final polish complete']} />
              <SelectFieldLarge label="Personal Essay Quality (self-assessed)" value={data.essayQuality} onChange={v => update('essayQuality', v)} options={['', 'Basic / generic', 'Shows personality but could be deeper', 'Compelling and personal', 'Exceptional — unique story, powerful writing']} />
              <SelectFieldLarge label="Supplemental Essays" value={data.supplementalEssays} onChange={v => update('supplementalEssays', v)} options={['', 'Not started', 'Working on drafts', 'Most drafts complete', 'All supplemental essays finalized']} />
              <SelectFieldLarge label="Letters of Recommendation" value={data.lettersRec} onChange={v => update('lettersRec', v)} options={['', 'Not yet requested', 'Requested, pending', 'Confirmed from 2 teachers', 'Confirmed from 3+ strong recommenders']} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(Math.min(4, step + 1))} className="btn-primary">
            Next <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        ) : (
          <button onClick={handleComplete} className="btn-accent">
            <BarChart3 className="w-4 h-4 inline mr-1" /> Calculate My Score
          </button>
        )}
      </div>
    </div>
  )
}

// ===== SCORING ENGINE =====
function computeScores(data: ProfileData) {
  // ACADEMICS (0-100)
  let acadScore = 0
  const gpa = parseFloat(data.gpa) || 0
  const scale = parseFloat(data.gpaScale) || 4.0
  const gpaPercent = Math.min(gpa / scale, 1)
  acadScore += gpaPercent * 50
  if (data.classRank && data.classSize) {
    const rank = parseInt(data.classRank.split('/')[0])
    const size = parseInt(data.classSize)
    if (rank && size) {
      const rankPercent = rank / size
      if (rankPercent <= 0.01) acadScore += 25
      else if (rankPercent <= 0.05) acadScore += 20
      else if (rankPercent <= 0.10) acadScore += 15
      else if (rankPercent <= 0.25) acadScore += 8
    }
  }
  const apCount = data.apCourses ? data.apCourses.split(',').filter(Boolean).length : 0
  const ibCount = data.ibCourses ? data.ibCourses.split(',').filter(Boolean).length : 0
  const dualCount = data.dualEnrollment ? data.dualEnrollment.split(',').filter(Boolean).length : 0
  const totalAdv = apCount + ibCount + dualCount
  if (totalAdv >= 10) acadScore += 25
  else if (totalAdv >= 7) acadScore += 20
  else if (totalAdv >= 5) acadScore += 15
  else if (totalAdv >= 3) acadScore += 10
  else if (totalAdv >= 1) acadScore += 5
  const rigorMap: Record<string, number> = { 'Most rigorous available': 0, 'Very rigorous': -3, 'Moderately rigorous': -8, 'Standard curriculum': -15 }
  acadScore += rigorMap[data.courseRigor] || 0
  acadScore = Math.max(0, Math.min(100, acadScore))

  // TESTING (0-100)
  let testScore = 0
  if (data.testOptional) {
    testScore = 60 // neutral if test-optional
  } else {
    const satTotal = (parseInt(data.satMath) || 0) + (parseInt(data.satReading) || 0)
    if (satTotal > 0) {
      if (satTotal >= 1550) testScore = 100
      else if (satTotal >= 1500) testScore = 92
      else if (satTotal >= 1450) testScore = 82
      else if (satTotal >= 1400) testScore = 72
      else if (satTotal >= 1350) testScore = 62
      else if (satTotal >= 1300) testScore = 52
      else if (satTotal >= 1200) testScore = 40
      else if (satTotal >= 1100) testScore = 30
      else testScore = 20
    }
    const act = parseInt(data.actComposite) || 0
    if (act > 0) {
      if (act >= 35) testScore = Math.max(testScore, 98)
      else if (act >= 34) testScore = Math.max(testScore, 92)
      else if (act >= 33) testScore = Math.max(testScore, 85)
      else if (act >= 32) testScore = Math.max(testScore, 78)
      else if (act >= 31) testScore = Math.max(testScore, 70)
      else if (act >= 30) testScore = Math.max(testScore, 62)
      else if (act >= 28) testScore = Math.max(testScore, 50)
      else if (act >= 26) testScore = Math.max(testScore, 40)
      else testScore = Math.max(testScore, 25)
    }
  }

  // ACTIVITIES (0-100)
  let actScore = 0
  const acts = data.activities.filter(a => a.name.trim())
  actScore += Math.min(acts.length * 8, 40)
  let leadershipPoints = 0
  let impactPoints = 0
  let depthPoints = 0
  for (const a of acts) {
    const leadMap: Record<string, number> = { 'No leadership': 0, 'Member/Participant': 2, 'Leadership role': 6, 'Founder/President': 10, 'Regional/State/National leadership': 12 }
    leadershipPoints += leadMap[a.leadership] || 0
    const impactMap: Record<string, number> = { 'Minimal impact': 0, 'Some impact on school/community': 4, 'Significant impact on community': 8, 'Regional/state/national impact': 12, 'International recognition': 15 }
    impactPoints += impactMap[a.impact] || 0
    const hrs = parseInt(a.hoursPerWeek) || 0
    const wks = parseInt(a.weeksPerYear) || 0
    if (hrs >= 5 && wks >= 30) depthPoints += 3
  }
  actScore += Math.min(leadershipPoints, 25)
  actScore += Math.min(impactPoints, 25)
  actScore += Math.min(depthPoints, 10)
  actScore = Math.max(0, Math.min(100, actScore))

  // HONORS (0-100)
  let honorScore = 0
  const honors = data.honors.filter(h => h.title.trim())
  honorScore += Math.min(honors.length * 8, 32)
  for (const h of honors) {
    const levelMap: Record<string, number> = { 'School-level': 3, 'Regional/District': 8, 'State': 13, 'National': 20, 'International': 25 }
    honorScore += levelMap[h.level] || 0
  }
  honorScore = Math.max(0, Math.min(100, honorScore))

  // ESSAYS (0-100)
  let essayScore = 0
  const progMap: Record<string, number> = { 'Not started': 0, 'Brainstorming ideas': 15, 'First draft complete': 35, 'Revised with feedback': 60, 'Final polish complete': 80 }
  essayScore += progMap[data.essayProgress] || 0
  const qualMap: Record<string, number> = { 'Basic / generic': 0, 'Shows personality but could be deeper': 8, 'Compelling and personal': 15, 'Exceptional — unique story, powerful writing': 20 }
  essayScore += qualMap[data.essayQuality] || 0
  const suppMap: Record<string, number> = { 'Not started': 0, 'Working on drafts': 5, 'Most drafts complete': 10, 'All supplemental essays finalized': 15 }
  essayScore += suppMap[data.supplementalEssays] || 0
  const recMap: Record<string, number> = { 'Not yet requested': 0, 'Requested, pending': 5, 'Confirmed from 2 teachers': 10, 'Confirmed from 3+ strong recommenders': 15 }
  essayScore += recMap[data.lettersRec] || 0
  essayScore = Math.max(0, Math.min(100, essayScore))

  return { academics: acadScore, testing: testScore, activities: actScore, honors: honorScore, essays: essayScore }
}

// ===== RESULTS COMPONENT =====
function Results({ data, scores, overall, onReset }: { data: ProfileData; scores: { academics: number; testing: number; activities: number; honors: number; essays: number }; overall: number; onReset: () => void }) {
  const categoryLabels = [
    { key: 'academics', label: 'Academics', icon: GraduationCap, score: scores.academics, weight: '30%' },
    { key: 'testing', label: 'Test Scores', icon: BookOpen, score: scores.testing, weight: '20%' },
    { key: 'activities', label: 'Activities', icon: Trophy, score: scores.activities, weight: '20%' },
    { key: 'honors', label: 'Honors & Awards', icon: Award, score: scores.honors, weight: '15%' },
    { key: 'essays', label: 'Essays & Recs', icon: PenTool, score: scores.essays, weight: '15%' },
  ]

  const tier = getTier(overall)
  const tips = generateTips(data, scores)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Overall Score Hero */}
      <div className="gradient-hero rounded-2xl p-6 sm:p-8 text-white mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/3 rounded-full translate-y-24" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="white" strokeWidth="8" fill="none"
                strokeDasharray={`${(overall / 100) * 327} 327`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{overall}</span>
              <span className="text-xs text-white/60">out of 100</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white/70 text-sm font-medium mb-1">Your Profile Score</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{tier.label}</h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg">{tier.description}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" /> Category Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categoryLabels.map(cat => (
            <div key={cat.key} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-lg ${getScoreColor(cat.score)} flex items-center justify-center`}>
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">{cat.label}</p>
                  <p className="text-[10px] text-neutral-400">Weight: {cat.weight}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-neutral-900">{cat.score}</span>
                <span className="text-xs text-neutral-400">/100</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(cat.score)}`} style={{ width: `${cat.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Profile Analysis */}
      <div className="mb-5">
        <AiInsight type="profile_analysis" title="AI Profile Analysis" />
      </div>

      {/* Recommendations */}
      <div className="card p-5 sm:p-6 mb-5">
        <h2 className="text-lg font-bold text-neutral-900 mb-1 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent-500" /> Personalized Recommendations
        </h2>
        <p className="text-sm text-neutral-500 mb-4">Based on your profile, here are actionable steps to strengthen your application.</p>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${tip.type === 'strength' ? 'bg-success-50 border border-success-200' : tip.type === 'warning' ? 'bg-warning-50 border border-warning-200' : 'bg-primary-50 border border-primary-200'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${tip.type === 'strength' ? 'bg-success-100' : tip.type === 'warning' ? 'bg-warning-100' : 'bg-primary-100'}`}>
                {tip.type === 'strength' ? <CheckCircle2 className="w-4 h-4 text-success-600" /> : tip.type === 'warning' ? <AlertCircle className="w-4 h-4 text-warning-600" /> : <TrendingUp className="w-4 h-4 text-primary-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{tip.title}</p>
                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{tip.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitiveness Indicator */}
      <div className="card p-5 mb-5">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" /> College Competitiveness Level
        </h2>
        <div className="space-y-3">
          {competitivenessLevels.map(level => {
            const isActive = overall >= level.min && overall <= level.max
            return (
              <div key={level.label} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-primary-50 border-2 border-primary-300' : 'bg-neutral-50 border border-neutral-200 opacity-60'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'gradient-primary' : 'bg-neutral-200'}`}>
                  <Star className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-800">{level.label}</p>
                    <span className="text-xs text-neutral-500">{level.range}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{level.description}</p>
                </div>
                {isActive && <Zap className="w-5 h-5 text-primary-600 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 border-warning-200 bg-warning-50 mb-5">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-xs text-warning-700 leading-relaxed">
            <strong>Disclaimer:</strong> This score is an estimate based on self-reported data and general admissions trends.
            It does not guarantee admission outcomes. College admissions consider many qualitative factors beyond what this tool measures.
            Always research specific college requirements and craft an authentic application.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onReset} className="btn-secondary">
          <RefreshCw className="w-4 h-4 inline mr-1" /> Recalculate
        </button>
      </div>
    </div>
  )
}

// ===== HELPERS =====
function getTier(score: number) {
  if (score >= 90) return { label: 'Exceptional Profile', description: 'Outstanding across all dimensions. You are competitive at the most selective universities in the country, including Ivy League and top-20 schools.' }
  if (score >= 80) return { label: 'Strong Profile', description: 'A very strong profile that makes you competitive at highly selective universities. Focus on differentiation and essays to stand out.' }
  if (score >= 70) return { label: 'Solid Profile', description: 'A solid profile competitive at many selective universities. Strengthen weaker areas to broaden your options.' }
  if (score >= 55) return { label: 'Developing Profile', description: 'A developing profile with room for growth. Focus on the recommendations below to boost your competitiveness.' }
  return { label: 'Early Stage Profile', description: 'Your profile is in its early stages. Thats okay! Focus on the recommendations to build a stronger application over time.' }
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-success-500'
  if (score >= 65) return 'bg-primary-500'
  if (score >= 45) return 'bg-accent-500'
  return 'bg-error-500'
}

function getScoreBarColor(score: number) {
  if (score >= 80) return 'bg-success-500'
  if (score >= 65) return 'bg-primary-500'
  if (score >= 45) return 'bg-accent-500'
  return 'bg-error-500'
}

const competitivenessLevels = [
  { label: 'Ivy League / Top 10', range: 'Score 90-100', min: 90, max: 100, description: 'Harvard, MIT, Stanford, Princeton, Yale, etc.' },
  { label: 'Highly Selective', range: 'Score 78-89', min: 78, max: 89, description: 'Top 20-50 universities and top liberal arts colleges' },
  { label: 'Very Selective', range: 'Score 65-77', min: 65, max: 77, description: 'Top 50-100 universities, strong state flagships' },
  { label: 'Selective', range: 'Score 50-64', min: 50, max: 64, description: 'Many public universities and regional schools' },
  { label: 'Building Foundation', range: 'Score 0-49', min: 0, max: 49, description: 'Focus on strengthening your profile. Community colleges and open-admission schools are great starting points.' },
]

function generateTips(data: ProfileData, scores: { academics: number; testing: number; activities: number; honors: number; essays: number }): { type: 'strength' | 'warning' | 'improvement'; title: string; detail: string }[] {
  const tips: { type: 'strength' | 'warning' | 'improvement'; title: string; detail: string }[] = []

  // Strengths
  if (scores.academics >= 80) tips.push({ type: 'strength', title: 'Strong Academic Record', detail: 'Your GPA and course rigor are impressive. This is the foundation of a competitive application.' })
  if (scores.testing >= 85) tips.push({ type: 'strength', title: 'Excellent Test Scores', detail: 'Your test scores put you in a strong position. Consider submitting them even to test-optional schools.' })
  if (scores.activities >= 70) tips.push({ type: 'strength', title: 'Strong Extracurriculars', detail: 'Your activities show depth and leadership. Keep up the commitment and quantify your impact in applications.' })

  // Warnings
  if (scores.academics < 50) tips.push({ type: 'warning', title: 'Strengthen Your Academics', detail: 'Focus on improving your GPA and taking more challenging courses. Academics are the single most important factor in admissions.' })
  if (scores.essays < 40) tips.push({ type: 'warning', title: 'Start Your Essays Now', detail: 'Essays can make or break an application. Start brainstorming early and get feedback from teachers or mentors.' })
  if (!data.testOptional && scores.testing < 50 && !data.satMath && !data.actComposite) tips.push({ type: 'warning', title: 'Prepare for Standardized Tests', detail: 'You have not entered test scores. Start a structured prep plan or consider test-optional schools.' })

  // Improvements
  if (scores.activities < 60) tips.push({ type: 'improvement', title: 'Deepen Your Extracurriculars', detail: 'Focus on 2-3 activities with sustained commitment and leadership. Quality matters more than quantity.' })
  if (scores.honors < 50) tips.push({ type: 'improvement', title: 'Pursue Awards and Recognition', detail: 'Enter competitions, apply for distinctions like National Merit, or seek regional/state-level recognition in your strongest areas.' })
  if (data.essayProgress === 'Not started' || !data.essayProgress) tips.push({ type: 'improvement', title: 'Begin Your Personal Essay', detail: 'Start with brainstorming. Reflect on a meaningful experience, challenge, or passion. Aim for a unique, authentic story.' })
  if (data.lettersRec === 'Not yet requested' || !data.lettersRec) tips.push({ type: 'improvement', title: 'Request Recommendation Letters', detail: 'Ask teachers who know you well, ideally in core subjects. Give them at least 4 weeks before deadlines.' })
  if (scores.academics >= 60 && scores.academics < 80) tips.push({ type: 'improvement', title: 'Boost Course Rigor', detail: 'If available, add AP/IB or dual enrollment courses. Colleges want to see you challenging yourself.' })

  if (tips.length === 0) tips.push({ type: 'strength', title: 'Well-Rounded Profile', detail: 'Your profile is balanced across all categories. Keep refining and polishing every aspect.' })
  return tips
}

// ===== UI COMPONENTS =====
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-600 block mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-field text-sm" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-600 block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm">
        {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
      </select>
    </div>
  )
}

function SelectFieldLarge({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-sm font-semibold text-neutral-800 block mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm">
        {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
      </select>
    </div>
  )
}

function EmptyState({ icon: Icon, text, subtext }: { icon: React.ElementType; text: string; subtext: string }) {
  return (
    <div className="text-center py-8 bg-neutral-50 rounded-lg">
      <Icon className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
      <p className="text-sm text-neutral-500">{text}</p>
      <p className="text-xs text-neutral-400 mt-1">{subtext}</p>
    </div>
  )
}
