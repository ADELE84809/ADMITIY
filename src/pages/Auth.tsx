import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { GraduationCap, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fn = mode === 'signin' ? signIn : signUp
    const { error: errMsg } = await fn(email, password)

    if (errMsg) {
      if (errMsg.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.')
      } else if (errMsg.includes('already registered') || errMsg.includes('already been registered')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (errMsg.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.')
      } else {
        setError(errMsg)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 -translate-x-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 translate-x-48" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/3 rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admitiy</h1>
          <p className="text-white/60 text-sm mt-1">Your College Admissions Companion</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up">
          {/* Tabs */}
          <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
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

          <h2 className="text-xl font-bold text-neutral-900 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-neutral-500 mb-5">
            {mode === 'signin'
              ? 'Sign in to access your roadmaps, progress, and saved data.'
              : 'Join Admitiy to track your college journey, build roadmaps, and practice applications.'}
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
              className="w-full py-2.5 gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : (
                <>{mode === 'signin' ? 'Sign In' : 'Create Account'}</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400 mt-5">
            {mode === 'signin' ? (
              <>Don't have an account? <button onClick={() => { setMode('signup'); setError(null) }} className="text-primary-600 font-medium hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode('signin'); setError(null) }} className="text-primary-600 font-medium hover:underline">Sign in</button></>
            )}
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-4">
          By continuing, you agree to use Admitiy for planning purposes only.
          Always verify data on official university websites.
        </p>
      </div>
    </div>
  )
}
