import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import ClubCard from '../components/ClubCard';

const CATEGORIES = [
  { code: 'ALL', label: 'All Disciplines' },
  { code: 'TECHNOLOGY', label: 'Technology' },
  { code: 'ACADEMIC', label: 'Academic' },
  { code: 'ARTS', label: 'Arts' },
  { code: 'SPORTS', label: 'Sports' },
  { code: 'COMMUNITY', label: 'Community' },
];

export default function ClubDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const catFromUrl = searchParams.get('category') || 'ALL';
    const searchFromUrl = searchParams.get('search') || '';
    setSelectedCategory(catFromUrl);
    // Only overwrite the input when the URL actually differs from what is typed,
    // so trailing spaces mid-query are not stripped while the user types.
    setSearchInput((prev) => (prev.trim() === searchFromUrl ? prev : searchFromUrl));
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const params = {};
    if (searchInput.trim()) params.search = searchInput.trim();
    if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;

    apiClient
      .get('/clubs/', { params })
      .then((res) => {
        if (active) setClubs(res.data || []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.detail || 'Unable to load club directory.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchInput, selectedCategory]);

  const handleCategoryChange = (code) => {
    setSelectedCategory(code);
    const next = {};
    if (searchInput.trim()) next.search = searchInput.trim();
    if (code !== 'ALL') next.category = code;
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    const next = {};
    if (val.trim()) next.search = val.trim();
    if (selectedCategory !== 'ALL') next.category = selectedCategory;
    setSearchParams(next, { replace: true });
  };

  const handleReset = () => {
    setSearchInput('');
    setSelectedCategory('ALL');
    setSearchParams({}, { replace: true });
  };

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24 space-y-16">
      {/* Header & Filter Console */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7 space-y-4">
          <h1 className="font-display text-5xl md:text-7xl text-ink">
            Club Directory.
          </h1>
          <p className="text-lg text-ink max-w-2xl">
            Search by society name, research topic, or discipline across all chartered student
            organizations at Jahangirnagar University.
          </p>
        </div>

        <div className="lg:col-span-5">
          <label htmlFor="club-search-input" className="block text-sm font-medium text-ink mb-2">
            Search by name or keyword
          </label>
          <div className="flex gap-2">
            <input
              id="club-search-input"
              type="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="e.g. robotics, debate, darkroom..."
              className="w-full px-4 py-3 bg-surface text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {(searchInput || selectedCategory !== 'ALL') && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Discipline Filter Bar */}
      <section aria-label="Filter by discipline" className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => handleCategoryChange(cat.code)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-ground'
                    : 'bg-ground text-ink hover:bg-surfaceAlt'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted px-2">
          Showing {clubs.length} {clubs.length === 1 ? 'society' : 'societies'}
        </p>
      </section>

      {/* Results Ledger */}
      <section aria-live="polite">
        {error && (
          <div className="bg-surface p-8 text-accent font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-surface p-8 h-96 flex items-end">
                <p className="text-sm text-muted">Loading registry entry...</p>
              </div>
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="bg-surface p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h2 className="font-display text-3xl md:text-4xl text-ink">
                No matching societies found.
              </h2>
              <p className="text-base text-muted">
                No published club matched your filter criteria. Clear the search query or switch
                back to All Disciplines.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club}/>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
