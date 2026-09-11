import { Outlet } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap, Home, Building2, FileText, BookOpen, Map,
  Trophy, DollarSign, Microscope, Bell, Menu, X, Search, LogOut, BarChart3,
} from 'lucide-react'
import { supabase, type Notification } from './lib/supabase'
import { useAuth } from './lib/AuthContext'
import NotificationBell from './components/NotificationBell'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/universities', label: 'Universities', icon: Building2 },
  { path: '/simulator', label: 'App Simulator', icon: FileText },
  { path: '/sat-prep', label: 'SAT Prep', icon: BookOpen },
  { path: '/roadmaps', label: 'Roadmaps', icon: Map },
  { path: '/extracurriculars', label: 'Extracurriculars', icon: Trophy },
  { path: '/scholarships', label: 'Scholarships', icon: DollarSign },
  { path: '/research', label: 'Research', icon: Microscope },
  { path: '/profile-scorer', label: 'Profile Scorer', icon: BarChart3 },
]

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const userId = user?.id || ''

  const loadNotifications = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }, [userId])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  const addNotification = useCallback(async (title: string, message: string, type: string = 'info', link?: string) => {
    if (!userId) return
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link,
    })
    loadNotifications()
  }, [userId, loadNotifications])

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }, [])

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read)
    if (unread.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unread.map(n => n.id))
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-neutral-200 z-30">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-neutral-200">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Admitiy</h1>
            <p className="text-xs text-neutral-500">College Admissions Companion</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
        </nav>

        {/* User info + sign out */}
        <div className="px-4 py-4 border-t border-neutral-200 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-800 truncate">{user?.email || 'User'}</p>
              <p className="text-[10px] text-neutral-400">Signed in</p>
            </div>
            <button onClick={handleSignOut} className="p-1.5 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-all" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 p-3">
            <p className="text-xs font-semibold text-primary-700">Admitiy Tip</p>
            <p className="text-xs text-neutral-600 mt-1">Always verify data on official university websites before making decisions.</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">Admitiy</h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Menu className="w-5 h-5 text-neutral-700" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-neutral-900">Admitiy</h1>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(item => (
                <NavLink key={item.path} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-neutral-200 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-800 truncate">{user?.email || 'User'}</p>
                  <p className="text-[10px] text-neutral-400">Signed in</p>
                </div>
                <button onClick={handleSignOut} className="p-1.5 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-all" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-neutral-200 sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search universities, scholarships, programs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </div>
        </header>

        <main className="min-h-screen">
          <Outlet context={{ addNotification, userId }} />
        </main>
      </div>
    </div>
  )
}

function NavLink({ path, label, icon: Icon, onClick }: { path: string; label: string; icon: React.ElementType; onClick?: () => void }) {
  return (
    <a
      href={path}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200 [&.active]:bg-primary-50 [&.active]:text-primary-700 [&.active]:font-semibold"
    >
      <Icon className="w-5 h-5 shrink-0" />
      {label}
    </a>
  )
}
