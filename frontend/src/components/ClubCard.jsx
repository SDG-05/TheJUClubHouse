import React from 'react';
import { Link } from 'react-router-dom';
import ClubVisualPlate, { formatCategory } from './ClubVisualPlate';

export default function ClubCard({ club, featured = false }) {
  const memberLabel =
    club.member_count === 1 ? '1 active member' : `${club.member_count || 0} active members`;

  return (
    <article
      className={`bg-surface text-ink transition-colors hover:bg-surfaceAlt ${
        featured ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-10 items-center' : 'flex flex-col justify-between p-6 md:p-8'
      }`}
    >
      <div className={featured ? 'lg:col-span-5' : 'mb-6'}>
        <Link className="block focus:outline-none" to={`/clubs/${club.slug}`}>
          <ClubVisualPlate
            club={club}
            className={featured ? 'w-full h-72 md:h-80' : 'w-full h-56'}
          />
        </Link>
      </div>

      <div className={featured ? 'lg:col-span-7 space-y-5' : 'flex-1 flex flex-col justify-between space-y-6'}>
        <div className="space-y-3">
          <h3 className="font-display text-3xl md:text-4xl text-ink">
            <Link className="hover:text-accent transition-colors" to={`/clubs/${club.slug}`}>
              {club.name}
            </Link>
          </h3>

          <p className="text-sm text-muted">
            {formatCategory(club.category)} · {memberLabel}
            {club.manager_details?.name ? ` · Convenor: ${club.manager_details.name}` : ''}
          </p>

          <p className="text-base text-ink leading-relaxed line-clamp-3">
            {club.description}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted">
            {club.contact_email || 'tsc@juniv.edu'}
          </span>

          <Link className="inline-block px-5 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to={`/clubs/${club.slug}`}>
            Inspect Dossier
          </Link>
        </div>
      </div>
    </article>
  );
}
