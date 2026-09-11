import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Map, Plus, Sparkles, Trash2, Check, ChevronDown, ChevronRight,
  Target, Calendar, Award, BookOpen, Trophy, DollarSign, Microscope,
  ClipboardCheck, Zap, Footprints,
} from 'lucide-react'
import { supabase, type Roadmap, type RoadmapTask } from '../lib/supabase'

type OutletContext = { addNotification: (title: string, message: string, type?: string, link?: string) => void; userId: string }

const categoryIcons: Record<string, React.ElementType> = {
  'Academic': BookOpen,
  'Test Prep': ClipboardCheck,
  'Extracurricular': Trophy,
  'Application': Target,
  'Financial': DollarSign,
  'Research': Microscope,
}

const priorityColors: Record<string, string> = {
  'Low': 'bg-neutral-100 text-neutral-600',
  'Medium': 'bg-accent-100 text-accent-700',
  'High': 'bg-error-100 text-error-700',
}

const aiTemplates = [
  {
    name: 'STEM-Focused Junior Year',
    description: 'A roadmap for STEM-interested juniors targeting top-20 universities.',
    grade: '11th Grade',
    focus: ['STEM', 'Research', 'Test Prep'],
    tasks: [
      { title: 'Take SAT/ACT diagnostic test', category: 'Test Prep', priority: 'High', xp: 20 },
      { title: 'Register for SAT/ACT spring test date', category: 'Test Prep', priority: 'High', xp: 15 },
      { title: 'Join a STEM club (Science Olympiad, Math Team, Robotics)', category: 'Extracurricular', priority: 'High', xp: 25 },
      { title: 'Apply to a summer research program (RSI, SSP, Simons)', category: 'Research', priority: 'High', xp: 30 },
      { title: 'Start an independent STEM project or research paper', category: 'Research', priority: 'Medium', xp: 25 },
      { title: 'Maintain A grades in AP Math and Science courses', category: 'Academic', priority: 'High', xp: 20 },
      { title: 'Begin building a college list (10-15 schools)', category: 'Application', priority: 'Medium', xp: 15 },
      { title: 'Attend a college fair or virtual info session', category: 'Application', priority: 'Low', xp: 10 },
    ],
  },
  {
    name: 'Balanced Sophomore Year',
    description: 'Well-rounded sophomore roadmap covering academics, activities, and early planning.',
    grade: '10th Grade',
    focus: ['Academic', 'Extracurricular', 'Test Prep'],
    tasks: [
      { title: 'Plan course schedule for junior year (include AP/IB classes)', category: 'Academic', priority: 'High', xp: 20 },
      { title: 'Join 2-3 meaningful extracurricular activities', category: 'Extracurricular', priority: 'High', xp: 25 },
      { title: 'Take PSAT/NMSQT for practice', category: 'Test Prep', priority: 'Medium', xp: 15 },
      { title: 'Start vocabulary building for SAT (10 words/week)', category: 'Test Prep', priority: 'Low', xp: 10 },
      { title: 'Begin community service with a sustained organization', category: 'Extracurricular', priority: 'Medium', xp: 15 },
      { title: 'Research potential career interests and majors', category: 'Academic', priority: 'Low', xp: 10 },
      { title: 'Build relationships with teachers for future recommendations', category: 'Academic', priority: 'Medium', xp: 15 },
      { title: 'Create a preliminary college savings/financial aid plan', category: 'Financial', priority: 'Low', xp: 10 },
    ],
  },
  {
    name: 'Senior Application Season',
    description: 'Crucial fall semester roadmap for seniors in the thick of application season.',
    grade: '12th Grade',
    focus: ['Application', 'Test Prep', 'Financial'],
    tasks: [
      { title: 'Finalize college list (6-12 schools: reach, match, safety)', category: 'Application', priority: 'High', xp: 25 },
      { title: 'Complete Common App profile and activities section', category: 'Application', priority: 'High', xp: 30 },
      { title: 'Write personal statement (draft, revise, get feedback)', category: 'Application', priority: 'High', xp: 30 },
      { title: 'Submit Early Decision/Early Action applications (Nov 1)', category: 'Application', priority: 'High', xp: 35 },
      { title: 'Request letters of recommendation (give 4+ weeks notice)', category: 'Application', priority: 'High', xp: 20 },
      { title: 'Take final SAT/ACT if needed', category: 'Test Prep', priority: 'Medium', xp: 20 },
      { title: 'Complete FAFSA and CSS Profile', category: 'Financial', priority: 'High', xp: 25 },
      { title: 'Apply to 5+ scholarships (ongoing)', category: 'Financial', priority: 'High', xp: 20 },
      { title: 'Write supplemental essays for each school', category: 'Application', priority: 'High', xp: 25 },
      { title: 'Submit regular decision applications (Jan 1)', category: 'Application', priority: 'High', xp: 35 },
    ],
  },
  {
    name: 'Pre-Med Track Preparation',
    description: 'For students interested in medicine — research, volunteering, and science focus.',
    grade: '11th Grade',
    focus: ['STEM', 'Research', 'Extracurricular'],
    tasks: [
      { title: 'Volunteer at a local hospital or clinic (sustained commitment)', category: 'Extracurricular', priority: 'High', xp: 25 },
      { title: 'Shadow a physician (ask family/friends for connections)', category: 'Research', priority: 'Medium', xp: 20 },
      { title: 'Take AP Biology and AP Chemistry', category: 'Academic', priority: 'High', xp: 20 },
      { title: 'Apply to biomedical research summer programs', category: 'Research', priority: 'High', xp: 30 },
      { title: 'Join HOSA or start a pre-med club at school', category: 'Extracurricular', priority: 'Medium', xp: 20 },
      { title: 'Research BS/MD combined programs', category: 'Application', priority: 'Low', xp: 15 },
      { title: 'Prepare for SAT/ACT with focus on science reasoning', category: 'Test Prep', priority: 'High', xp: 20 },
      { title: 'Read medical ethics books and stay informed on healthcare', category: 'Academic', priority: 'Low', xp: 10 },
    ],
  },
  {
    name: 'Humanities & Liberal Arts Focus',
    description: 'For students passionate about literature, history, writing, and social sciences.',
    grade: '11th Grade',
    focus: ['Academic', 'Extracurricular', 'Application'],
    tasks: [
      { title: 'Join debate team, school newspaper, or literary magazine', category: 'Extracurricular', priority: 'High', xp: 25 },
      { title: 'Submit writing to Scholastic Art & Writing Awards', category: 'Extracurricular', priority: 'High', xp: 25 },
      { title: 'Take AP English, AP History, and AP Government', category: 'Academic', priority: 'High', xp: 20 },
      { title: 'Apply to TASS or other humanities summer programs', category: 'Research', priority: 'High', xp: 30 },
      { title: 'Start a blog or podcast on a humanities topic you love', category: 'Extracurricular', priority: 'Medium', xp: 20 },
      { title: 'Read broadly — classic and contemporary literature', category: 'Academic', priority: 'Medium', xp: 15 },
      { title: 'Visit college campuses with strong humanities programs', category: 'Application', priority: 'Low', xp: 10 },
      { title: 'Prepare for SAT with focus on reading and writing', category: 'Test Prep', priority: 'High', xp: 20 },
    ],
  },
]

