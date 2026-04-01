import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  Lightbulb,
  ClipboardCheck,
  Banknote,
  Users,
  LineChart,
  Settings,
  LogOut
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const roleLinks = {
  startup: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/startup/ideas', label: 'My Ideas', icon: Lightbulb },
    { to: '/startup/submit', label: 'Submit Idea', icon: ClipboardCheck },
    { to: '/startup/investor-requests', label: 'Investor Interest', icon: Banknote }
  ],
  mentor: [
    { to: '/mentor/all-ideas', label: 'Idea Review', icon: ClipboardCheck }
  ],
  investor: [
    { to: '/investor/interests', label: 'My Interests', icon: Banknote }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users }
  ]
};

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const links = roleLinks[user?.role] || [];
  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: () => api.get('/health').then((r) => r.data),
    refetchInterval: 30000
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="card p-4 h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-semibold">V</div>
            <div>
              <p className="font-heading text-lg text-slate-900">VentureFlow</p>
              <p className="text-xs text-slate-500">Entrepreneur Hub</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="font-heading text-slate-900">{user?.name}</p>
            <p className="text-xs uppercase tracking-wide text-brand-600">{user?.role}</p>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Main Menu</p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon || LayoutDashboard;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="card p-4 mt-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
            <p className="text-xs uppercase tracking-wide text-white/70">Platform Status</p>
            <p className="font-heading text-lg mt-2">
              {healthQuery.isError ? 'Offline' : healthQuery.isLoading ? 'Checking...' : 'All systems healthy'}
            </p>
            <p className="text-xs text-white/70 mt-1">
              API: {healthQuery.isError ? 'unreachable' : 'ok'}
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="card px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart size={18} className="text-brand-600" />
              <span className="text-sm font-semibold text-slate-600">Workspace</span>
            </div>
            <div className="flex-1 mx-6 max-w-xl">
              <div className="relative">
                <input className="input pl-10" placeholder="Search resources, investors, or ideas..." />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">?</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/profile/notifications" className="btn-secondary !px-3"><Bell size={18} /></Link>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button className="btn-secondary !px-3" onClick={logout}><LogOut size={18} /></button>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
