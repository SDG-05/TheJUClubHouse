import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import apiClient from './api/client';

function PhaseTwoHarness({ title }) {
  const { user, login, logout } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    apiClient
      .get('/clubs/')
      .then((res) => setClubs(res.data))
      .catch((err) => setStatusMsg(err.message));
  }, [user]);

  const handleQuickLogin = async (email) => {
    try {
      const loggedIn = await login(email, 'Pass1234!');
      setStatusMsg(`Authenticated as ${loggedIn.name} (${loggedIn.role})`);
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-display text-5xl md:text-7xl text-ink">
            {title}
          </h1>
          <p className="text-lg text-ink max-w-xl">
            Phase 2 API Client, Mock Server, AuthContext, and Role Guard foundation is active.
            All 5 seeded accounts and 3 Jahangirnagar University clubs are loaded in memory.
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('student1@university.edu')}
              className="px-4 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors"
            >
              Test Student Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager.robotics@university.edu')}
              className="px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
            >
              Test Manager Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@university.edu')}
              className="px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
            >
              Test Admin Login
            </button>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors"
              >
                Clear Session
              </button>
            )}
          </div>

          {statusMsg && (
            <p className="text-sm text-accent font-medium">{statusMsg}</p>
          )}
        </div>

        <div className="lg:col-span-5 bg-surface p-8 space-y-6">
          <h2 className="font-display text-3xl text-ink">
            Seeded Clubs ({clubs.length})
          </h2>
          <ul className="space-y-4">
            {clubs.map((club) => (
              <li key={club.id} className="bg-ground p-5 space-y-1">
                <div className="flex items-baseline justify-between">
                  <Link className="font-display text-2xl text-ink hover:text-accent transition-colors" to={`/clubs/${club.slug}`}>
                    {club.name}
                  </Link>
                  <span className="text-sm text-muted">{club.category}</span>
                </div>
                <p className="text-sm text-muted">{club.description}</p>
              </li>
            ))}
          </ul>
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
            <Route path="/" element={<PhaseTwoHarness title="Jahangirnagar Student Societies."/>} />
            <Route path="/clubs" element={<PhaseTwoHarness title="Club Directory."/>} />
            <Route path="/clubs/:slug" element={<PhaseTwoHarness title="Club Profile."/>} />
            <Route path="/login" element={<PhaseTwoHarness title="Sign In."/>} />
            <Route path="/register" element={<PhaseTwoHarness title="Student Registration."/>} />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <PhaseTwoHarness title="Student Memberships Desk."/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manager"
              element={
                <ProtectedRoute allowedRoles={['CLUB_MANAGER', 'ADMIN']}>
                  <PhaseTwoHarness title="Club Manager Desk."/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PhaseTwoHarness title="University Admin Desk."/>
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
