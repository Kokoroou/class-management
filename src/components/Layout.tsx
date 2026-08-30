import { NavLink, Outlet } from 'react-router-dom';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/support-tree', label: 'Sơ đồ hỗ trợ' },
  { to: '/seating', label: 'Chỗ ngồi' },
];

export default function Layout() {
  return (
    <div className="h-screen w-full flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
        <NavLink to="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-bold tracking-tight">Quản lý lớp học</span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
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
