import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-24 md:py-36">
      <section className="bg-surface p-10 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8 space-y-5">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink">
            Page Not in Registry.
          </h1>
          <p className="text-lg text-ink max-w-2xl leading-relaxed">
            The address you requested does not correspond to an active page or chartered student
            society in the Jahangirnagar University Club Directory.
          </p>
        </div>

        <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-4">
          <Link className="px-6 py-3.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/">
            Return to Almanac
          </Link>
          <Link className="px-6 py-3.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to="/clubs">
            Browse Club Directory
          </Link>
        </div>
      </section>
    </main>
  );
}
