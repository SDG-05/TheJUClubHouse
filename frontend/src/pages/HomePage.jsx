import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import ClubCard from '../components/ClubCard';
import ClubVisualPlate, { formatCategory } from '../components/ClubVisualPlate';

const CAMPUS_WINDOWS = [
  {
    id: 'ALL',
    label: 'All Campus Windows',
    venue: 'TSC, Faculty Labs & Zahir Raihan Auditorium',
    categories: ['TECHNOLOGY', 'ACADEMIC', 'ARTS', 'SPORTS', 'COMMUNITY'],
  },
  {
    id: 'LABS',
    label: 'Evening Faculty Labs (5 PM – 8 PM)',
    venue: 'Mathematical & Physical Sciences Building',
    categories: ['TECHNOLOGY'],
  },
  {
    id: 'TSC',
    label: 'Afternoon TSC Plinth (3 PM – 6 PM)',
    venue: 'Teacher-Student Centre Amphitheatre',
    categories: ['ACADEMIC', 'COMMUNITY'],
  },
  {
    id: 'AUDITORIUM',
    label: 'Weekend Lakeside & Auditorium (10 AM – 4 PM)',
    venue: 'Zahir Raihan Auditorium & Prantik Lake',
    categories: ['ARTS', 'SPORTS'],
  },
];

const DISCIPLINES = [
  {
    code: 'TECHNOLOGY',
    title: 'Technology & Engineering',
    summary: 'Autonomous rovers, embedded hardware, and competitive systems workshops.',
    meetingSpot: 'MPS Faculty Lab Wing',
  },
  {
    code: 'ACADEMIC',
    title: 'Academic & Rhetoric',
    summary: 'Parliamentary debate motions, public policy forums, and research reading circles.',
    meetingSpot: 'TSC Seminar Hall',
  },
  {
    code: 'ARTS',
    title: 'Visual & Performing Arts',
    summary: 'Analogue darkroom walks, campus biodiversity photography, and stage exhibitions.',
    meetingSpot: 'Zahir Raihan Auditorium',
  },
  {
    code: 'SPORTS',
    title: 'Athletics & Field Sports',
    summary: 'Inter-hall tournaments, endurance training, and central playground fixtures.',
    meetingSpot: 'Central Gymnasium Ground',
  },
  {
    code: 'COMMUNITY',
    title: 'Community & Service',
    summary: 'Environmental conservation, migratory bird census, and campus welfare drives.',
    meetingSpot: 'Chourangi Square',
  },
];

