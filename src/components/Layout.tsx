import { NavLink, Outlet } from 'react-router-dom';
import { Home, LayoutGrid, Network, Sparkles } from 'lucide-react';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: <Home size={18} /> },
  { to: '/support-tree', label: 'Sơ đồ hỗ trợ', icon: <Network size={18} /> },
  { to: '/seating', label: 'Chỗ ngồi', icon: <LayoutGrid size={18} /> },
  { to: '/numerology', label: 'Thần số học', icon: <Sparkles size={18} /> },
];

export default function Layout() {
  return (
    <div className="h-screen w-full flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-10">
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          <Logo />
          <span className="hidden sm:inline text-lg font-bold tracking-tight">Quản lý lớp học</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              title={link.label}
              aria-label={link.label}
              className={({ isActive }) =>
                `flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.icon}
              <span className="hidden sm:inline">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 w-full relative overflow-hidden bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
