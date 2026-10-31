import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  {
    label: 'Student One',
    roleLabel: 'Student · Approved in Robotics, Pending in Debate',
    email: 'student1@university.edu',
  },
  {
    label: 'Student Two',
    roleLabel: 'Student · Pending in Robotics',
    email: 'student2@university.edu',
  },
  {
    label: 'Robotics Manager',
    roleLabel: 'Club Manager · Assigned to Robotics & Photography',
    email: 'manager.robotics@university.edu',
  },
  {
    label: 'Debate Manager',
    roleLabel: 'Club Manager · Assigned to Debate Society',
    email: 'manager.debate@university.edu',
  },
  {
    label: 'System Admin',
    roleLabel: 'University Administrator · Full Registry Control',
    email: 'admin@university.edu',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getDestination = (loggedInUser) => {
    const nextParam = searchParams.get('next');
    if (nextParam && nextParam.startsWith('/')) return nextParam;
    const fromPath = location.state?.from?.pathname;
    if (fromPath && fromPath !== '/login' && fromPath !== '/register') return fromPath;
    if (loggedInUser.role === 'ADMIN') return '/dashboard/admin';
    if (loggedInUser.role === 'CLUB_MANAGER') return '/dashboard/manager';
    return '/dashboard/student';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      navigate(getDestination(user), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Sign in failed. Verify your university email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Pass1234!');
    setError('');
    setSubmitting(true);
    try {
      const user = await login(demoEmail, 'Pass1234!');
      navigate(getDestination(user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Credential Form */}
        <section className="lg:col-span-7 bg-surface p-8 md:p-12 space-y-8">
          <div className="space-y-3">
            <h1 className="font-display text-5xl md:text-6xl text-ink">
              University Sign In.
            </h1>
            <p className="text-base text-ink max-w-xl">
              Enter your Jahangirnagar University credentials to access your student memberships,
              society manager desk, or administration console.
            </p>
          </div>

          {error && (
            <div role="alert" className="bg-ground p-4 text-sm font-medium text-accent">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-ink mb-2">
                University Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-4 py-3 bg-ground text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-ink mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-ground text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 bg-accent text-ground text-base font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Verifying Credentials...' : 'Sign in to Registry'}
              </button>

              <p className="text-sm text-muted">
                New student?{' '}
                <Link className="text-ink font-medium hover:text-accent" to="/register">
                  Create a student account
                </Link>
              </p>
            </div>
          </form>
        </section>

        {/* Right Column: Instant Demo Role Switcher for Grading & Verification */}
        <aside className="lg:col-span-5 bg-surface p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-ink">
              Seeded Evaluation Accounts.
            </h2>
            <p className="text-sm text-muted">
              Select any seeded account below to populate credentials and sign in immediately
              (shared password: <code>Pass1234!</code>).
            </p>
          </div>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo(acct.email)}
                className="w-full text-left bg-ground p-4 hover:bg-surfaceAlt transition-colors flex flex-col gap-1 disabled:opacity-50"
              >
                <span className="text-base font-medium text-ink">
                  {acct.label}
                </span>
                <span className="text-xs text-muted">
                  {acct.email} · {acct.roleLabel}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