export default function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [tasks, setTasks] = useState<Record<string, RoadmapTask[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newGrade, setNewGrade] = useState('')
  const { addNotification, userId } = useOutletContext<OutletContext>()

  const loadRoadmaps = useCallback(async () => {
    const { data } = await supabase.from('roadmaps').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) {
      setRoadmaps(data as Roadmap[])
      const tasksMap: Record<string, RoadmapTask[]> = {}
      for (const rm of data as Roadmap[]) {
        const { data: taskData } = await supabase.from('roadmap_tasks').select('*').eq('roadmap_id', rm.id).order('sort_order', { ascending: true })
        tasksMap[rm.id] = (taskData || []) as RoadmapTask[]
      }
      setTasks(tasksMap)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadRoadmaps()
  }, [loadRoadmaps])

  const createRoadmap = async () => {
    if (!newTitle.trim()) return
    const { data } = await supabase.from('roadmaps').insert({
      title: newTitle,
      description: newDesc,
      target_grade: newGrade,
    }).select().single()

    if (data) {
      setRoadmaps(prev => [data as Roadmap, ...prev])
      setTasks(prev => ({ ...prev, [data.id]: [] }))
      setShowCreate(false)
      setNewTitle(''); setNewDesc(''); setNewGrade('')
      setExpandedRoadmap(data.id)

      const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle()
      if (progress) {
        const p = progress as { xp: number; badges: string[] }
        const newBadges = [...p.badges]
        if (!newBadges.includes('first_steps')) {
          newBadges.push('first_steps')
          await addNotification('Achievement Unlocked!', 'You created your first roadmap! First Steps badge earned.', 'achievement')
        }
        await supabase.from('user_progress').update({ xp: p.xp + 50, badges: newBadges }).eq('user_id', userId)
      }
      await addNotification('Roadmap Created', `"${newTitle}" is ready. Start adding tasks to track your progress!`, 'success', '/roadmaps')
    }
  }

  const createAIRoadmap = async (template: typeof aiTemplates[0]) => {
    const { data } = await supabase.from('roadmaps').insert({
      title: template.name,
      description: template.description,
      target_grade: template.grade,
      focus_areas: template.focus,
      ai_generated: true,
    }).select().single()

    if (data) {
      const taskInserts = template.tasks.map((t, i) => ({
        roadmap_id: data.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        xp_reward: t.xp,
        sort_order: i,
      }))
      const { data: insertedTasks } = await supabase.from('roadmap_tasks').insert(taskInserts).select()
      setRoadmaps(prev => [data as Roadmap, ...prev])
      setTasks(prev => ({ ...prev, [data.id]: (insertedTasks || []) as RoadmapTask[] }))
      setShowAI(false)
      setExpandedRoadmap(data.id)
      await addNotification('AI Roadmap Created!', `"${template.name}" with ${template.tasks.length} tasks is ready.`, 'success', '/roadmaps')

      const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle()
      if (progress) {
        const p = progress as { xp: number; badges: string[] }
        const newBadges = [...p.badges]
        if (!newBadges.includes('first_steps')) newBadges.push('first_steps')
        await supabase.from('user_progress').update({ xp: p.xp + 50, badges: newBadges }).eq('user_id', userId)
      }
    }
  }

  const addTask = async (roadmapId: string) => {
    const title = prompt('Task title:')
    if (!title) return
    const category = prompt('Category (Academic, Test Prep, Extracurricular, Application, Financial, Research):', 'Academic') || 'Academic'
    const priority = prompt('Priority (Low, Medium, High):', 'Medium') || 'Medium'

    const { data } = await supabase.from('roadmap_tasks').insert({
      roadmap_id: roadmapId,
      title,
      category,
      priority,
      xp_reward: 10,
      sort_order: (tasks[roadmapId]?.length || 0),
    }).select().single()

    if (data) {
      setTasks(prev => ({ ...prev, [roadmapId]: [...(prev[roadmapId] || []), data as RoadmapTask] }))
    }
  }

  const toggleTask = async (roadmapId: string, task: RoadmapTask) => {
    const newCompleted = !task.completed
    await supabase.from('roadmap_tasks').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq('id', task.id)

    setTasks(prev => ({
      ...prev,
      [roadmapId]: prev[roadmapId].map(t => t.id === task.id ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null } : t),
    }))

    if (newCompleted) {
      const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle()
      if (progress) {
        const p = progress as { xp: number; completed_tasks: number; badges: string[] }
        const newCount = p.completed_tasks + 1
        const newBadges = [...p.badges]
        if (newCount === 10 && !newBadges.includes('scholar')) {
          newBadges.push('scholar')
          await addNotification('Achievement Unlocked!', 'You completed 10 tasks! Scholar badge earned.', 'achievement')
        }
        await supabase.from('user_progress').update({
          xp: p.xp + task.xp_reward,
          completed_tasks: newCount,
          badges: newBadges,
        }).eq('user_id', userId)
      }
      await addNotification('Task Completed!', `"${task.title}" — +${task.xp_reward} XP earned!`, 'success')
    }
  }

  const deleteRoadmap = async (id: string) => {
    if (!confirm('Delete this roadmap and all its tasks?')) return
    await supabase.from('roadmaps').delete().eq('id', id)
    setRoadmaps(prev => prev.filter(r => r.id !== id))
    setTasks(prev => { const c = { ...prev }; delete c[id]; return c })
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="shimmer-bg h-20 rounded-xl mb-6" />
        <div className="shimmer-bg h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">Roadmaps</h1>
          <p className="text-neutral-600 text-sm">Create custom roadmaps or use AI-generated templates to plan your college journey step by step.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAI(true)} className="btn-accent text-sm">
            <Sparkles className="w-4 h-4 inline mr-1" /> AI Templates
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4 inline mr-1" /> Custom Roadmap
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-neutral-900 text-lg mb-4">Create Custom Roadmap</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Title</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. My Junior Year Plan" className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Description (optional)</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What's this roadmap for?" rows={2} className="input-field text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Target Grade</label>
                <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="input-field text-sm">
                  <option value="">Select grade...</option>
                  <option>9th Grade</option><option>10th Grade</option><option>11th Grade</option><option>12th Grade</option>
                </select>
              </div>
              <button onClick={createRoadmap} disabled={!newTitle.trim()} className="btn-primary w-full disabled:opacity-40">Create Roadmap</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Templates Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAI(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-neutral-900 text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-500" /> AI-Generated Roadmap Templates
            </h2>
            <p className="text-sm text-neutral-500 mb-4">Pick a template and we'll create a roadmap with pre-filled tasks. You can customize it afterwards.</p>
            <div className="space-y-3">
              {aiTemplates.map(t => (
                <div key={t.name} className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 text-sm">{t.name}</h3>
                      <p className="text-xs text-neutral-600 mt-1">{t.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge bg-neutral-100 text-neutral-600 text-xs">{t.grade}</span>
                        {t.focus.map(f => <span key={f} className="badge bg-primary-50 text-primary-600 text-xs">{f}</span>)}
                        <span className="text-xs text-neutral-400">{t.tasks.length} tasks</span>
                      </div>
                    </div>
                    <button onClick={() => createAIRoadmap(t)} className="btn-accent text-xs shrink-0">Use Template</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="card p-12 text-center">
          <Map className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">No roadmaps yet</p>
          <p className="text-sm text-neutral-400 mt-1 mb-4">Create a custom roadmap or use an AI template to get started</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setShowAI(true)} className="btn-accent text-sm">
              <Sparkles className="w-4 h-4 inline mr-1" /> Browse AI Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {roadmaps.map(rm => {
            const taskList = tasks[rm.id] || []
            const completed = taskList.filter(t => t.completed).length
            const total = taskList.length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0
            const isExpanded = expandedRoadmap === rm.id

            return (
              <div key={rm.id} className="card overflow-hidden">
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setExpandedRoadmap(isExpanded ? null : rm.id)}
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-neutral-900 text-sm">{rm.title}</h3>
                      {rm.ai_generated && <span className="badge bg-accent-100 text-accent-700 text-xs"><Sparkles className="w-3 h-3 mr-0.5" />AI</span>}
                      {rm.target_grade && <span className="badge bg-neutral-100 text-neutral-600 text-xs">{rm.target_grade}</span>}
                    </div>
                    {rm.description && <p className="text-xs text-neutral-500 mt-1">{rm.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 max-w-xs h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{completed}/{total} done ({progress}%)</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteRoadmap(rm.id) }} className="p-2 text-neutral-400 hover:text-error-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-neutral-100 p-4 space-y-2 animate-slide-down">
                    {taskList.length === 0 ? (
                      <p className="text-sm text-neutral-400 text-center py-4">No tasks yet. Add your first task to get started.</p>
                    ) : (
                      taskList.map(task => {
                        const Icon = categoryIcons[task.category || ''] || BookOpen
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${task.completed ? 'bg-success-50' : 'bg-neutral-50 hover:bg-neutral-100'}`}
                          >
                            <button
                              onClick={() => toggleTask(rm.id, task)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-success-500 text-white' : 'border-2 border-neutral-300 hover:border-primary-500'}`}
                            >
                              {task.completed && <Check className="w-3 h-3" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.completed ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{task.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 text-[10px] text-neutral-500"><Icon className="w-3 h-3" />{task.category}</span>
                                <span className={`badge ${priorityColors[task.priority] || priorityColors['Medium']} text-[10px] px-1.5 py-0`}>{task.priority}</span>
                                {task.deadline && <span className="text-[10px] text-neutral-500"><Calendar className="w-3 h-3 inline mr-0.5" />{task.deadline}</span>}
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-accent-600 font-medium shrink-0">
                              <Zap className="w-3 h-3" />{task.xp_reward} XP
                            </span>
                          </div>
                        )
                      })
                    )}
                    <button onClick={() => addTask(rm.id)} className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-1 mt-2">
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
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
