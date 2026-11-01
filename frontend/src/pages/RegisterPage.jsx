import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      await login(email.trim(), password);
      navigate('/dashboard/student', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        if (typeof data.detail === 'string') {
          setError(data.detail);
        } else if (Array.isArray(data.email)) {
          setError(data.email[0]);
        } else if (Array.isArray(data.password)) {
          setError(data.password[0]);
        } else {
          setError('Could not complete registration. Check your details and try again.');
        }
      } else {
        setError('Network error while registering account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <section className="lg:col-span-7 bg-surface p-8 md:p-12 space-y-8">
          <div className="space-y-3">
            <h1 className="font-display text-5xl md:text-6xl text-ink">
              Student Registration.
            </h1>
            <p className="text-base text-ink max-w-xl">
              Register your student profile to apply for membership in chartered Jahangirnagar
              University clubs and societies.
            </p>
          </div>

          {error && (
            <div role="alert" className="bg-ground p-4 text-sm font-medium text-accent">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-ink mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Farhan Rahman"
                className="w-full px-4 py-3 bg-ground text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-ink mb-2">
                University Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-4 py-3 bg-ground text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <label htmlFor="register-password" className="block text-sm font-medium text-ink">
                  Password
                </label>
                <span id="password-constraint" className="text-xs text-muted">
                  Minimum 8 characters required
                </span>
              </div>
              <input
                id="register-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                aria-describedby="password-constraint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 bg-ground text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 bg-accent text-ground text-base font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating Student Profile...' : 'Register Student Account'}
              </button>

              <p className="text-sm text-muted">
                Already registered?{' '}
                <Link className="text-ink font-medium hover:text-accent" to="/login">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </section>

        <aside className="lg:col-span-5 bg-surface p-8 md:p-10 space-y-6">
          <h2 className="font-display text-3xl text-ink">
            Role &amp; Charter Policy.
          </h2>
          <div className="space-y-4 text-sm text-ink leading-relaxed">
            <div className="bg-ground p-5 space-y-1">
              <p className="font-medium text-ink">Default Student Standing</p>
              <p className="text-muted">
                All self-registered accounts are created with the Student role. Club Manager and
                Administrator privileges are assigned exclusively by the University Admin Desk.
              </p>
            </div>
            <div className="bg-ground p-5 space-y-1">
              <p className="font-medium text-ink">Direct Society Applications</p>
              <p className="text-muted">
                Once registered, you can apply to any published club, track pending reviews, or
                withdraw applications from your Student Memberships Desk.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
