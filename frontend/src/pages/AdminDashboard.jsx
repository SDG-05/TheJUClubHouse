import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { formatCategory } from '../components/ClubVisualPlate';

const CATEGORIES = ['TECHNOLOGY', 'ACADEMIC', 'ARTS', 'SPORTS', 'COMMUNITY'];
const ROLES = ['STUDENT', 'CLUB_MANAGER', 'ADMIN'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('CLUBS');
  const [clubs, setClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyKey, setBusyKey] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const [newClub, setNewClub] = useState({
    name: '',
    category: 'TECHNOLOGY',
    description: '',
    contact_email: '',
    website: '',
    manager: '',
    is_published: true,
  });

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [clubsRes, usersRes] = await Promise.all([
        apiClient.get('/clubs/'),
        apiClient.get('/users/'),
      ]);
      setClubs(clubsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to load administration registry.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const managerCandidates = users.filter(
    (u) => u.role === 'CLUB_MANAGER' || u.role === 'ADMIN'
  );

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFeedback({ type: '', text: '' });
    try {
      const payload = {
        name: newClub.name.trim(),
        category: newClub.category,
        description: newClub.description.trim(),
        contact_email: newClub.contact_email.trim(),
        website: newClub.website.trim(),
        manager: newClub.manager ? Number(newClub.manager) : null,
        is_published: Boolean(newClub.is_published),
      };
      const res = await apiClient.post('/clubs/', payload);
      setNewClub({
        name: '',
        category: 'TECHNOLOGY',
        description: '',
        contact_email: '',
        website: '',
        manager: '',
        is_published: true,
      });
      setShowCreateForm(false);
      setFeedback({
        type: 'success',
        text: `Chartered new society: ${res.data.name} (/clubs/${res.data.slug}).`,
      });
      await loadAdminData();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.detail ||
        (Array.isArray(data?.name) ? data.name[0] : 'Could not charter club.');
      setFeedback({ type: 'error', text: msg });
    } finally {
      setCreating(false);
    }
  };

  const handleAssignManager = async (club, managerId) => {
    setBusyKey(`mgr-${club.slug}`);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.patch(`/clubs/${club.slug}/`, {
        manager: managerId ? Number(managerId) : null,
      });
      setFeedback({
        type: 'success',
        text: `Updated manager assignment for ${club.name}.`,
      });
      await loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to reassign manager.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleTogglePublish = async (club) => {
    setBusyKey(`pub-${club.slug}`);
    setFeedback({ type: '', text: '' });
    try {
      const nextPub = !club.is_published;
      await apiClient.patch(`/clubs/${club.slug}/`, {
        is_published: nextPub,
      });
      setFeedback({
        type: 'success',
        text: `${club.name} is now ${nextPub ? 'Published' : 'Unpublished'}.`,
      });
      await loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not toggle publication state.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleDeleteClub = async (club) => {
    setBusyKey(`del-${club.slug}`);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.delete(`/clubs/${club.slug}/`);
      setFeedback({
        type: 'success',
        text: `Deleted society ${club.name}.`,
      });
      await loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not delete club.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    setBusyKey(`role-${targetUser.id}`);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.patch(`/users/${targetUser.id}/`, { role: newRole });
      setFeedback({
        type: 'success',
        text: `Updated ${targetUser.name} (${targetUser.email}) to ${newRole}.`,
      });
      await loadAdminData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not update user role.',
      });
    } finally {
      setBusyKey('');
    }
  };

  const publishedCount = clubs.filter((c) => c.is_published).length;

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24 space-y-16">
      {/* Header & Real Registry Counts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7 space-y-3">
          <h1 className="font-display text-5xl md:text-6xl text-ink">
            University Admin Desk.
          </h1>
          <p className="text-base md:text-lg text-ink max-w-2xl">
            Charter or dissolve student societies, assign Club Managers, control directory
            publication status, and govern university account roles.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 tabular-nums">
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{clubs.length}</p>
            <p className="text-xs text-muted mt-1">Total Clubs</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{publishedCount}</p>
            <p className="text-xs text-muted mt-1">Published</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{users.length}</p>
            <p className="text-xs text-muted mt-1">Registered Users</p>
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

      {/* Tab Navigation Bar */}
      <section className="bg-surface p-4 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'CLUBS'}
            type="button"
            onClick={() => setActiveTab('CLUBS')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'CLUBS'
                ? 'bg-ink text-ground'
                : 'bg-ground text-ink hover:bg-surfaceAlt'
            }`}
          >
            Manage All Clubs ({clubs.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'USERS'}
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'USERS'
                ? 'bg-ink text-ground'
                : 'bg-ground text-ink hover:bg-surfaceAlt'
            }`}
          >
            Manage Users &amp; Roles ({users.length})
          </button>
        </div>

        {activeTab === 'CLUBS' && (
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="px-5 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors"
          >
            {showCreateForm ? 'Close Charter Form' : '+ Charter New Club'}
          </button>
        )}
      </section>

      {/* TAB 1: Manage All Clubs */}
      {activeTab === 'CLUBS' && (
        <section className="space-y-12">
          {showCreateForm && (
            <form
              onSubmit={handleCreateClub}
              className="bg-surface p-8 md:p-10 space-y-6"
            >
              <h2 className="font-display text-3xl md:text-4xl text-ink">
                Charter New Society.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="admin-new-name" className="block text-sm font-medium text-ink mb-2">
                    Society Name
                  </label>
                  <input
                    id="admin-new-name"
                    type="text"
                    required
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    placeholder="e.g. Cultural Union"
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-cat" className="block text-sm font-medium text-ink mb-2">
                    Discipline
                  </label>
                  <select
                    id="admin-new-cat"
                    value={newClub.category}
                    onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {formatCategory(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-new-mgr" className="block text-sm font-medium text-ink mb-2">
                    Assign Club Manager
                  </label>
                  <select
                    id="admin-new-mgr"
                    value={newClub.manager}
                    onChange={(e) => setNewClub({ ...newClub, manager: e.target.value })}
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">— Unassigned —</option>
                    {managerCandidates.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="admin-new-desc" className="block text-sm font-medium text-ink mb-2">
                  Charter Description
                </label>
                <textarea
                  id="admin-new-desc"
                  rows={3}
                  required
                  value={newClub.description}
                  onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                  placeholder="Describe the society's mandate, weekly schedule, and venue..."
                  className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label htmlFor="admin-new-email" className="block text-sm font-medium text-ink mb-2">
                    Contact Email
                  </label>
                  <input
                    id="admin-new-email"
                    type="email"
                    value={newClub.contact_email}
                    onChange={(e) =>
                      setNewClub({ ...newClub, contact_email: e.target.value })
                    }
                    placeholder="society@university.edu"
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="admin-new-web" className="block text-sm font-medium text-ink mb-2">
                    Website URL
                  </label>
                  <input
                    id="admin-new-web"
                    type="url"
                    value={newClub.website}
                    onChange={(e) => setNewClub({ ...newClub, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-ground text-ink text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex items-center gap-3 py-3">
                  <input
                    id="admin-new-pub"
                    type="checkbox"
                    checked={newClub.is_published}
                    onChange={(e) =>
                      setNewClub({ ...newClub, is_published: e.target.checked })
                    }
                    className="w-4 h-4 accent-accent"
                  />
                  <label htmlFor="admin-new-pub" className="text-sm font-medium text-ink">
                    Publish immediately in public directory
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-7 py-3 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
                >
                  {creating ? 'Chartering...' : 'Create Society'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-ground text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Clubs Registry Table */}
          <div className="bg-surface p-8 md:p-10 space-y-6">
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              Chartered Societies Ledger.
            </h2>

            {loading ? (
              <p className="text-sm text-muted">Loading clubs ledger...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left border-collapse">
                  <thead>
                    <tr className="bg-surfaceAlt text-ink text-sm">
                      <th className="py-3.5 px-4 font-medium">Society</th>
                      <th className="py-3.5 px-4 font-medium">Discipline</th>
                      <th className="py-3.5 px-4 font-medium">Assigned Manager</th>
                      <th className="py-3.5 px-4 font-medium">Members</th>
                      <th className="py-3.5 px-4 font-medium">Visibility</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-surface">
                    {clubs.map((club) => (
                      <tr key={club.id} className="bg-ground text-sm">
                        <td className="py-4 px-4">
                          <Link className="font-medium text-ink hover:text-accent" to={`/clubs/${club.slug}`}>
                            {club.name}
                          </Link>
                          <div className="text-xs text-muted">/{club.slug}</div>
                        </td>
                        <td className="py-4 px-4 text-muted">{formatCategory(club.category)}</td>
                        <td className="py-4 px-4">
                          <select
                            aria-label={`Assign manager for ${club.name}`}
                            disabled={busyKey === `mgr-${club.slug}`}
                            value={club.manager || ''}
                            onChange={(e) => handleAssignManager(club, e.target.value)}
                            className="px-3 py-2 bg-surface text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                          >
                            <option value="">— Unassigned —</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.role})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 tabular-nums text-ink">
                          {club.member_count || 0}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            disabled={busyKey === `pub-${club.slug}`}
                            onClick={() => handleTogglePublish(club)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              club.is_published
                                ? 'bg-forest text-ground'
                                : 'bg-surface text-muted hover:bg-surfaceAlt'
                            }`}
                          >
                            {club.is_published ? 'Published' : 'Unpublished'}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            disabled={busyKey === `del-${club.slug}`}
                            onClick={() => handleDeleteClub(club)}
                            className="px-3.5 py-1.5 bg-accent text-ground text-xs font-medium hover:bg-accentHover transition-colors disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: Manage Users & Roles */}
      {activeTab === 'USERS' && (
        <section className="bg-surface p-8 md:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              University Account Roles.
            </h2>
            <p className="text-sm text-muted">
              Promote or demote registered accounts between Student, Club Manager, and Administrator
              standing.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Loading user directory...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-surfaceAlt text-ink text-sm">
                    <th className="py-3.5 px-4 font-medium">ID</th>
                    <th className="py-3.5 px-4 font-medium">Full Name</th>
                    <th className="py-3.5 px-4 font-medium">University Email</th>
                    <th className="py-3.5 px-4 font-medium">Current Role</th>
                    <th className="py-3.5 px-4 font-medium text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-surface">
                  {users.map((u) => (
                    <tr key={u.id} className="bg-ground text-sm">
                      <td className="py-4 px-4 tabular-nums text-muted">#{u.id}</td>
                      <td className="py-4 px-4 font-medium text-ink">{u.name}</td>
                      <td className="py-4 px-4 text-muted">{u.email}</td>
                      <td className="py-4 px-4 font-medium text-ink">{u.role}</td>
                      <td className="py-4 px-4 text-right">
                        <select
                          aria-label={`Change role for ${u.name}`}
                          disabled={busyKey === `role-${u.id}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="px-3 py-2 bg-surface text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
