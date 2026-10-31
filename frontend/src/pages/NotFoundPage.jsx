import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-8 space-y-6">
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-muted">
            Registry Error 404
          </p>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ink">
            Page Not in Registry.
          </h1>

          <p className="text-lg md:text-xl text-ink max-w-2xl leading-relaxed">
            The requested URL is not part of the Jahangirnagar University Club Directory. It may
            have been renamed, retired, or never chartered in the first place.
          </p>

          <p className="text-base text-muted max-w-xl">
            Return to the Almanac for the campus overview, or open the Club Directory to search
            every published student society.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="px-7 py-4 bg-accent text-ground text-base font-medium hover:bg-accentHover transition-colors"
            >
              Back to Almanac
            </Link>
            <Link
              to="/clubs"
              className="px-7 py-4 bg-surface text-ink text-base font-medium hover:bg-surfaceAlt transition-colors"
            >
              Open Club Directory
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4 w-full bg-ink text-ground p-8 md:p-10 space-y-6">
          <p className="font-display text-7xl md:text-8xl leading-none text-accent">404</p>
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-ground">Unlisted Route</h2>
            <p className="text-sm text-surface leading-relaxed">
              Every valid address at TheJUClubHouse resolves to a published society, a member
              dashboard, or the campus almanac.
            </p>
          </div>
          <dl className="space-y-3 pt-2 border-t border-surface/20">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-surfaceAlt">Registry</dt>
              <dd className="text-sm text-ground">JU Student Societies</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-surfaceAlt">Campus</dt>
              <dd className="text-sm text-ground">Savar, Dhaka</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-surfaceAlt">Session</dt>
              <dd className="text-sm text-ground">2026–2027</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
