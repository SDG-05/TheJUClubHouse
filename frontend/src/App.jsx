import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClubDirectoryPage from './pages/ClubDirectoryPage';
import ClubProfilePage from './pages/ClubProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

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
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manager"
              element={
                <ProtectedRoute allowedRoles={['CLUB_MANAGER', 'ADMIN']}>
                  <ManagerDashboard/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard/>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage/>} />
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
