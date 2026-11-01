const STORAGE_KEYS = {
  USERS: 'ju_clubhouse_users_v1',
  CLUBS: 'ju_clubhouse_clubs_v1',
  MEMBERSHIPS: 'ju_clubhouse_memberships_v1',
};

const INITIAL_USERS = [
  {
    id: 1,
    name: 'System Admin',
    email: 'admin@university.edu',
    role: 'ADMIN',
    created_at: '2026-10-01T09:00:00Z',
  },
  {
    id: 2,
    name: 'Robotics Manager',
    email: 'manager.robotics@university.edu',
    role: 'CLUB_MANAGER',
    created_at: '2026-10-01T09:05:00Z',
  },
  {
    id: 3,
    name: 'Debate Manager',
    email: 'manager.debate@university.edu',
    role: 'CLUB_MANAGER',
    created_at: '2026-10-01T09:10:00Z',
  },
  {
    id: 4,
    name: 'Student One',
    email: 'student1@university.edu',
    role: 'STUDENT',
    created_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 5,
    name: 'Student Two',
    email: 'student2@university.edu',
    role: 'STUDENT',
    created_at: '2026-10-02T10:15:00Z',
  },
];

const INITIAL_CLUBS = [
  {
    id: 1,
    name: 'Robotics Club',
    slug: 'robotics-club',
    description:
      'Designing autonomous rovers, drones, and embedded systems in the Faculty of Mathematical and Physical Sciences lab.',
    category: 'TECHNOLOGY',
    logo: null,
    contact_email: 'robotics@university.edu',
    website: 'https://robotics.university.edu',
    social_links: {
      facebook: 'https://facebook.com/unirobotics',
      github: 'https://github.com/unirobotics',
    },
    manager: 2,
    is_published: true,
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-05T10:00:00Z',
  },
  {
    id: 2,
    name: 'Debate Society',
    slug: 'debate-society',
    description:
      'Parliamentary debate training, weekly public motions at the TSC amphitheatre, and national inter-university tournaments.',
    category: 'ACADEMIC',
    logo: null,
    contact_email: 'debate@university.edu',
    website: 'https://debate.university.edu',
    social_links: {
      facebook: 'https://facebook.com/unidebate',
    },
    manager: 3,
    is_published: true,
    created_at: '2026-10-06T11:00:00Z',
    updated_at: '2026-10-06T11:00:00Z',
  },
  {
    id: 3,
    name: 'Photography Club',
    slug: 'photography-club',
    description:
      'Documenting campus lake biodiversity, darkroom film walks, and annual visual exhibitions at the Zahir Raihan Auditorium.',
    category: 'ARTS',
    logo: null,
    contact_email: 'photo@university.edu',
    website: 'https://photo.university.edu',
    social_links: {
      facebook: 'https://facebook.com/uniphoto',
    },
    manager: 2,
    is_published: true,
    created_at: '2026-10-07T12:00:00Z',
    updated_at: '2026-10-07T12:00:00Z',
  },
];

const INITIAL_MEMBERSHIPS = [
  {
    id: 1,
    student: 4,
    club: 1,
    status: 'APPROVED',
    applied_at: '2026-10-10T14:00:00Z',
    updated_at: '2026-10-11T09:00:00Z',
  },
  {
    id: 2,
    student: 5,
    club: 1,
    status: 'PENDING',
    applied_at: '2026-10-15T16:30:00Z',
    updated_at: '2026-10-15T16:30:00Z',
  },
  {
    id: 3,
    student: 4,
    club: 2,
    status: 'PENDING',
    applied_at: '2026-10-16T11:20:00Z',
    updated_at: '2026-10-16T11:20:00Z',
  },
];

function ensureSeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(INITIAL_CLUBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(INITIAL_MEMBERSHIPS));
  }
}

function getUsers() {
  ensureSeeded();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getClubs() {
  ensureSeeded();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLUBS));
}

function saveClubs(clubs) {
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
}