export default function HomePage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWindow, setSelectedWindow] = useState('ALL');

  useEffect(() => {
    let active = true;
    apiClient
      .get('/clubs/')
      .then((res) => {
        if (active) setClubs(res.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const currentWindowObj = useMemo(
    () => CAMPUS_WINDOWS.find((w) => w.id === selectedWindow) || CAMPUS_WINDOWS[0],
    [selectedWindow]
  );

  const matchedClubs = useMemo(() => {
    if (selectedWindow === 'ALL') return clubs;
    return clubs.filter((c) => currentWindowObj.categories.includes(c.category));
  }, [clubs, selectedWindow, currentWindowObj]);

  const spotlightClub = matchedClubs[0] || clubs[0] || null;

  return (
    <main>
      {/* SECTION 1: Hero Blueprint */}
      <section className="max-w-[1360px] mx-auto px-6 md:px-8 pt-14 pb-24 md:pt-20 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7 space-y-8">
            <h1 className="font-display text-[2.6rem] sm:text-7xl lg:text-[5.4rem] text-ink">
              Jahangirnagar Student Societies.
            </h1>

            <p className="text-lg md:text-xl text-ink max-w-2xl leading-relaxed">
              The official registry of autonomous clubs, debate unions, and research collectives
              at Jahangirnagar University. Inspect active rosters and apply for membership with
              your student credentials.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link className="px-7 py-4 bg-accent text-ground text-base font-medium hover:bg-accentHover transition-colors" to="/clubs">
                Browse All Societies
              </Link>
              <Link className="px-7 py-4 bg-surface text-ink text-base font-medium hover:bg-surfaceAlt transition-colors" to="/register">
                Student Registration
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface p-8 md:p-10 space-y-6">
            {spotlightClub ? (
              <>
                <ClubVisualPlate club={spotlightClub} className="w-full h-64"/>
                <div className="space-y-2">
                  <h2 className="font-display text-3xl text-ink">
                    {spotlightClub.name}
                  </h2>
                  <p className="text-sm text-muted">
                    {formatCategory(spotlightClub.category)} · {spotlightClub.member_count || 0} active members
                  </p>
                  <p className="text-base text-ink line-clamp-2">
                    {spotlightClub.description}
                  </p>
                </div>
                <Link className="inline-block px-5 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to={`/clubs/${spotlightClub.slug}`}>
                  Open Society Dossier
                </Link>
              </>
            ) : (
              <div className="py-12">
                <p className="text-base text-muted">
                  {loading ? 'Loading campus registry...' : 'No published societies yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: The Live Thing — Interactive Campus Session & Discipline Matcher */}
      <section className="bg-surface py-24 md:py-32">
        <div className="max-w-[1360px] mx-auto px-6 md:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display text-4xl md:text-6xl text-ink">
                Match Your Campus Hours.
              </h2>
              <p className="text-base md:text-lg text-ink max-w-xl">
                Choose when you are free between lectures to see which societies convene at that
                hour and venue across Savar campus.
              </p>
            </div>
            <div className="lg:col-span-5 text-left lg:text-right">
              <p className="text-sm text-muted">
                Active Venue: <span className="text-ink font-medium">{currentWindowObj.venue}</span>
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Filter societies by weekly campus session window"
            className="flex flex-wrap gap-3"
          >
            {CAMPUS_WINDOWS.map((win) => {
              const active = win.id === selectedWindow;
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => setSelectedWindow(win.id)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-ink text-ground'
                      : 'bg-ground text-ink hover:bg-surfaceAlt'
                  }`}
                >
                  {win.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {matchedClubs.length > 0 ? (
              matchedClubs.map((club) => (
                <div
                  key={club.id}
                  className="lg:col-span-4 bg-ground p-8 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <ClubVisualPlate club={club} className="w-full h-48"/>
                    <h3 className="font-display text-3xl text-ink">
                      {club.name}
                    </h3>
                    <p className="text-sm text-muted">
                      {formatCategory(club.category)} · Convenor: {club.manager_details?.name || 'Assigned Faculty'}
                    </p>
                    <p className="text-base text-ink">
                      {club.description}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm text-muted">
                      {club.member_count || 0} enrolled
                    </span>
                    <Link className="px-4 py-2 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to={`/clubs/${club.slug}`}>
                      Inspect &amp; Join
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-12 bg-ground p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="font-display text-3xl text-ink">
                    No societies scheduled in this exact window.
                  </h3>
                  <p className="text-base text-muted">
                    Reset the session filter to view all registered university clubs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWindow('ALL')}
                  className="px-5 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors"
                >
                  Show All Windows
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: Featured Societies Dossier */}
      <section className="max-w-[1360px] mx-auto px-6 md:px-8 py-24 md:py-36 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="font-display text-4xl md:text-6xl text-ink">
              Chartered Campus Collectives.
            </h2>
            <p className="text-base md:text-lg text-ink max-w-2xl">
              Every listed organization maintains an audited student roster, an assigned club
              manager, and direct membership applications.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link className="inline-block px-6 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/clubs">
              Open Full Directory ({clubs.length})
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} featured/>
          ))}
        </div>
      </section>

      {/* SECTION 4: Full-Field Discipline Almanac */}
      <section className="bg-ink text-ground py-24 md:py-32">
        <div className="max-w-[1360px] mx-auto px-6 md:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 space-y-3">
              <h2 className="font-display text-4xl md:text-6xl text-ground">
                Five Campus Disciplines.
              </h2>
              <p className="text-base md:text-lg text-surface max-w-xl">
                Select a discipline below to filter the directory directly by academic or
                extracurricular domain.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <Link className="inline-block px-6 py-3 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to="/clubs">
                Search All Categories
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {DISCIPLINES.map((item) => (
              <Link key={item.code} className="bg-[#22201D] p-6 flex flex-col justify-between space-y-8 hover:bg-accent transition-colors group" to={`/clubs?category=${item.code}`}>
                <div className="space-y-3">
                  <h3 className="font-display text-2xl text-ground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-surface leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <p className="text-sm text-surfaceAlt group-hover:text-ground">
                  Venue: {item.meetingSpot}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
