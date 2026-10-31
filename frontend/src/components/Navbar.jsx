import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `text-base font-medium transition-colors ${
    isActive ? 'text-accent' : 'text-ink hover:text-accent'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardRoute =
    user?.role === 'ADMIN'
      ? { path: '/dashboard/admin', label: 'Admin Desk' }
      : user?.role === 'CLUB_MANAGER'
      ? { path: '/dashboard/manager', label: 'Manager Desk' }
      : user?.role === 'STUDENT'
      ? { path: '/dashboard/student', label: 'My Memberships' }
      : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-surface text-ink">
      <div className="max-w-[1360px] mx-auto px-6 md:px-8 py-4 md:py-0 md:h-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Link
          className="font-display text-2xl md:text-3xl tracking-tight text-ink hover:text-accent transition-colors"
          to="/"
        >
          TheJUClubHouse
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-6 md:gap-10 order-3 md:order-2 w-full md:w-auto">
          <NavLink className={navLinkClass} end to="/">
            Almanac
          </NavLink>

          <NavLink className={navLinkClass} to="/clubs">
            Club Directory
          </NavLink>

          {dashboardRoute && (
            <NavLink className={navLinkClass} to={dashboardRoute.path}>
              {dashboardRoute.label}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4 order-2 md:order-3">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted">
                {user.name} ({user.role === 'CLUB_MANAGER' ? 'Manager' : user.role === 'ADMIN' ? 'Admin' : 'Student'})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link className="text-base font-medium text-ink hover:text-accent transition-colors" to="/login">
                Sign in
              </Link>
              <Link className="px-5 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