function getMemberships() {
  ensureSeeded();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS));
}

function saveMemberships(memberships) {
  localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(memberships));
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hydrateClub(club, users, memberships) {
  const managerObj = users.find((u) => u.id === Number(club.manager)) || null;
  const approvedCount = memberships.filter(
    (m) => m.club === club.id && m.status === 'APPROVED'
  ).length;

  return {
    ...club,
    manager_details: managerObj
      ? { id: managerObj.id, name: managerObj.name, email: managerObj.email }
      : null,
    member_count: approvedCount,
  };
}

function hydrateMembership(membership, users, clubs) {
  const studentObj = users.find((u) => u.id === Number(membership.student)) || null;
  const clubObj = clubs.find((c) => c.id === Number(membership.club)) || null;

  return {
    ...membership,
    student_details: studentObj
      ? { id: studentObj.id, name: studentObj.name, email: studentObj.email }
      : null,
    club_details: clubObj
      ? {
          id: clubObj.id,
          name: clubObj.name,
          slug: clubObj.slug,
          category: clubObj.category,
          logo: clubObj.logo,
        }
      : null,
  };
}

// Axios hands the adapter an AxiosHeaders instance, whose keys are normalized
// to lowercase once they pass through `.set()`. Read the header case-insensitively.
function readHeader(headers, name) {
  if (!headers) return '';
  if (typeof headers.get === 'function') {
    const viaGetter = headers.get(name);
    if (viaGetter) return String(viaGetter);
  }
  const target = name.toLowerCase();
  const key = Object.keys(headers).find((k) => k.toLowerCase() === target);
  return key ? String(headers[key] || '') : '';
}

function getAuthenticatedUser(headers = {}) {
  const authHeader = readHeader(headers, 'Authorization');
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  const match = token.match(/^mock-access-(\d+)-/);
  if (!match) return null;
  const userId = Number(match[1]);
  return getUsers().find((u) => u.id === userId) || null;
}

function createResponse(config, status, data) {
  return {
    status,
    statusText: status === 200 ? 'OK' : status === 201 ? 'Created' : 'No Content',
    data,
    headers: { 'content-type': 'application/json' },
    config,
  };
}

function createError(config, status, data) {
  const err = new Error(`Request failed with status code ${status}`);
  err.config = config;
  err.response = {
    status,
    data,
    headers: { 'content-type': 'application/json' },
    config,
  };
  return Promise.reject(err);
}

function parseBody(data) {
  if (!data) return {};
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const obj = {};
    for (const [key, value] of data.entries()) {
      if (key === 'social_links' && typeof value === 'string') {
        try {
          obj[key] = JSON.parse(value);
        } catch {
          obj[key] = {};
        }
      } else if (key === 'is_published') {
        obj[key] = value === 'true' || value === true;
      } else if (key === 'manager') {
        obj[key] = value ? Number(value) : null;
      } else if (key === 'logo' && typeof File !== 'undefined' && value instanceof File) {
        obj[key] = URL.createObjectURL(value);
      } else {
        obj[key] = value;
      }
    }
    return obj;
  }
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

