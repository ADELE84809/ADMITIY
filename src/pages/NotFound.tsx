import { Link } from 'react-router-dom'
import { Home, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-10 h-10 text-neutral-400" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Page Not Found</h1>
        <p className="text-neutral-600 text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
