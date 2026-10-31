import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCategory } from '../components/ClubVisualPlate';

function clubPath(membership) {
  const slug = membership.club_details?.slug;
  return slug ? `/clubs/${slug}` : '/clubs';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/memberships/my/');
      setMemberships(res.data || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not load your memberships.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemberships();
  }, [loadMemberships]);

  const handleWithdrawOrLeave = async (membership, isApproved) => {
    setBusyId(membership.id);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.delete(`/memberships/${membership.id}/`);
      setFeedback({
        type: 'success',
        text: isApproved
          ? `You have left ${membership.club_details?.name || 'the club'}.`
          : `Withdrew application for ${membership.club_details?.name || 'the club'}.`,
      });
      await loadMemberships();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not remove membership record.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReapply = async (membership) => {
    const slug = membership.club_details?.slug;
    if (!slug) return;
    setBusyId(membership.id);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.post(`/clubs/${slug}/join/`, {});
      setFeedback({
        type: 'success',
        text: `Re-application submitted to ${membership.club_details?.name}. Status is now Pending.`,
      });
      await loadMemberships();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not submit re-application.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const approvedClubs = memberships.filter((m) => m.status === 'APPROVED');
  const pendingOrRejected = memberships.filter(
    (m) => m.status === 'PENDING' || m.status === 'REJECTED'
  );
  const pendingCount = memberships.filter((m) => m.status === 'PENDING').length;
  const rejectedCount = memberships.filter((m) => m.status === 'REJECTED').length;

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-16 md:py-24 space-y-16">
      {/* Header & Real Summary Figures */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7 space-y-3">
          <h1 className="font-display text-5xl md:text-6xl text-ink">
            Student Memberships Desk.
          </h1>
          <p className="text-base md:text-lg text-ink max-w-2xl">
            Signed in as <span className="font-medium">{user?.name}</span> ({user?.email}). Manage
            your active society enrollments and pending membership applications.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{approvedClubs.length}</p>
            <p className="text-xs text-muted mt-1">Active Clubs</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{pendingCount}</p>
            <p className="text-xs text-muted mt-1">Pending Review</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{rejectedCount}</p>
            <p className="text-xs text-muted mt-1">Declined</p>
          </div>
          <div className="bg-surface p-5">
            <p className="font-display text-4xl text-ink">{memberships.length}</p>
            <p className="text-xs text-muted mt-1">Total Records</p>
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

      {/* SECTION 1: My Active Clubs (APPROVED) */}
      <section className="bg-surface p-8 md:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-3xl md:text-4xl text-ink">
              My Active Clubs.
            </h2>
            <p className="text-sm text-muted">
              Societies where your membership has been approved by the Club Manager.
            </p>
          </div>
          <Link className="inline-block whitespace-nowrap px-5 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/clubs">
            Explore More Societies
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted py-6">Loading active memberships...</p>
        ) : approvedClubs.length === 0 ? (
          <div className="bg-ground p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-base text-ink">
              You are not currently enrolled in any approved societies.
            </p>
            <Link className="px-5 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to="/clubs">
              Browse Club Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedClubs.map((m) => (
              <div
                key={m.id}
                className="bg-ground p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-2xl md:text-3xl text-ink">
                    <Link className="hover:text-accent transition-colors" to={clubPath(m)}>
                      {m.club_details?.name || `Club #${m.club}`}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted">
                    {formatCategory(m.club_details?.category)} · Standing:{' '}
                    <span className="text-forest font-medium">Approved Member</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link className="whitespace-nowrap px-4 py-2.5 bg-surface text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors" to={clubPath(m)}>
                    View Dossier
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === m.id}
                    onClick={() => handleWithdrawOrLeave(m, true)}
                    className="whitespace-nowrap px-4 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {busyId === m.id ? 'Leaving...' : 'Leave Club'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: My Applications (PENDING / REJECTED) */}
      <section className="bg-surface p-8 md:p-10 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-3xl md:text-4xl text-ink">
            My Applications.
          </h2>
          <p className="text-sm text-muted">
            Pending requests awaiting manager decision or declined applications eligible for
            re-application.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted py-6">Loading application history...</p>
        ) : pendingOrRejected.length === 0 ? (
          <div className="bg-ground p-8">
            <p className="text-base text-muted">
              You have no pending or declined applications at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrRejected.map((m) => {
              const isPending = m.status === 'PENDING';
              return (
                <div
                  key={m.id}
                  className="bg-ground p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-2xl md:text-3xl text-ink">
                      <Link className="hover:text-accent transition-colors" to={clubPath(m)}>
                        {m.club_details?.name || `Club #${m.club}`}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted">
                      {formatCategory(m.club_details?.category)} · Status:{' '}
                      <span
                        className={`font-medium ${
                          isPending ? 'text-amber' : 'text-accent'
                        }`}
                      >
                        {isPending ? 'Pending Manager Approval' : 'Declined by Manager'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {isPending ? (
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => handleWithdrawOrLeave(m, false)}
                        className="whitespace-nowrap px-5 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {busyId === m.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === m.id}
                        onClick={() => handleReapply(m)}
                        className="whitespace-nowrap px-5 py-2.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
                      >
                        {busyId === m.id ? 'Submitting...' : 'Reapply to Society'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