export async function mockAdapter(config) {
  ensureSeeded();
  await new Promise((r) => setTimeout(r, 90));

  const method = (config.method || 'get').toUpperCase();
  const baseURL = config.baseURL || '';
  let rawUrl = config.url || '';
  if (rawUrl.startsWith(baseURL)) {
    rawUrl = rawUrl.slice(baseURL.length);
  }
  const [pathname, queryString] = rawUrl.split('?');
  const cleanPath = ('/' + pathname).replace(/\/+/g, '/').replace(/\/$/, '') || '/';

  const searchParams = new URLSearchParams(queryString || '');
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, v);
      }
    });
  }

  const body = parseBody(config.data);
  const currentUser = getAuthenticatedUser(config.headers);
  const users = getUsers();
  const clubs = getClubs();
  const memberships = getMemberships();

  // 1. POST /auth/register
  if (method === 'POST' && cleanPath === '/auth/register') {
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return createError(config, 400, { detail: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return createError(config, 400, { password: ['Password must be at least 8 characters.'] });
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return createError(config, 400, { email: ['A user with this university email already exists.'] });
    }
    const newUser = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'STUDENT', // Hardcoded per security rule
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return createResponse(config, 201, newUser);
  }

  // 2. POST /auth/login
  if (method === 'POST' && cleanPath === '/auth/login') {
    const { email, password } = body;
    const found = users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
    if (!found || !password) {
      return createError(config, 401, { detail: 'No active account found with the given credentials.' });
    }
    return createResponse(config, 200, {
      access: `mock-access-${found.id}-${Date.now()}`,
      refresh: `mock-refresh-${found.id}-${Date.now()}`,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
      },
    });
  }

  // 3. POST /auth/token/refresh
  if (method === 'POST' && cleanPath === '/auth/token/refresh') {
    const refresh = body.refresh || '';
    const match = refresh.match(/^mock-refresh-(\d+)-/);
    if (!match) {
      return createError(config, 401, { detail: 'Token is invalid or expired.' });
    }
    return createResponse(config, 200, {
      access: `mock-access-${match[1]}-${Date.now()}`,
    });
  }

  // 4. GET /auth/me
  if (method === 'GET' && cleanPath === '/auth/me') {
    if (!currentUser) {
      return createError(config, 401, { detail: 'Authentication credentials were not provided.' });
    }
    return createResponse(config, 200, currentUser);
  }

  // 5. GET /users (ADMIN only)
  if (method === 'GET' && cleanPath === '/users') {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    if (currentUser.role !== 'ADMIN') return createError(config, 403, { detail: 'Admin access required.' });
    return createResponse(config, 200, users);
  }

  // 6. PATCH /users/:id (ADMIN only)
  const userMatch = cleanPath.match(/^\/users\/(\d+)$/);
  if (method === 'PATCH' && userMatch) {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    if (currentUser.role !== 'ADMIN') return createError(config, 403, { detail: 'Admin access required.' });
    const targetId = Number(userMatch[1]);
    const idx = users.findIndex((u) => u.id === targetId);
    if (idx === -1) return createError(config, 404, { detail: 'User not found.' });
    if (body.role && ['STUDENT', 'CLUB_MANAGER', 'ADMIN'].includes(body.role)) {
      users[idx].role = body.role;
    }
    saveUsers(users);
    return createResponse(config, 200, users[idx]);
  }

  // 7. GET /clubs
  if (method === 'GET' && cleanPath === '/clubs') {
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const category = (searchParams.get('category') || '').toUpperCase().trim();

    let list = clubs.filter((c) => {
      if (currentUser?.role === 'ADMIN' || (currentUser?.role === 'CLUB_MANAGER' && c.manager === currentUser.id)) {
        return true;
      }
      return c.is_published !== false;
    });

    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      );
    }
    if (category && category !== 'ALL') {
      list = list.filter((c) => c.category === category);
    }

    return createResponse(
      config,
      200,
      list.map((c) => hydrateClub(c, users, memberships))
    );
  }

  // 8. POST /clubs (ADMIN only)
  if (method === 'POST' && cleanPath === '/clubs') {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    if (currentUser.role !== 'ADMIN') return createError(config, 403, { detail: 'Only administrators can create clubs.' });
    if (!body.name || !body.category) {
      return createError(config, 400, { detail: 'Club name and category are required.' });
    }
    const slug = slugify(body.name);
    if (clubs.some((c) => c.slug === slug)) {
      return createError(config, 400, { name: ['A club with a similar name or slug already exists.'] });
    }
    const now = new Date().toISOString();
    const newClub = {
      id: Math.max(0, ...clubs.map((c) => c.id)) + 1,
      name: body.name.trim(),
      slug,
      description: body.description || '',
      category: body.category,
      logo: body.logo || null,
      contact_email: body.contact_email || '',
      website: body.website || '',
      social_links: body.social_links || {},
      manager: body.manager ? Number(body.manager) : null,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: now,
      updated_at: now,
    };
    clubs.push(newClub);
    saveClubs(clubs);
    return createResponse(config, 201, hydrateClub(newClub, users, memberships));
  }

  // 9. POST /clubs/:slug/join (STUDENT only, with Re-application Fix)
  const joinMatch = cleanPath.match(/^\/clubs\/([a-z0-9-]+)\/join$/);
  if (method === 'POST' && joinMatch) {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    if (currentUser.role !== 'STUDENT') {
      return createError(config, 403, { detail: 'Only students can apply to join clubs.' });
    }
    const club = clubs.find((c) => c.slug === joinMatch[1]);
    if (!club) return createError(config, 404, { detail: 'Club not found.' });

    const existingIdx = memberships.findIndex(
      (m) => m.student === currentUser.id && m.club === club.id
    );
    const now = new Date().toISOString();

    if (existingIdx !== -1) {
      const existing = memberships[existingIdx];
      if (existing.status === 'PENDING' || existing.status === 'APPROVED') {
        return createError(config, 400, {
          detail: `You already have an ${existing.status.toLowerCase()} membership for this club.`,
        });
      }
      // Architectural Fix #1: Re-application updates REJECTED -> PENDING
      existing.status = 'PENDING';
      existing.applied_at = now;
      existing.updated_at = now;
      saveMemberships(memberships);
      return createResponse(config, 200, hydrateMembership(existing, users, clubs));
    }

    const newMembership = {
      id: Math.max(0, ...memberships.map((m) => m.id)) + 1,
      student: currentUser.id,
      club: club.id,
      status: 'PENDING',
      applied_at: now,
      updated_at: now,
    };
    memberships.push(newMembership);
    saveMemberships(memberships);
    return createResponse(config, 201, hydrateMembership(newMembership, users, clubs));
  }

  // 10. GET /clubs/:slug/members
  const clubMembersMatch = cleanPath.match(/^\/clubs\/([a-z0-9-]+)\/members$/);
  if (method === 'GET' && clubMembersMatch) {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    const club = clubs.find((c) => c.slug === clubMembersMatch[1]);
    if (!club) return createError(config, 404, { detail: 'Club not found.' });
    const approved = memberships
      .filter((m) => m.club === club.id && m.status === 'APPROVED')
      .map((m) => hydrateMembership(m, users, clubs));
    return createResponse(config, 200, approved);
  }

  // 11. GET, PATCH, DELETE /clubs/:slug
  const clubDetailMatch = cleanPath.match(/^\/clubs\/([a-z0-9-]+)$/);
  if (clubDetailMatch) {
    const slug = clubDetailMatch[1];
    const idx = clubs.findIndex((c) => c.slug === slug);
    if (idx === -1) return createError(config, 404, { detail: 'Club not found.' });
    const club = clubs[idx];

    if (method === 'GET') {
      return createResponse(config, 200, hydrateClub(club, users, memberships));
    }

    if (method === 'PATCH') {
      if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
      const isAssignedManager =
        currentUser.role === 'CLUB_MANAGER' && Number(club.manager) === currentUser.id;
      const isAdmin = currentUser.role === 'ADMIN';
      if (!isAdmin && !isAssignedManager) {
        return createError(config, 403, { detail: 'You do not have permission to edit this club.' });
      }

      const editableFields = [
        'name',
        'description',
        'category',
        'logo',
        'contact_email',
        'website',
        'social_links',
      ];
      editableFields.forEach((field) => {
        if (body[field] !== undefined) {
          club[field] = body[field];
        }
      });

      // Architectural Fix #4: Privilege escalation protection on PATCH
      if (isAdmin) {
        if (body.manager !== undefined) {
          club.manager = body.manager ? Number(body.manager) : null;
        }
        if (body.is_published !== undefined) {
          club.is_published = Boolean(body.is_published);
        }
      }

      club.updated_at = new Date().toISOString();
      clubs[idx] = club;
      saveClubs(clubs);
      return createResponse(config, 200, hydrateClub(club, users, memberships));
    }

    if (method === 'DELETE') {
      if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
      if (currentUser.role !== 'ADMIN') {
        return createError(config, 403, { detail: 'Only administrators can delete clubs.' });
      }
      clubs.splice(idx, 1);
      saveClubs(clubs);
      const remainingMemberships = memberships.filter((m) => m.club !== club.id);
      saveMemberships(remainingMemberships);
      return createResponse(config, 204, null);
    }
  }

  // 12. GET /memberships/my (STUDENT only)
  if (method === 'GET' && cleanPath === '/memberships/my') {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    const mine = memberships
      .filter((m) => m.student === currentUser.id)
      .map((m) => hydrateMembership(m, users, clubs));
    return createResponse(config, 200, mine);
  }

  // 13. DELETE /memberships/:id (STUDENT owner only)
  const deleteMembershipMatch = cleanPath.match(/^\/memberships\/(\d+)$/);
  if (method === 'DELETE' && deleteMembershipMatch) {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    const targetId = Number(deleteMembershipMatch[1]);
    const idx = memberships.findIndex((m) => m.id === targetId);
    if (idx === -1) return createError(config, 404, { detail: 'Membership record not found.' });
    if (memberships[idx].student !== currentUser.id && currentUser.role !== 'ADMIN') {
      return createError(config, 403, { detail: 'You can only withdraw or leave your own memberships.' });
    }
    memberships.splice(idx, 1);
    saveMemberships(memberships);
    return createResponse(config, 204, null);
  }

  // 14. GET /manager/membership-requests (CLUB_MANAGER or ADMIN)
  if (method === 'GET' && cleanPath === '/manager/membership-requests') {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    if (!['CLUB_MANAGER', 'ADMIN'].includes(currentUser.role)) {
      return createError(config, 403, { detail: 'Manager or Admin permissions required.' });
    }
    const statusFilter = (searchParams.get('status') || '').toUpperCase().trim();
    const managedClubIds =
      currentUser.role === 'ADMIN'
        ? clubs.map((c) => c.id)
        : clubs.filter((c) => Number(c.manager) === currentUser.id).map((c) => c.id);

    let list = memberships.filter((m) => managedClubIds.includes(m.club));
    if (statusFilter) {
      list = list.filter((m) => m.status === statusFilter);
    }
    return createResponse(
      config,
      200,
      list.map((m) => hydrateMembership(m, users, clubs))
    );
  }

  // 15. PATCH /manager/membership-requests/:id (Assigned CLUB_MANAGER or ADMIN)
  const managerReqMatch = cleanPath.match(/^\/manager\/membership-requests\/(\d+)$/);
  if (method === 'PATCH' && managerReqMatch) {
    if (!currentUser) return createError(config, 401, { detail: 'Authentication required.' });
    const reqId = Number(managerReqMatch[1]);
    const idx = memberships.findIndex((m) => m.id === reqId);
    if (idx === -1) return createError(config, 404, { detail: 'Membership request not found.' });

    const targetMembership = memberships[idx];
    const targetClub = clubs.find((c) => c.id === targetMembership.club);
    const isAssignedManager =
      currentUser.role === 'CLUB_MANAGER' && targetClub && Number(targetClub.manager) === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isAssignedManager && !isAdmin) {
      return createError(config, 403, {
        detail: 'You are not authorized to approve or reject applications for this club.',
      });
    }

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(body.status)) {
      return createError(config, 400, { status: ['Invalid status value.'] });
    }

    memberships[idx].status = body.status;
    memberships[idx].updated_at = new Date().toISOString();
    saveMemberships(memberships);
    return createResponse(config, 200, hydrateMembership(memberships[idx], users, clubs));
  }

  return createError(config, 404, { detail: `Mock endpoint not found: ${method} ${cleanPath}` });
}
