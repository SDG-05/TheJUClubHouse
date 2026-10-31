import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClubDirectoryPage from './pages/ClubDirectoryPage';
import ClubProfilePage from './pages/ClubProfilePage';

function PhaseFourPlaceholder({ title }) {
  const { user, login, logout } = useAuth();

  const handleQuickLogin = async (email) => {
    await login(email, 'Pass1234!');
  };

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-display text-5xl md:text-7xl text-ink">
            {title}
          </h1>
          <p className="text-lg text-ink max-w-xl">
            This view will be replaced in Phase 4 (Auth Pages &amp; Role Dashboards). Use the quick
            role switches below to test the Phase 3 Smart Membership Button on any Club Profile.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('student1@university.edu')}
              className="px-4 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors"
            >
              Switch to Student 1
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('student2@university.edu')}
              className="px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
            >
              Switch to Student 2
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager.robotics@university.edu')}
              className="px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
            >
              Switch to Robotics Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@university.edu')}
              className="px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
            >
              Switch to Admin
            </button>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
        <div className="lg:col-span-5 bg-surface p-8 space-y-4">
          <h2 className="font-display text-3xl text-ink">Test Club Profiles</h2>
          <p className="text-sm text-muted">
            Inspect the 4-state membership button after switching roles:
          </p>
          <div className="flex flex-col gap-2">
            <Link className="p-4 bg-ground text-ink font-medium hover:text-accent" to="/clubs/robotics-club">
              Robotics Club (/clubs/robotics-club)
            </Link>
            <Link className="p-4 bg-ground text-ink font-medium hover:text-accent" to="/clubs/debate-society">
              Debate Society (/clubs/debate-society)
            </Link>
            <Link className="p-4 bg-ground text-ink font-medium hover:text-accent" to="/clubs/photography-club">
              Photography Club (/clubs/photography-club)
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-ground text-ink">
        <Navbar/>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/clubs" element={<ClubDirectoryPage/>} />
            <Route path="/clubs/:slug" element={<ClubProfilePage/>} />
            <Route path="/login" element={<PhaseFourPlaceholder title="Sign In."/>} />
            <Route path="/register" element={<PhaseFourPlaceholder title="Student Registration."/>} />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <PhaseFourPlaceholder title="Student Memberships Desk."/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manager"
              element={
                <ProtectedRoute allowedRoles={['CLUB_MANAGER', 'ADMIN']}>
                  <PhaseFourPlaceholder title="Club Manager Desk."/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PhaseFourPlaceholder title="University Admin Desk."/>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <footer className="bg-surface text-ink py-16 mt-24">
          <div className="max-w-[1360px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <p className="font-display text-4xl md:text-6xl text-ink">TheJUClubHouse</p>
              <p className="text-sm text-muted mt-2">
                Jahangirnagar University Student Societies &amp; Membership Registry · Savar, Dhaka
              </p>
            </div>
            <p className="text-sm text-muted">
              Academic Session 2026–2027
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
