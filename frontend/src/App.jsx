import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white">
          <Sparkles className="w-6 h-6"/>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          TheJUClubHouse
        </h1>
        <p className="text-sm text-slate-600">
          Phase 1 Frontend Boilerplate (Vite + React + Tailwind CSS) is ready.
        </p>
        <div className="pt-2 flex flex-col gap-2 text-xs font-mono bg-slate-100 p-3 rounded-lg text-slate-700 text-left">
          <div className="flex items-center justify-between">
            <span>VITE_USE_MOCK:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
              {String(useMock)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>VITE_API_URL:</span>
            <span className="truncate">{apiUrl}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium pt-2">
          <ShieldCheck className="w-4 h-4"/>
          <span>Ready for Phase 2 (Mock API & Auth Context)</span>
        </div>
      </div>
    </div>
  );
}
