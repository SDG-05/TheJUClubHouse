import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import ClubVisualPlate from '../components/ClubVisualPlate';

const CATEGORIES = ['TECHNOLOGY', 'ACADEMIC', 'ARTS', 'SPORTS', 'COMMUNITY'];

const STATUS_LABELS = {
  ALL: 'All Requests',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function ManagerDashboard() {
  const { user } = useAuth();

  const [managedClubs, setManagedClubs] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [savingClub, setSavingClub] = useState(false);
  const [busyReqId, setBusyReqId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Form state for currently selected club
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    category: 'TECHNOLOGY',
    contact_email: '',
    website: '',
    facebook: '',
    github: '',
    logoFile: null,
  });

  const populateForm = useCallback((club) => {
    if (!club) return;
    setFormState({
      name: club.name || '',
      description: club.description || '',
      category: club.category || 'TECHNOLOGY',
      contact_email: club.contact_email || '',
      website: club.website || '',
      facebook: club.social_links?.facebook || '',
      github: club.social_links?.github || '',
      logoFile: null,
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [clubsRes, reqsRes] = await Promise.all([
        apiClient.get('/clubs/'),
        apiClient.get('/manager/membership-requests/'),
      ]);

      const allClubs = clubsRes.data || [];
      const mine =
        user?.role === 'ADMIN'
          ? allClubs
          : allClubs.filter((c) => Number(c.manager) === user?.id);

      setManagedClubs(mine);
      setRequests(reqsRes.data || []);

      const activeClub = mine[0] || null;
      setSelectedSlug(activeClub ? activeClub.slug : '');
      if (activeClub) populateForm(activeClub);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to load manager desk data.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, populateForm]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const currentClub = managedClubs.find((c) => c.slug === selectedSlug) || null;

  const handleSelectClub = (club) => {
    setSelectedSlug(club.slug);
    populateForm(club);
    setFeedback({ type: '', text: '' });
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();
    if (!currentClub) return;
    setSavingClub(true);
    setFeedback({ type: '', text: '' });

    const socialLinks = {};
    if (formState.facebook.trim()) socialLinks.facebook = formState.facebook.trim();
    if (formState.github.trim()) socialLinks.github = formState.github.trim();

    try {
      let res;
      if (formState.logoFile) {
        const formData = new FormData();
        formData.append('name', formState.name.trim());
        formData.append('description', formState.description.trim());
        formData.append('category', formState.category);
        formData.append('contact_email', formState.contact_email.trim());
        formData.append('website', formState.website.trim());
        formData.append('social_links', JSON.stringify(socialLinks));
        formData.append('logo', formState.logoFile);

        res = await apiClient.patch(`/clubs/${currentClub.slug}/`, formData);
      } else {
        // Architectural Fix #4: manager and is_published omitted for CLUB_MANAGER
        res = await apiClient.patch(`/clubs/${currentClub.slug}/`, {
          name: formState.name.trim(),
          description: formState.description.trim(),
          category: formState.category,
          contact_email: formState.contact_email.trim(),
          website: formState.website.trim(),
          social_links: socialLinks,
        });
      }

      const updated = res.data;
      setManagedClubs((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      populateForm(updated);
      setFeedback({
        type: 'success',
        text: `Updated dossier for ${updated.name}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not update society profile.',
      });
    } finally {
      setSavingClub(false);
    }
  };

  const refreshRequests = async () => {
    const res = await apiClient.get('/manager/membership-requests/');
    setRequests(res.data || []);
  };

  const handleDecision = async (reqId, newStatus) => {
    setBusyReqId(reqId);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.patch(`/manager/membership-requests/${reqId}/`, {
        status: newStatus,
      });
      setFeedback({
        type: 'success',
        text: `Application #${reqId} marked as ${newStatus.toLowerCase()}.`,
      });
      await refreshRequests();
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Could not update membership request status.',
      });
    } finally {
      setBusyReqId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const pendingTotal = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24 space-y-16">
      {/* Header & Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7 space-y-3">
          <h1 className="font-display text-5xl md:text-6xl text-ink">
            Club Manager Desk.
          </h1>
          <p className="text-base md:text-lg text-ink max-w-2xl">
            Signed in as <span className="font-medium">{user?.name}</span>. Maintain your assigned
            society dossier and adjudicate incoming student membership applications.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 tabular-nums">
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{managedClubs.length}</p>
            <p className="text-xs text-muted mt-1">Assigned Clubs</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{pendingTotal}</p>
            <p className="text-xs text-muted mt-1">Pending Applicants</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{requests.length}</p>
            <p className="text-xs text-muted mt-1">Total Requests</p>
          </div>
        </div>
      </section>

      {feedback.text && (
        <div
          role="status"
          className={`bg-surface p-5 text-sm font-medium ${
            feedback.type === 'error' ? 'text-accent' : 'text-forest'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Assigned Club Switcher if managing multiple clubs */}
      {managedClubs.length > 1 && (
        <section aria-label="Select assigned society to edit" className="bg-surface p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted px-2">
            Editing Society:
          </span>
          {managedClubs.map((club) => {
            const active = club.slug === selectedSlug;
            return (
              <button
                key={club.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectClub(club)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-ink text-ground'
                    : 'bg-ground text-ink hover:bg-surfaceAlt'
                }`}
              >
                {club.name}
              </button>
            );
          })}
        </section>
      )}

      {/* SECTION 1: Edit My Club */}
      <section className="bg-surface p-8 md:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              Edit Assigned Society.
            </h2>
            <p className="text-sm text-muted">
              Update official descriptions, contact links, and emblem for your assigned society.
              Manager assignment and publication status are locked to University Admin.
            </p>
          </div>
          {currentClub && (
            <Link className="inline-block shrink-0 whitespace-nowrap px-5 py-2.5 bg-ground text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors" to={`/clubs/${currentClub.slug}`}>
              View Public Dossier
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading assigned society...</p>
        ) : !currentClub ? (
          <div className="bg-ground p-8">
            <p className="text-base text-muted">
              No society is currently assigned to your manager account. Contact the University
              Administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveClub} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mgr-club-name" className="block text-sm font-medium text-ink mb-2">
                    Society Name
                  </label>
                  <input
                    id="mgr-club-name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="mgr-club-category" className="block text-sm font-medium text-ink mb-2">
                    Discipline Category
                  </label>
                  <select
                    id="mgr-club-category"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="mgr-club-desc" className="block text-sm font-medium text-ink mb-2">
                  Charter &amp; Activities Description
                </label>
                <textarea
                  id="mgr-club-desc"
                  rows={4}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mgr-club-email" className="block text-sm font-medium text-ink mb-2">
                    Official Contact Email
                  </label>
                  <input
                    id="mgr-club-email"
                    type="email"
                    value={formState.contact_email}
                    onChange={(e) =>
                      setFormState({ ...formState, contact_email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="mgr-club-web" className="block text-sm font-medium text-ink mb-2">
                    External Website URL
                  </label>
                  <input
                    id="mgr-club-web"
                    type="url"
                    value={formState.website}
                    onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="mgr-club-fb" className="block text-sm font-medium text-ink mb-2">
                    Facebook Page URL
                  </label>
                  <input
                    id="mgr-club-fb"
                    type="url"
                    value={formState.facebook}
                    onChange={(e) => setFormState({ ...formState, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="mgr-club-gh" className="block text-sm font-medium text-ink mb-2">
                    GitHub Organization URL
                  </label>
                  <input
                    id="mgr-club-gh"
                    type="url"
                    value={formState.github}
                    onChange={(e) => setFormState({ ...formState, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingClub}
                  className="px-7 py-3.5 bg-accent text-ground text-base font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
                >
                  {savingClub ? 'Saving Changes...' : 'Save Society Dossier'}
                </button>
              </div>
            </div>

            {/* Right Column: Emblem Preview & Upload + Read-Only RBAC Fields */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-ground p-6 space-y-4">
                <p className="text-sm font-medium text-ink">Current Society Emblem</p>
                <ClubVisualPlate className="w-full h-52" club={currentClub}/>

                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2 mb-2">
                    <label htmlFor="mgr-club-logo" className="block text-sm font-medium text-ink">
                      Upload New Emblem
                    </label>
                    <span id="logo-file-rules" className="text-xs text-muted">
                      JPG, PNG, WebP · Max 2 MB
                    </span>
                  </div>
                  <input
                    id="mgr-club-logo"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    aria-describedby="logo-file-rules"
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        logoFile: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full text-sm text-ink file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-ink file:text-ground hover:file:bg-accent"
                  />
                </div>
              </div>

              <div className="bg-ground p-6 space-y-2 text-sm">
                <p className="font-medium text-ink">Read-Only Charter Metadata</p>
                <p className="text-muted">
                  Slug: <code>{currentClub.slug}</code>
                </p>
                <p className="text-muted">
                  Publication Status: {currentClub.is_published ? 'Published' : 'Unpublished'} (Admin-locked)
                </p>
                <p className="text-muted">
                  Assigned Convenor: {currentClub.manager_details?.name || user?.name}
                </p>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* SECTION 2: Membership Requests Adjudication Table */}
      <section className="bg-surface p-8 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              Membership Applications.
            </h2>
            <p className="text-sm text-muted">
              Approve or decline student applications for your assigned societies.
            </p>
          </div>

          <div role="group" aria-label="Filter applications by status" className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                aria-pressed={statusFilter === st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-ink text-ground'
                    : 'bg-ground text-ink hover:bg-surfaceAlt'
                }`}
              >
                {STATUS_LABELS[st]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading membership requests...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-ground p-8">
            <p className="text-base text-muted">
              No student membership requests match the selected filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-surfaceAlt text-ink text-sm">
                  <th className="py-3.5 px-4 font-medium">Applicant</th>
                  <th className="py-3.5 px-4 font-medium">Email</th>
                  <th className="py-3.5 px-4 font-medium">Society</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-surface">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="bg-ground text-sm">
                    <td className="py-4 px-4 font-medium text-ink">
                      {req.student_details?.name || `Student #${req.student}`}
                    </td>
                    <td className="py-4 px-4 text-muted">
                      {req.student_details?.email || '—'}
                    </td>
                    <td className="py-4 px-4 text-ink">
                      {req.club_details?.name || `Club #${req.club}`}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-medium ${
                          req.status === 'APPROVED'
                            ? 'text-forest'
                            : req.status === 'REJECTED'
                            ? 'text-accent'
                            : 'text-amber'
                        }`}
                      >
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyReqId === req.id || req.status === 'APPROVED'}
                          onClick={() => handleDecision(req.id, 'APPROVED')}
                          className="px-3.5 py-1.5 bg-forest text-ground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyReqId === req.id || req.status === 'REJECTED'}
                          onClick={() => handleDecision(req.id, 'REJECTED')}
                          className="px-3.5 py-1.5 bg-accent text-ground text-xs font-medium hover:bg-accentHover transition-colors disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
