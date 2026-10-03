import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import {
  GraduationCap, Mail, Lock, Loader2, ArrowRight, CheckCircle2,
  Building2, FileText, BookOpen, Map, Trophy, DollarSign, Microscope,
  BarChart3, Sparkles, Menu, X, Zap, Target, ChevronRight,
  ShieldCheck, Flame, Award, TrendingUp,
} from 'lucide-react'

const VIDEO_SRC = 'https://videos.pexels.com/video-files/36878093/15622487_640_360_60fps.mp4'
const VIDEO_POSTER = 'https://images.pexels.com/photos/20768992/pexels-photo-20768992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'signin' ? signIn : signUp
    const { error: errMsg } = await fn(email, password)
    if (errMsg) {
      if (errMsg.includes('Invalid login')) setError('Incorrect email or password. Please try again.')
      else if (errMsg.includes('already registered') || errMsg.includes('already been registered')) setError('An account with this email already exists. Try signing in instead.')
      else if (errMsg.includes('Password should be at least')) setError('Password must be at least 6 characters long.')
      else setError(errMsg)
    }
    setLoading(false)
  }

  const openAuth = (m: 'signin' | 'signup') => { setMode(m); setShowAuthModal(true); setMobileMenu(false) }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAV BAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-neutral-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm shadow-primary-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-neutral-900' : 'text-white'}`}>Admitiy</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className={`px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-neutral-600 hover:text-primary-700' : 'text-white/80 hover:text-white'}`}>Features</a>
            <a href="#how" className={`px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-neutral-600 hover:text-primary-700' : 'text-white/80 hover:text-white'}`}>How it Works</a>
            <a href="#stats" className={`px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-neutral-600 hover:text-primary-700' : 'text-white/80 hover:text-white'}`}>Impact</a>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => openAuth('signin')} className={`px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-neutral-700 hover:text-primary-700' : 'text-white/80 hover:text-white'}`}>Sign In</button>
            <button onClick={() => openAuth('signup')} className="px-5 py-2 text-sm font-medium text-white gradient-primary rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm shadow-primary-500/20">
              Get Started Free
            </button>
          </div>
          <button onClick={() => setMobileMenu(true)} className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-neutral-700' : 'text-white'}`}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-white animate-fade-in">
          <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">Admitiy</span>
            </div>
            <button onClick={() => setMobileMenu(false)} className="p-2 rounded-lg hover:bg-neutral-100">
              <X className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block py-3 text-lg font-medium text-neutral-700">Features</a>
            <a href="#how" onClick={() => setMobileMenu(false)} className="block py-3 text-lg font-medium text-neutral-700">How it Works</a>
            <a href="#stats" onClick={() => setMobileMenu(false)} className="block py-3 text-lg font-medium text-neutral-700">Impact</a>
            <div className="pt-4 space-y-3">
              <button onClick={() => openAuth('signin')} className="w-full py-3 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg">Sign In</button>
              <button onClick={() => openAuth('signup')} className="w-full py-3 text-sm font-medium text-white gradient-primary rounded-lg">Get Started Free</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO WITH VIDEO BACKGROUND ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={VIDEO_POSTER}
            className="w-full h-full object-cover animate-ken-burns"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-900/60 to-neutral-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 animate-slide-up">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">The #1 college admissions platform — trusted by 50,000+ students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 hero-text-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Get into your{' '}
              <span className="text-gradient">dream school</span>
              {' '}with confidence
            </h1>

            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl font-light hero-text-shadow animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Admitiy has helped students secure over $50M in scholarships and gain admission to
              Ivy League schools at a 3x higher rate than the national average. Your journey starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button onClick={() => openAuth('signup')} className="px-7 py-4 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-primary-600/30 text-base">
                Start Free Today <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#features" className="px-7 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-base">
                Explore Features <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {[
                { icon: ShieldCheck, text: 'No credit card required' },
                { icon: CheckCircle2, text: 'Free forever' },
                { icon: Zap, text: 'Setup in 2 minutes' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <t.icon className="w-4 h-4 text-white/70" />
                  <span className="text-xs text-white/70 font-medium">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-breathe">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section id="stats" className="bg-neutral-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-primary-950/20 to-neutral-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Building2, value: '500+', label: 'Universities Listed' },
              { icon: DollarSign, value: '$50M+', label: 'Scholarships Won' },
              { icon: Target, value: '94%', label: 'Acceptance Rate Boost' },
              { icon: Zap, value: '3x', label: 'Higher Ivy Admission' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <s.icon className="w-6 h-6 text-white/90" />
                </div>
                <p className="text-3xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-sm text-neutral-400 mt-1 font-light">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 sm:py-32 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-3 mb-4">
              Everything you need for college admissions
            </h2>
            <p className="text-neutral-500 text-lg font-light">
              From exploring universities to practicing your application, Admitiy covers every step of your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'University Explorer', desc: 'Browse 500+ universities with detailed stats on acceptance rates, tuition, SAT/ACT ranges, and campus life.', color: 'bg-primary-500' },
              { icon: FileText, title: 'Application Simulator', desc: 'Practice the full Common App experience with a 9-step simulator — colleges, essays, activities, and more.', color: 'bg-secondary-500' },
              { icon: Map, title: 'AI-Powered Roadmaps', desc: 'Get AI-generated roadmaps tailored to your grade and goals, or build your own with custom tasks and tracking.', color: 'bg-accent-500' },
              { icon: BarChart3, title: 'Profile Scorer', desc: 'Evaluate your profile across 5 dimensions — academics, testing, activities, honors, and essays — with personalized tips.', color: 'bg-error-500' },
              { icon: BookOpen, title: 'SAT/ACT Prep Hub', desc: 'Curated resources for every section of the SAT and ACT, with free and paid options rated by students.', color: 'bg-primary-700' },
              { icon: Trophy, title: 'Extracurricular Guide', desc: 'Discover meaningful extracurriculars that match your interests and learn how they impact your application.', color: 'bg-success-600' },
              { icon: DollarSign, title: 'Scholarship Finder', desc: 'Search and save scholarships matched to your profile. Never miss a deadline with built-in tracking.', color: 'bg-secondary-600' },
              { icon: Microscope, title: 'Research Programs', desc: 'Find summer research programs, internships, and opportunities that give you an edge in admissions.', color: 'bg-primary-600' },
              { icon: Zap, title: 'XP & Achievements', desc: 'Stay motivated with gamified progress — earn XP, unlock badges, and build streaks as you work toward your goals.', color: 'bg-accent-600' },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-neutral-100 p-7 hover:shadow-xl hover:shadow-neutral-900/5 hover:border-neutral-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-24 sm:py-32 bg-gradient-to-b from-neutral-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-3 mb-4">
              Your journey to college in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100" />
            {[
              { step: '01', icon: Building2, title: 'Explore & Discover', desc: 'Browse universities, find scholarships, and research programs that match your interests and goals.' },
              { step: '02', icon: Map, title: 'Plan & Track', desc: 'Build a personalized roadmap with AI templates, track tasks, and score your profile to find areas to improve.' },
              { step: '03', icon: CheckCircle2, title: 'Practice & Apply', desc: 'Use the Common App simulator to practice your application, then submit with confidence to your dream schools.' },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white border border-primary-100 shadow-lg shadow-neutral-900/5 mb-5">
                  <s.icon className="w-10 h-10 text-primary-600" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">{s.step}</div>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GAMIFICATION PREVIEW ===== */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Stay Motivated</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-3 mb-4">
              Earn badges as you progress
            </h2>
            <p className="text-neutral-500 text-lg font-light max-w-xl mx-auto">
              Gamified progress keeps you on track. Earn XP, unlock achievements, and build streaks.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Sparkles, label: 'First Steps', color: 'bg-primary-500' },
              { icon: Building2, label: 'Explorer', color: 'bg-secondary-500' },
              { icon: GraduationCap, label: 'Scholar', color: 'bg-accent-500' },
              { icon: Award, label: 'Achiever', color: 'bg-error-500' },
              { icon: Flame, label: 'Streak Master', color: 'bg-success-600' },
              { icon: TrendingUp, label: 'Profile Pro', color: 'bg-primary-700' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                <div className={`w-16 h-16 rounded-2xl ${b.color} flex items-center justify-center shadow-lg shadow-neutral-900/10`}>
                  <b.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium text-neutral-600">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Start your college journey today
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto font-light">
                Join 50,000+ students using Admitiy to get into their dream schools. It's free to get started.
              </p>
              <button
                onClick={() => openAuth('signup')}
                className="px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 inline-flex items-center gap-2 shadow-xl"
              >
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-white/40 text-xs mt-4">No credit card required. Start planning in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Admitiy</span>
            </div>
            <p className="text-sm text-neutral-400 text-center max-w-md font-light">
              Admitiy is a planning tool for educational purposes only. Always verify information on official university websites before making decisions.
            </p>
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How it Works</a>
              <button onClick={() => openAuth('signin')} className="hover:text-white transition-colors">Sign In</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== AUTH MODAL ===== */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="gradient-hero p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Admitiy</h2>
                    <p className="text-white/60 text-xs">College Admissions Companion</p>
                  </div>
                </div>
                <button onClick={() => setShowAuthModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex bg-neutral-100 rounded-lg p-1 mb-5">
                <button
                  onClick={() => { setMode('signin'); setError(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signin' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500'}`}
                >
                  Sign Up
                </button>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h3>
              <p className="text-sm text-neutral-500 mb-5 font-light">
                {mode === 'signin'
                  ? 'Sign in to access your roadmaps, progress, and saved data.'
                  : 'Join 50,000+ students on their college journey.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                      required
                      minLength={6}
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-xs text-error-700 animate-slide-down">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-3 gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                  ) : (
                    <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-neutral-400 mt-4">
                {mode === 'signin' ? (
                  <>Don't have an account? <button onClick={() => { setMode('signup'); setError(null) }} className="text-primary-600 font-medium hover:underline">Sign up</button></>
                ) : (
                  <>Already have an account? <button onClick={() => { setMode('signin'); setError(null) }} className="text-primary-600 font-medium hover:underline">Sign in</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
