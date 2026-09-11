import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  User, GraduationCap, ClipboardList, PenTool, Check, ChevronRight,
  ChevronLeft, Send, Save, CheckCircle2, Building2, Users, Award,
  FileText, BookOpen, Plus, Trash2, Calendar, ExternalLink, Info,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type OutletContext = { addNotification: (title: string, message: string, type?: string, link?: string) => void; userId: string }

const steps = [
  { id: 0, label: 'Colleges', icon: Building2 },
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Family', icon: Users },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Testing', icon: BookOpen },
  { id: 5, label: 'Activities', icon: ClipboardList },
  { id: 6, label: 'Honors', icon: Award },
  { id: 7, label: 'Writing', icon: PenTool },
  { id: 8, label: 'Review', icon: Check },
]

const commonAppPrompts = [
  'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
  'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
  'Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?',
  'Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?',
  'Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.',
  'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?',
  'Share an essay on any topic of your choice. It can be one you\'ve already written, one that responds to a different prompt, or one of your own design.',
]

type FormData = {
  // Step 0: Colleges
  colleges: string[]
  collegeInput: string
  applicationPlan: string
  // Step 1: Personal
  firstName: string; preferredName: string; lastName: string
  email: string; phone: string
  address: string; address2: string; city: string; state: string; zip: string; country: string
  dob: string; gender: string; pronouns: string
  citizenship: string; firstLanguage: string
  residency: string; visaType: string
  military: string
  // Step 2: Family
  parent1Name: string; parent1Occupation: string; parent1Education: string; parent1Email: string
  parent2Name: string; parent2Occupation: string; parent2Education: string; parent2Email: string
  parentMarital: string; liveWith: string
  siblings: string
  // Step 3: Education
  schoolName: string; schoolCEEB: string; schoolStartDate: string; schoolEndDate: string
  counselorName: string; counselorEmail: string; counselorPhone: string
  gpa: string; gpaScale: string; classRank: string; classSize: string
  graduationYear: string
  otherSchools: string
  collegeLevelCoursework: string
  // Step 4: Testing
  satMath: string; satReading: string; satWriting: string; satTestDate: string
  actEnglish: string; actMath: string; actReading: string; actScience: string; actComposite: string; actTestDate: string
  apScores: { subject: string; score: string }[]
  ibScores: string
  toeflScore: string; toeflDate: string
  testOptional: boolean
  // Step 5: Activities
  activities: { name: string; type: string; role: string; organization: string; description: string; hoursPerWeek: string; weeksPerYear: string; gradeLevels: string }[]
  // Step 6: Honors
  honors: { title: string; level: string; gradeLevel: string }[]
  // Step 7: Writing
  essayPrompt: number; essay1: string; essay2: string; additionalInfo: string; disciplinaryHistory: string
}

const initialFormData: FormData = {
  colleges: [], collegeInput: '', applicationPlan: '',
  firstName: '', preferredName: '', lastName: '', email: '', phone: '',
  address: '', address2: '', city: '', state: '', zip: '', country: 'United States',
  dob: '', gender: '', pronouns: '', citizenship: '', firstLanguage: '', residency: '', visaType: '', military: '',
  parent1Name: '', parent1Occupation: '', parent1Education: '', parent1Email: '',
  parent2Name: '', parent2Occupation: '', parent2Education: '', parent2Email: '',
  parentMarital: '', liveWith: '', siblings: '',
  schoolName: '', schoolCEEB: '', schoolStartDate: '', schoolEndDate: '',
  counselorName: '', counselorEmail: '', counselorPhone: '',
  gpa: '', gpaScale: '', classRank: '', classSize: '', graduationYear: '',
  otherSchools: '', collegeLevelCoursework: '',
  satMath: '', satReading: '', satWriting: '', satTestDate: '',
  actEnglish: '', actMath: '', actReading: '', actScience: '', actComposite: '', actTestDate: '',
  apScores: [], ibScores: '', toeflScore: '', toeflDate: '', testOptional: false,
  activities: [],
  honors: [],
  essayPrompt: 0, essay1: '', essay2: '', additionalInfo: '', disciplinaryHistory: '',
}

