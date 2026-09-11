import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, Info, AlertTriangle, Award, Clock, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Notification } from '../lib/supabase'

const iconMap: Record<string, React.ElementType> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  deadline: Clock,
  achievement: Award,
}

const typeColors: Record<string, string> = {
  info: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  deadline: 'bg-error-100 text-error-600',
  achievement: 'bg-accent-100 text-accent-600',
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-lg hover:bg-neutral-100 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-error-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-neutral-200 shadow-xl z-50 animate-slide-down overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">No notifications yet</p>
                <p className="text-xs text-neutral-400 mt-1">We'll alert you about deadlines and achievements</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = iconMap[n.type] || Info
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary-50/40' : ''}`}
                    onClick={() => onMarkAsRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type] || typeColors.info}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-neutral-900 truncate">{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.message}</p>
                        {n.link && (
                          <Link to={n.link} onClick={() => { onMarkAsRead(n.id); setOpen(false) }} className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
