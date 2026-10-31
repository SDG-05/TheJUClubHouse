import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import ClubVisualPlate, { formatCategory } from '../components/ClubVisualPlate';

export default function ClubProfilePage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [notFound, setNotFound] = useState(false);

  const fetchClubData = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const clubRes = await apiClient.get(`/clubs/${slug}/`);
      const fetchedClub = clubRes.data;
      setClub(fetchedClub);

      if (user) {
        const [membersRes, myRes] = await Promise.allSettled([
          apiClient.get(`/clubs/${slug}/members/`),
          user.role === 'STUDENT' ? apiClient.get('/memberships/my/') : Promise.resolve({ data: [] }),
        ]);

        if (membersRes.status === 'fulfilled') {
          setMembers(membersRes.value.data || []);
        }
        if (myRes.status === 'fulfilled') {
          const match = (myRes.value.data || []).find(
            (m) => m.club === fetchedClub.id || m.club_details?.slug === fetchedClub.slug
          );
          setMyMembership(match || null);
        }
      } else {
        setMembers([]);
        setMyMembership(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setFeedback({
          type: 'error',
          text: err.response?.data?.detail || 'Failed to load club dossier.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  const handleJoinOrReapply = async () => {
    if (!club) return;
    setActionLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      const res = await apiClient.post(`/clubs/${club.slug}/join/`, {});
      setMyMembership(res.data);
      setFeedback({
        type: 'success',
        text: 'Your membership application has been submitted to the Club Manager for review.',
      });
      await fetchClubData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not submit membership application.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawOrLeave = async () => {
    if (!myMembership) return;
    const wasApproved = myMembership.status === 'APPROVED';
    setActionLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      await apiClient.delete(`/memberships/${myMembership.id}/`);
      setMyMembership(null);
      setFeedback({
        type: 'success',
        text: wasApproved
          ? 'You have left the society roster.'
          : 'Your pending application has been withdrawn.',
      });
      await fetchClubData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not remove membership record.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-20">
        <p className="text-base text-muted">Loading society dossier...</p>
      </main>
    );
  }

  if (notFound || !club) {
    return (
      <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-24 space-y-6">
        <h1 className="font-display text-5xl md:text-6xl text-ink">
          Society Not Found.
        </h1>
        <p className="text-base text-muted max-w-xl">
          No chartered club exists at slug &ldquo;{slug}&rdquo;. Return to the directory to browse
          active organizations.
        </p>
        <Link className="inline-block px-6 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/clubs">
          Back to Club Directory
        </Link>
      </main>
    );
  }

  const signInTo = `/login?next=${encodeURIComponent(`/clubs/${club.slug}`)}`;

  const socialEntries = Object.entries(club.social_links || {}).filter(
    ([, url]) => Boolean(url)
  );

  return (
    <main className="max-w-[1360px] mx-auto px-6 md:px-8 py-14 md:py-24 space-y-20">
      {/* Top Breadcrumb Link */}
      <div>
        <Link className="text-sm font-medium text-muted hover:text-accent transition-colors" to="/clubs">
          &larr; Return to Club Directory
        </Link>
      </div>

      {/* SECTION 1: Club Dossier Hero & Smart Membership Action */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ink">
            {club.name}
          </h1>

          <p className="text-base text-muted">
            {formatCategory(club.category)} · {club.member_count || 0} approved{' '}
            {club.member_count === 1 ? 'member' : 'members'}
          </p>

          <p className="text-lg md:text-xl text-ink leading-relaxed max-w-2xl">
            {club.description}
          </p>

          {/* Smart Contextual Action Box */}
          <div className="bg-surface p-6 md:p-8 space-y-4 max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              Membership Standing
            </h2>

            {!user && (
              <div className="space-y-4">
                <p className="text-base text-ink">
                  Sign in with your Jahangirnagar University student account to apply for
                  membership or view the full member roster.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link className="px-6 py-3 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors" to={signInTo}>
                    Sign in to Apply
                  </Link>
                  <Link className="px-6 py-3 bg-ground text-ink text-sm font-medium hover:bg-surfaceAlt transition-colors" to="/register">
                    Create Student Account
                  </Link>
                </div>
              </div>
            )}

            {user?.role === 'STUDENT' && (
              <div className="space-y-4">
                {!myMembership && (
                  <>
                    <p className="text-base text-ink">
                      Applications are reviewed directly by the assigned Club Manager.
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleJoinOrReapply}
                      className="px-7 py-3.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Submitting Application...' : 'Join Club'}
                    </button>
                  </>
                )}

                {myMembership?.status === 'PENDING' && (
                  <>
                    <p className="text-base text-ink">
                      Your application is currently pending review by{' '}
                      <span className="font-medium">
                        {club.manager_details?.name || 'the Club Manager'}
                      </span>
                      .
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleWithdrawOrLeave}
                      className="px-7 py-3.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Application Pending — Withdraw'}
                    </button>
                  </>
                )}

                {myMembership?.status === 'APPROVED' && (
                  <>
                    <p className="text-base text-forest font-medium">
                      You are an active, approved member of {club.name}.
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleWithdrawOrLeave}
                      className="px-7 py-3.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Joined ✓ — Leave Club'}
                    </button>
                  </>
                )}

                {myMembership?.status === 'REJECTED' && (
                  <>
                    <p className="text-base text-accent">
                      Your previous application was declined. You may submit a fresh application
                      for reconsideration.
                    </p>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleJoinOrReapply}
                      className="px-7 py-3.5 bg-accent text-ground text-sm font-medium hover:bg-accentHover transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Reapplying...' : 'Application Rejected — Reapply'}
                    </button>
                  </>
                )}
              </div>
            )}

            {user?.role === 'CLUB_MANAGER' && (
              <div className="space-y-3">
                <p className="text-base text-ink">
                  {Number(club.manager) === user.id
                    ? 'You are the assigned Club Manager for this society.'
                    : 'You are signed in with a Club Manager account.'}
                </p>
                {Number(club.manager) === user.id && (
                  <Link className="inline-block px-6 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/dashboard/manager">
                    Open Manager Desk
                  </Link>
                )}
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <div className="space-y-3">
                <p className="text-base text-ink">
                  Signed in as University Administrator. You may reassign the manager or edit
                  publication status from the Admin Desk.
                </p>
                <Link className="inline-block px-6 py-3 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors" to="/dashboard/admin">
                  Manage in Admin Desk
                </Link>
              </div>
            )}

            {feedback.text && (
              <p
                className={`text-sm font-medium pt-2 ${
                  feedback.type === 'error' ? 'text-accent' : 'text-forest'
                }`}
              >
                {feedback.text}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Visual Plate & Official Registry Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <ClubVisualPlate club={club} className="w-full h-80"/>

          <div className="bg-surface p-8 space-y-6">
            <h2 className="font-display text-3xl text-ink">
              Society Registry Details
            </h2>

            <dl className="space-y-4 text-sm">
              <div className="bg-ground p-4">
                <dt className="text-muted">Assigned Club Manager</dt>
                <dd className="text-base font-medium text-ink mt-0.5">
                  {club.manager_details?.name || 'Unassigned'}
                </dd>
                {club.manager_details?.email && (
                  <dd className="text-sm text-muted">{club.manager_details.email}</dd>
                )}
              </div>

              <div className="bg-ground p-4">
                <dt className="text-muted">Official Contact Email</dt>
                <dd className="text-base font-medium text-ink mt-0.5">
                  {club.contact_email ? (
                    <a
                      href={`mailto:${club.contact_email}`}
                      className="hover:text-accent transition-colors"
                    >
                      {club.contact_email}
                    </a>
                  ) : (
                    'Not listed'
                  )}
                </dd>
              </div>

              {club.website && (
                <div className="bg-ground p-4">
                  <dt className="text-muted">External Website</dt>
                  <dd className="text-base font-medium text-ink mt-0.5 truncate">
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      {club.website}
                    </a>
                  </dd>
                </div>
              )}

              {socialEntries.length > 0 && (
                <div className="bg-ground p-4 space-y-2">
                  <dt className="text-muted">External Channels</dt>
                  <dd className="flex flex-wrap gap-3 pt-1">
                    {socialEntries.map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-surface text-ink text-xs font-medium capitalize hover:bg-accent hover:text-ground transition-colors"
                      >
                        {platform}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      {/* SECTION 2: Approved Member Roster */}
      <section className="bg-surface p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-2">
            <h2 className="font-display text-4xl md:text-5xl text-ink">
              Approved Member Roster.
            </h2>
            <p className="text-base text-muted">
              Verified students currently holding active membership in {club.name}.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <span className="text-sm font-medium text-ink">
              Total Enrolled: {club.member_count || 0}
            </span>
          </div>
        </div>

        {!user ? (
          <div className="bg-ground p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-base text-ink">
              Sign in with your university account to view individual member names and emails.
            </p>
            <Link className="px-5 py-2.5 bg-ink text-ground text-sm font-medium hover:bg-accent transition-colors shrink-0" to={signInTo}>
              Sign in to View Roster
            </Link>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-ground p-8">
            <p className="text-base text-muted">
              No approved student members on the roster yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
              <div key={m.id} className="bg-ground p-6 space-y-1">
                <p className="font-display text-2xl text-ink">
                  {m.student_details?.name || `Student #${m.student}`}
                </p>
                <p className="text-sm text-muted">
                  {m.student_details?.email || 'Verified Student'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