export default function ApplicationSimulator() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const { addNotification, userId } = useOutletContext<OutletContext>()

  const update = (field: keyof FormData, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }))

  const addCollege = () => {
    if (!formData.collegeInput.trim()) return
    update('colleges', [...formData.colleges, formData.collegeInput.trim()])
    update('collegeInput', '')
  }

  const removeCollege = (idx: number) => {
    update('colleges', formData.colleges.filter((_, i) => i !== idx))
  }

  const addActivity = () => {
    if (formData.activities.length >= 10) return
    update('activities', [...formData.activities, { name: '', type: '', role: '', organization: '', description: '', hoursPerWeek: '', weeksPerYear: '', gradeLevels: '' }])
  }

  const updateActivity = (index: number, field: string, value: string) => {
    const updated = [...formData.activities]
    updated[index] = { ...updated[index], [field]: value }
    update('activities', updated)
  }

  const removeActivity = (index: number) => {
    update('activities', formData.activities.filter((_, i) => i !== index))
  }

  const addHonor = () => {
    if (formData.honors.length >= 5) return
    update('honors', [...formData.honors, { title: '', level: '', gradeLevel: '' }])
  }

  const updateHonor = (index: number, field: string, value: string) => {
    const updated = [...formData.honors]
    updated[index] = { ...updated[index], [field]: value }
    update('honors', updated)
  }

  const removeHonor = (index: number) => {
    update('honors', formData.honors.filter((_, i) => i !== index))
  }

  const addApScore = () => {
    update('apScores', [...formData.apScores, { subject: '', score: '' }])
  }

  const updateApScore = (index: number, field: string, value: string) => {
    const updated = [...formData.apScores]
    updated[index] = { ...updated[index], [field]: value }
    update('apScores', updated)
  }

  const removeApScore = (index: number) => {
    update('apScores', formData.apScores.filter((_, i) => i !== index))
  }

  const buildSaveObject = (status: string) => ({
    university_name: formData.colleges.length > 0 ? formData.colleges.join(', ') : 'Practice Application',
    personal_info: {
      firstName: formData.firstName, preferredName: formData.preferredName, lastName: formData.lastName,
      email: formData.email, phone: formData.phone, address: formData.address, address2: formData.address2,
      city: formData.city, state: formData.state, zip: formData.zip, country: formData.country,
      dob: formData.dob, gender: formData.gender, pronouns: formData.pronouns,
      citizenship: formData.citizenship, firstLanguage: formData.firstLanguage,
      residency: formData.residency, visaType: formData.visaType, military: formData.military,
    },
    academic_info: {
      schoolName: formData.schoolName, counselorName: formData.counselorName, gpa: formData.gpa,
      classRank: formData.classRank, graduationYear: formData.graduationYear,
      parent1Name: formData.parent1Name, parent2Name: formData.parent2Name,
    },
    test_scores: {
      satMath: formData.satMath, satReading: formData.satReading, satWriting: formData.satWriting,
      actComposite: formData.actComposite, apScores: formData.apScores, testOptional: formData.testOptional,
    },
    extracurriculars_list: { activities: formData.activities, honors: formData.honors },
    essays: { prompt: formData.essayPrompt, essay1: formData.essay1, essay2: formData.essay2, additionalInfo: formData.additionalInfo },
    status,
    submitted_at: status === 'submitted' ? new Date().toISOString() : null,
  })

  const handleSave = async () => {
    await supabase.from('application_simulations').insert(buildSaveObject('draft'))
    await addNotification('Application Saved', 'Your Common App draft has been saved. You can continue later.', 'success')
  }

  const handleSubmit = async () => {
    await supabase.from('application_simulations').insert(buildSaveObject('submitted'))

    const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle()
    if (progress) {
      const p = progress as { xp: number; simulations_completed: number; badges: string[] }
      const newBadges = [...p.badges]
      if (!newBadges.includes('test_ready')) newBadges.push('test_ready')
      await supabase.from('user_progress').update({
        xp: p.xp + 200,
        simulations_completed: p.simulations_completed + 1,
        badges: newBadges,
      }).eq('user_id', userId)
    }

    setSubmitted(true)
    await addNotification('Application Submitted!', `Your Common App simulation has been submitted with ${formData.colleges.length} college(s). +200 XP earned!`, 'achievement', '/simulator')
  }

  const essayWordCount = formData.essay1.trim() ? formData.essay1.trim().split(/\s+/).length : 0

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="card p-8 sm:p-12 text-center fade-in">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Application Submitted!</h1>
          <p className="text-neutral-600 text-sm mb-6">
            Your Common App simulation has been successfully submitted to {formData.colleges.length} college(s).
            This is a simulation — no data was sent to any university. You earned 200 XP and the "Test Ready" badge!
          </p>
          <div className="bg-neutral-50 rounded-lg p-5 text-left mb-6">
            <h3 className="font-semibold text-sm text-neutral-800 mb-3">Application Summary</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <p><strong>Applicant:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Colleges ({formData.colleges.length}):</strong> {formData.colleges.join(', ') || 'None selected'}</p>
              <p><strong>School:</strong> {formData.schoolName || 'N/A'}</p>
              <p><strong>GPA:</strong> {formData.gpa || 'N/A'}/{formData.gpaScale || '4.0'}</p>
              <p><strong>SAT Total:</strong> {formData.satMath && formData.satReading ? Number(formData.satMath) + Number(formData.satReading) : 'Not reported'}</p>
              <p><strong>ACT Composite:</strong> {formData.actComposite || 'Not reported'}</p>
              <p><strong>Activities:</strong> {formData.activities.length} listed</p>
              <p><strong>Honors:</strong> {formData.honors.length} listed</p>
              <p><strong>Personal Essay:</strong> {essayWordCount} words {essayWordCount >= 250 && essayWordCount <= 650 ? '(within range)' : '(outside 250-650 range)'}</p>
            </div>
          </div>
          <button onClick={() => { setSubmitted(false); setStep(0); setFormData(initialFormData) }} className="btn-primary">
            Start New Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Common App-style header */}
      <div className="gradient-hero rounded-2xl p-5 sm:p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Common App Simulator</h1>
            <p className="text-white/70 text-xs mt-0.5">Full practice application — 9 sections, just like the real Common App</p>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-5 border-warning-200 bg-warning-50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-xs text-warning-700 leading-relaxed">
            <strong>Disclaimer:</strong> This simulator is for practice only and does not submit to any university.
            When you apply for real, use the official Common App at <a href="https://www.commonapp.org" target="_blank" rel="noopener noreferrer" className="underline font-medium">commonapp.org</a>.
            Always verify requirements on each college's official website.
          </p>
        </div>
      </div>

      {/* Progress Steps - Common App style sidebar/timeline */}
      <div className="card p-3 sm:p-4 mb-5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] sm:min-w-0">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setStep(s.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${step === s.id ? 'bg-primary-600 text-white scale-110' : step > s.id ? 'bg-success-500 text-white' : 'bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200'}`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-medium ${step === s.id ? 'text-primary-700' : 'text-neutral-400'}`}>{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1.5 ${step > s.id ? 'bg-success-500' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-5 sm:p-6 mb-5 fade-in" key={step}>

        {/* STEP 0: COLLEGE SELECTION */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">My Colleges</h2>
              <p className="text-sm text-neutral-500">Add the colleges you want to apply to. You can apply to up to 20 colleges through the Common App.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={formData.collegeInput}
                onChange={e => update('collegeInput', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCollege())}
                placeholder="Type a college name and press Enter..."
                className="input-field text-sm"
              />
              <button onClick={addCollege} className="btn-primary shrink-0 text-sm">
                <Plus className="w-4 h-4 inline mr-1" /> Add
              </button>
            </div>

            {formData.colleges.length > 0 ? (
              <div className="space-y-2">
                {formData.colleges.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">{i + 1}</div>
                      <span className="text-sm font-medium text-neutral-800">{c}</span>
                    </div>
                    <button onClick={() => removeCollege(i)} className="text-neutral-400 hover:text-error-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-neutral-400">{formData.colleges.length}/20 colleges added</p>
              </div>
            ) : (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Building2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No colleges added yet</p>
                <p className="text-xs text-neutral-400 mt-1">Search and add colleges to start your application</p>
              </div>
            )}

            <div className="border-t border-neutral-100 pt-4">
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Application Plan</label>
              <select value={formData.applicationPlan} onChange={e => update('applicationPlan', e.target.value)} className="input-field text-sm">
                <option value="">Select your application plan...</option>
                <option>Regular Decision</option>
                <option>Early Decision (binding)</option>
                <option>Early Action (non-binding)</option>
                <option>Rolling Admission</option>
                <option>Single-Choice Early Action</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Personal Information</h2>
              <p className="text-sm text-neutral-500">Tell us about yourself. This information is shared with all colleges.</p>
            </div>

            <SectionTitle text="Name" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="First Name" value={formData.firstName} onChange={v => update('firstName', v)} placeholder="John" />
              <Field label="Preferred Name" value={formData.preferredName} onChange={v => update('preferredName', v)} placeholder="Johnny" />
              <Field label="Last Name" value={formData.lastName} onChange={v => update('lastName', v)} placeholder="Doe" />
            </div>

            <SectionTitle text="Contact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email" value={formData.email} onChange={v => update('email', v)} placeholder="john.doe@email.com" type="email" />
              <Field label="Phone" value={formData.phone} onChange={v => update('phone', v)} placeholder="(555) 123-4567" />
            </div>

            <SectionTitle text="Address" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Field label="Street Address" value={formData.address} onChange={v => update('address', v)} placeholder="123 Main St" /></div>
              <div className="sm:col-span-2"><Field label="Address Line 2 (optional)" value={formData.address2} onChange={v => update('address2', v)} placeholder="Apt 4B" /></div>
              <Field label="City" value={formData.city} onChange={v => update('city', v)} placeholder="Boston" />
              <Field label="State" value={formData.state} onChange={v => update('state', v)} placeholder="MA" />
              <Field label="ZIP Code" value={formData.zip} onChange={v => update('zip', v)} placeholder="02101" />
              <Field label="Country" value={formData.country} onChange={v => update('country', v)} placeholder="United States" />
            </div>

            <SectionTitle text="Demographics" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Date of Birth" value={formData.dob} onChange={v => update('dob', v)} type="date" />
              <SelectField label="Gender" value={formData.gender} onChange={v => update('gender', v)} options={['', 'Female', 'Male', 'Non-binary', 'Prefer not to say', 'Self-describe']} />
              <Field label="Pronouns (optional)" value={formData.pronouns} onChange={v => update('pronouns', v)} placeholder="she/her, he/him, they/them" />
              <SelectField label="Citizenship Status" value={formData.citizenship} onChange={v => update('citizenship', v)} options={['', 'US Citizen', 'US Permanent Resident', 'US Dual Citizen', 'International (F-1 Visa)', 'International (Other)', 'Undocumented/DACA']} />
              <Field label="First Language" value={formData.firstLanguage} onChange={v => update('firstLanguage', v)} placeholder="English" />
              <SelectField label="US Military Status" value={formData.military} onChange={v => update('military', v)} options={['', 'None', 'Active Duty', 'Veteran', 'Military Dependent']} />
            </div>
          </div>
        )}

        {/* STEP 2: FAMILY */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Family Information</h2>
              <p className="text-sm text-neutral-500">Tell us about your household and parent/guardian details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField label="Parent Marital Status" value={formData.parentMarital} onChange={v => update('parentMarital', v)} options={['', 'Married', 'Divorced', 'Separated', 'Never Married', 'Widowed', 'Domestic Partnership']} />
              <SelectField label="Who do you live with?" value={formData.liveWith} onChange={v => update('liveWith', v)} options={['', 'Both Parents', 'Mother Only', 'Father Only', 'Joint Custody', 'Guardian', 'Other']} />
              <Field label="Siblings (names & ages)" value={formData.siblings} onChange={v => update('siblings', v)} placeholder="Jane (16), Bob (14)" />
            </div>

            <SectionTitle text="Parent / Guardian 1" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name" value={formData.parent1Name} onChange={v => update('parent1Name', v)} placeholder="Jane Doe" />
              <Field label="Occupation" value={formData.parent1Occupation} onChange={v => update('parent1Occupation', v)} placeholder="Software Engineer" />
              <SelectField label="Education Level" value={formData.parent1Education} onChange={v => update('parent1Education', v)} options={['', 'Some High School', 'High School Diploma', 'Some College', "Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate/Professional']} />
              <Field label="Email" value={formData.parent1Email} onChange={v => update('parent1Email', v)} placeholder="jane.doe@email.com" type="email" />
            </div>

            <SectionTitle text="Parent / Guardian 2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name" value={formData.parent2Name} onChange={v => update('parent2Name', v)} placeholder="Robert Doe" />
              <Field label="Occupation" value={formData.parent2Occupation} onChange={v => update('parent2Occupation', v)} placeholder="Teacher" />
              <SelectField label="Education Level" value={formData.parent2Education} onChange={v => update('parent2Education', v)} options={['', 'Some High School', 'High School Diploma', 'Some College', "Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate/Professional']} />
              <Field label="Email" value={formData.parent2Email} onChange={v => update('parent2Email', v)} placeholder="robert.doe@email.com" type="email" />
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Education History</h2>
              <p className="text-sm text-neutral-500">Tell us about your high school and academic record.</p>
            </div>

            <SectionTitle text="High School" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="High School Name" value={formData.schoolName} onChange={v => update('schoolName', v)} placeholder="Boston Latin School" />
              <Field label="High School CEEB Code (optional)" value={formData.schoolCEEB} onChange={v => update('schoolCEEB', v)} placeholder="310000" />
              <Field label="Start Date" value={formData.schoolStartDate} onChange={v => update('schoolStartDate', v)} type="date" />
              <Field label="End Date (expected)" value={formData.schoolEndDate} onChange={v => update('schoolEndDate', v)} type="date" />
            </div>

            <SectionTitle text="Counselor" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Counselor Name" value={formData.counselorName} onChange={v => update('counselorName', v)} placeholder="Ms. Smith" />
              <Field label="Counselor Email" value={formData.counselorEmail} onChange={v => update('counselorEmail', v)} placeholder="smith@school.edu" type="email" />
              <Field label="Counselor Phone" value={formData.counselorPhone} onChange={v => update('counselorPhone', v)} placeholder="(555) 123-4567" />
            </div>

            <SectionTitle text="Academic Record" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="GPA (unweighted)" value={formData.gpa} onChange={v => update('gpa', v)} placeholder="3.85" />
              <Field label="GPA Scale" value={formData.gpaScale} onChange={v => update('gpaScale', v)} placeholder="4.0" />
              <Field label="Class Rank" value={formData.classRank} onChange={v => update('classRank', v)} placeholder="12/350" />
              <Field label="Class Size" value={formData.classSize} onChange={v => update('classSize', v)} placeholder="350" />
              <Field label="Graduation Year" value={formData.graduationYear} onChange={v => update('graduationYear', v)} placeholder="2027" />
            </div>

            <SectionTitle text="Other" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Other High Schools Attended" value={formData.otherSchools} onChange={v => update('otherSchools', v)} placeholder="None / list school names" />
              <Field label="College-Level Coursework (dual enrollment)" value={formData.collegeLevelCoursework} onChange={v => update('collegeLevelCoursework', v)} placeholder="List any college courses taken" />
            </div>
          </div>
        )}

        {/* STEP 4: TESTING */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Standardized Testing</h2>
              <p className="text-sm text-neutral-500">Report your test scores. You can choose to be test-optional if the college allows it.</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 rounded-lg p-3 border border-neutral-200">
              <input
                type="checkbox"
                checked={formData.testOptional}
                onChange={e => update('testOptional', e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">I am applying test-optional (not submitting SAT/ACT scores)</span>
            </label>

            {!formData.testOptional && (
              <>
                <SectionTitle text="SAT Scores" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="SAT Math" value={formData.satMath} onChange={v => update('satMath', v)} placeholder="750" />
                  <Field label="SAT Reading" value={formData.satReading} onChange={v => update('satReading', v)} placeholder="730" />
                  <Field label="SAT Writing" value={formData.satWriting} onChange={v => update('satWriting', v)} placeholder="720" />
                  <Field label="Test Date" value={formData.satTestDate} onChange={v => update('satTestDate', v)} type="date" />
                </div>
                <p className="text-xs text-neutral-400">SAT Total: {formData.satMath && formData.satReading ? Number(formData.satMath) + Number(formData.satReading) : '—'}</p>

                <SectionTitle text="ACT Scores" />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <Field label="ACT English" value={formData.actEnglish} onChange={v => update('actEnglish', v)} placeholder="34" />
                  <Field label="ACT Math" value={formData.actMath} onChange={v => update('actMath', v)} placeholder="33" />
                  <Field label="ACT Reading" value={formData.actReading} onChange={v => update('actReading', v)} placeholder="35" />
                  <Field label="ACT Science" value={formData.actScience} onChange={v => update('actScience', v)} placeholder="33" />
                  <Field label="ACT Composite" value={formData.actComposite} onChange={v => update('actComposite', v)} placeholder="34" />
                </div>
                <Field label="ACT Test Date" value={formData.actTestDate} onChange={v => update('actTestDate', v)} type="date" />
              </>
            )}

            <SectionTitle text="AP Scores" />
            {formData.apScores.length > 0 && (
              <div className="space-y-2">
                {formData.apScores.map((ap, i) => (
                  <div key={i} className="flex items-center gap-2 bg-neutral-50 rounded-lg p-2 border border-neutral-200">
                    <input
                      value={ap.subject}
                      onChange={e => updateApScore(i, 'subject', e.target.value)}
                      placeholder="AP Calculus BC"
                      className="input-field text-sm flex-1"
                    />
                    <input
                      value={ap.score}
                      onChange={e => updateApScore(i, 'score', e.target.value)}
                      placeholder="Score (1-5)"
                      className="input-field text-sm w-32"
                    />
                    <button onClick={() => removeApScore(i)} className="text-neutral-400 hover:text-error-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addApScore} className="btn-secondary text-sm">
              <Plus className="w-4 h-4 inline mr-1" /> Add AP Score
            </button>

            <SectionTitle text="Other Tests" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="IB Scores" value={formData.ibScores} onChange={v => update('ibScores', v)} placeholder="HL Math: 7, HL Physics: 6..." />
              <Field label="TOEFL Score" value={formData.toeflScore} onChange={v => update('toeflScore', v)} placeholder="110" />
            </div>
          </div>
        )}

        {/* STEP 5: ACTIVITIES */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-neutral-900 text-lg mb-1">Extracurricular Activities</h2>
                <p className="text-sm text-neutral-500">List up to 10 activities in order of importance to you.</p>
              </div>
              <button onClick={addActivity} disabled={formData.activities.length >= 10} className="btn-accent text-sm disabled:opacity-40">
                <Plus className="w-4 h-4 inline mr-1" /> Add Activity
              </button>
            </div>

            {formData.activities.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <ClipboardList className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No activities added yet</p>
                <p className="text-xs text-neutral-400 mt-1">Add activities like clubs, sports, volunteer work, jobs, etc.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.activities.map((act, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700">Activity {i + 1}</span>
                      <button onClick={() => removeActivity(i)} className="text-xs text-error-500 hover:text-error-700 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Activity Name" value={act.name} onChange={v => updateActivity(i, 'name', v)} placeholder="Science Olympiad" />
                      <SelectField label="Activity Type" value={act.type} onChange={v => updateActivity(i, 'type', v)} options={['', 'Academic', 'Art', 'Athletics: Club', 'Athletics: JV/Varsity', 'Career-Oriented', 'Community Service (Volunteer)', 'Computer/Technology', 'Cultural', 'Dance', 'Debate/Speech', 'Environmental', 'Family Responsibilities', 'Foreign Exchange', 'Journalism/Publication', 'Junior R.O.T.C.', 'LGBT', 'Music: Instrumental', 'Music: Vocal', 'Religious', 'Research', 'Robotics', 'School Spirit', 'Science/Math', 'Social Justice', 'Student Govt./Politics', 'Theater', 'Work (Paid)', 'Other Club/Activity']} />
                      <Field label="Position/Role" value={act.role} onChange={v => updateActivity(i, 'role', v)} placeholder="Team Captain" />
                      <Field label="Organization" value={act.organization} onChange={v => updateActivity(i, 'organization', v)} placeholder="School Science Department" />
                      <Field label="Hours per Week" value={act.hoursPerWeek} onChange={v => updateActivity(i, 'hoursPerWeek', v)} placeholder="8" />
                      <Field label="Weeks per Year" value={act.weeksPerYear} onChange={v => updateActivity(i, 'weeksPerYear', v)} placeholder="36" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 block mb-1">Description (150 chars max — describe what you accomplished)</label>
                      <textarea
                        value={act.description}
                        onChange={e => updateActivity(i, 'description', e.target.value.slice(0, 150))}
                        placeholder="Won 1st place at state Science Olympiad. Led weekly study sessions for 15 team members."
                        rows={2}
                        className="input-field resize-none text-sm"
                      />
                      <p className="text-[10px] text-neutral-400 mt-0.5">{act.description.length}/150 characters</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-neutral-400">{formData.activities.length}/10 activities added</p>
          </div>
        )}

        {/* STEP 6: HONORS */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-neutral-900 text-lg mb-1">Honors & Awards</h2>
                <p className="text-sm text-neutral-500">List up to 5 honors or awards you've received. Order by importance.</p>
              </div>
              <button onClick={addHonor} disabled={formData.honors.length >= 5} className="btn-accent text-sm disabled:opacity-40">
                <Plus className="w-4 h-4 inline mr-1" /> Add Honor
              </button>
            </div>

            {formData.honors.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <Award className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No honors added yet</p>
                <p className="text-xs text-neutral-400 mt-1">Add awards like National Merit, AP Scholar, competition wins, etc.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.honors.map((h, i) => (
                  <div key={i} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-neutral-700">Honor {i + 1}</span>
                      <button onClick={() => removeHonor(i)} className="text-xs text-error-500 hover:text-error-700 flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Honor Title" value={h.title} onChange={v => updateHonor(i, 'title', v)} placeholder="National Merit Finalist" />
                      <SelectField label="Level" value={h.level} onChange={v => updateHonor(i, 'level', v)} options={['', 'School', 'State', 'National', 'International']} />
                      <SelectField label="Grade Level" value={h.gradeLevel} onChange={v => updateHonor(i, 'gradeLevel', v)} options={['', '9th Grade', '10th Grade', '11th Grade', '12th Grade', 'Post-Graduate']} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-neutral-400">{formData.honors.length}/5 honors added</p>
          </div>
        )}

        {/* STEP 7: WRITING */}
        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Writing</h2>
              <p className="text-sm text-neutral-500">Write your personal essay and any additional information.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Common App Personal Essay</label>
              <p className="text-xs text-neutral-500 mb-2">Select a prompt and write 250-650 words. The essay is sent to every college you apply to.</p>
              <select
                value={formData.essayPrompt}
                onChange={e => update('essayPrompt', Number(e.target.value))}
                className="input-field text-sm mb-3"
              >
                {commonAppPrompts.map((p, i) => <option key={i} value={i}>Prompt {i + 1}: {p.slice(0, 80)}...</option>)}
              </select>
              <div className="bg-primary-50/50 rounded-lg p-3 mb-3 border border-primary-100">
                <p className="text-xs text-primary-800 leading-relaxed">{commonAppPrompts[formData.essayPrompt]}</p>
              </div>
              <textarea
                value={formData.essay1}
                onChange={e => update('essay1', e.target.value)}
                placeholder="Start writing your personal essay here..."
                rows={12}
                className="input-field resize-none font-serif text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-neutral-400">{essayWordCount} words</p>
                <p className={`text-xs font-medium ${essayWordCount >= 250 && essayWordCount <= 650 ? 'text-success-600' : 'text-warning-600'}`}>
                  {essayWordCount >= 250 && essayWordCount <= 650 ? 'Within 250-650 range' : `Aim for 250-650 words`}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Additional Information (optional)</label>
              <p className="text-xs text-neutral-500 mb-2">Use this space to provide context about your situation, such as disruptions in education, family circumstances, or anything else not covered elsewhere (650 words max).</p>
              <textarea
                value={formData.additionalInfo}
                onChange={e => update('additionalInfo', e.target.value)}
                placeholder="Is there anything else you'd like colleges to know?"
                rows={6}
                className="input-field resize-none text-sm"
              />
              <p className="text-xs text-neutral-400 mt-1">{formData.additionalInfo.trim() ? formData.additionalInfo.trim().split(/\s+/).length : 0} words</p>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <label className="text-sm font-semibold text-neutral-800 block mb-2">Disciplinary History</label>
              <select value={formData.disciplinaryHistory} onChange={e => update('disciplinaryHistory', e.target.value)} className="input-field text-sm">
                <option value="">Have you ever been found responsible for a disciplinary violation?</option>
                <option>No, I have never been found responsible</option>
                <option>Yes, I have been found responsible (explain in additional info)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW */}
        {step === 8 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-neutral-900 text-lg mb-1">Review & Submit</h2>
              <p className="text-sm text-neutral-600">Review every section before submitting. This is a practice simulation.</p>
            </div>

            <ReviewSection title="Colleges" items={[
              ['Colleges Applied To', formData.colleges.join(', ') || 'None'],
              ['Application Plan', formData.applicationPlan || 'Not selected'],
            ]} />

            <ReviewSection title="Personal Information" items={[
              ['Name', `${formData.firstName} ${formData.lastName}`],
              ['Email', formData.email],
              ['Location', `${formData.city}, ${formData.state} ${formData.zip}`],
              ['Date of Birth', formData.dob || 'Not provided'],
              ['Citizenship', formData.citizenship || 'Not provided'],
            ]} />

            <ReviewSection title="Family" items={[
              ['Parent 1', formData.parent1Name || 'Not provided'],
              ['Parent 2', formData.parent2Name || 'Not provided'],
              ['Marital Status', formData.parentMarital || 'Not provided'],
            ]} />

            <ReviewSection title="Education" items={[
              ['High School', formData.schoolName || 'Not provided'],
              ['GPA', formData.gpa ? `${formData.gpa}/${formData.gpaScale || '4.0'}` : 'Not provided'],
              ['Class Rank', formData.classRank || 'Not provided'],
              ['Graduation Year', formData.graduationYear || 'Not provided'],
              ['Counselor', formData.counselorName || 'Not provided'],
            ]} />

            <ReviewSection title="Test Scores" items={[
              ['SAT Total', formData.satMath && formData.satReading ? String(Number(formData.satMath) + Number(formData.satReading)) : 'Not reported'],
              ['ACT Composite', formData.actComposite || 'Not reported'],
              ['AP Scores', formData.apScores.length > 0 ? `${formData.apScores.length} scores` : 'None'],
              ['Test Optional', formData.testOptional ? 'Yes' : 'No'],
            ]} />

            <ReviewSection title="Activities & Honors" items={[
              ['Activities', `${formData.activities.length} listed`],
              ['Honors', `${formData.honors.length} listed`],
            ]} />

            <ReviewSection title="Writing" items={[
              ['Essay Prompt', `Prompt ${formData.essayPrompt + 1}`],
              ['Personal Essay', essayWordCount > 0 ? `${essayWordCount} words` : 'Not written'],
              ['Additional Info', formData.additionalInfo ? 'Provided' : 'None'],
              ['Disciplinary History', formData.disciplinaryHistory || 'Not answered'],
            ]} />

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-xs text-warning-700 leading-relaxed">
                By submitting, you confirm that all information is accurate to the best of your knowledge.
                This is a <strong>simulation</strong> only — no data is sent to any college.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
        </button>

        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-secondary text-sm">
            <Save className="w-4 h-4 inline mr-1" /> Save Draft
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} className="btn-primary">
              Next <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-accent">
              <Send className="w-4 h-4 inline mr-1" /> Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-px flex-1 bg-neutral-100" />
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{text}</span>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-600 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field text-sm"
      />
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

function ReviewSection({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="border border-neutral-200 rounded-lg p-4">
      <h3 className="font-semibold text-sm text-neutral-800 mb-2">{title}</h3>
      <div className="space-y-1.5">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs gap-4">
            <span className="text-neutral-500 shrink-0">{label}</span>
            <span className={`font-medium text-right ${value && value !== 'None' && value !== 'Not provided' && value !== 'Not reported' && value !== 'Not selected' && value !== 'Not answered' && value !== 'Not written' ? 'text-neutral-800' : 'text-neutral-300'}`}>{value || 'Not provided'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
