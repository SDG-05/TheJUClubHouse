import React from 'react';

const CATEGORY_LABELS = {
  TECHNOLOGY: 'Technology & Engineering',
  ACADEMIC: 'Academic & Rhetoric',
  ARTS: 'Visual & Performing Arts',
  SPORTS: 'Athletics & Field Sports',
  COMMUNITY: 'Community & Service',
};

export function formatCategory(category) {
  return CATEGORY_LABELS[category] || 'University Society';
}

export default function ClubVisualPlate({ club, className = 'w-full h-64' }) {
  if (club?.logo) {
    return (
      <div className={`overflow-hidden bg-surfaceAlt ${className}`}>
        <img
          src={club.logo}
          alt={`${club.name} emblem`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const category = club?.category || 'TECHNOLOGY';

  return (
    <div className={`relative overflow-hidden bg-ink text-ground flex items-end p-6 ${className}`}>
      {category === 'TECHNOLOGY' && (
        <svg
          viewBox="0 0 400 260"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="260" fill="#161513" />
          <rect x="28" y="28" width="160" height="160" fill="#B83A24" />
          <rect x="188" y="92" width="184" height="140" fill="#ECE7DC" />
          <circle cx="188" cy="92" r="44" fill="#1E4D3B" />
          <rect x="52" y="188" width="108" height="44" fill="#E2DDD0" />
        </svg>
      )}

      {category === 'ACADEMIC' && (
        <svg
          viewBox="0 0 400 260"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="260" fill="#1E4D3B" />
          <path d="M40 240 L120 40 L200 240 Z" fill="#ECE7DC" />
          <path d="M180 240 L260 68 L340 240 Z" fill="#B83A24" />
          <rect x="290" y="36" width="74" height="180" fill="#161513" />
        </svg>
      )}

      {category === 'ARTS' && (
        <svg
          viewBox="0 0 400 260"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="260" fill="#B83A24" />
          <circle cx="240" cy="130" r="92" fill="#F6F3EC" />
          <circle cx="205" cy="130" r="56" fill="#161513" />
          <rect x="28" y="34" width="110" height="192" fill="#1E4D3B" />
        </svg>
      )}

      {(category === 'SPORTS' || category === 'COMMUNITY' || !['TECHNOLOGY', 'ACADEMIC', 'ARTS'].includes(category)) && (
        <svg
          viewBox="0 0 400 260"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="260" fill="#161513" />
          <polygon points="0,260 180,60 360,260" fill="#1E4D3B" />
          <circle cx="310" cy="82" r="48" fill="#B83A24" />
          <rect x="36" y="36" width="120" height="56" fill="#ECE7DC" />
        </svg>
      )}

      <div className="relative z-10 bg-ground text-ink px-4 py-2">
        <span className="text-sm font-medium">{formatCategory(category)}</span>
      </div>
    </div>
  );
}
