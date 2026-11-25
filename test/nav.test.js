const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const User = require('../models/User');
const {
  getRoleMeta,
  getNavItems,
  renderNavLinksHtml,
  renderTopBarRightHtml,
  injectDynamicNav
} = require('../views/navHelper');

test('navHelper - getRoleMeta returns proper icons and semantic Turkish labels for all roles', () => {
  const adminMeta = getRoleMeta('admin');
  assert.strictEqual(adminMeta.icon, '👑');
  assert.ok(adminMeta.label.includes('Admin'));

  const modMeta = getRoleMeta('moderator');
  assert.strictEqual(modMeta.icon, '⚖️');
  assert.ok(modMeta.label.includes('Moderatör'));

  const empMeta = getRoleMeta('employer');
  assert.strictEqual(empMeta.icon, '💼');
  assert.ok(empMeta.label.includes('İşveren'));

  const stuMeta = getRoleMeta('student');
  assert.strictEqual(stuMeta.icon, '🎓');
  assert.ok(stuMeta.label.includes('Öğrenci'));

  const almMeta = getRoleMeta('alumni');
  assert.strictEqual(almMeta.icon, '🎓');
  assert.ok(almMeta.label.includes('Mezun'));

  const defaultMeta = getRoleMeta('unknown_custom_role');
  assert.strictEqual(defaultMeta.icon, '🎓');
  assert.ok(defaultMeta.label.includes('Mezun'));
});

test('navHelper - getNavItems for Guest (unauthenticated) provides public directory and auth controls', () => {
  const items = getNavItems(null, 'home');
  const labels = items.map(i => i.label);

  assert.ok(labels.includes('Home'));
  assert.ok(labels.includes('Alumni Directory'));
  assert.ok(labels.includes('Announcements'));
  assert.ok(labels.includes('Job Board'));
  assert.ok(labels.includes('Applications'));
  assert.ok(labels.includes('➕ Register'));
  assert.ok(labels.includes('🔑 Login'));

  // Guests MUST NOT see admin or logout actions
  assert.ok(!labels.some(l => l.includes('Admin')));
  assert.ok(!labels.some(l => l.includes('Çıkış')));
});

test('navHelper - getNavItems for Admin role injects prominent Admin Panel and user pill', () => {
  const adminUser = { id: 1, name: 'Hakan Ural', email: 'admin@istanbul.edu.tr', role: 'admin' };
  const items = getNavItems(adminUser, 'admin');
  const labels = items.map(i => i.label);

  assert.ok(labels.includes('🛡️ Admin Panel'));
  assert.ok(items.find(i => i.label === '🛡️ Admin Panel').highlight);
  assert.ok(labels.includes('Home'));
  assert.ok(labels.includes('Alumni Directory'));
  assert.ok(labels.includes('Announcements'));
  assert.ok(labels.includes('Job Board'));
  assert.ok(labels.some(l => l.includes('Hakan Ural')));
  assert.ok(labels.includes('🚪 Çıkış Yap'));

  // Must not have guest auth links
  assert.ok(!labels.includes('🔑 Login'));
  assert.ok(!labels.includes('➕ Register'));
});

test('navHelper - getNavItems for Student role contains student-tailored menu labels', () => {
  const studentUser = { id: 2, name: 'Ayşe Yılmaz', email: 'ayse@alumni.edu', role: 'student' };
  const items = getNavItems(studentUser, 'jobs');
  const labels = items.map(i => i.label);

  assert.ok(labels.includes('Rehber & Mentorlar'));
  assert.ok(labels.includes('💼 İş & Staj'));
  assert.ok(labels.includes('📝 Başvurularım'));
  assert.ok(labels.some(l => l.includes('Ayşe Yılmaz')));
  assert.ok(labels.includes('🚪 Çıkış Yap'));

  // Students must not see admin panel
  assert.ok(!labels.some(l => l.includes('Admin Panel')));
});

test('navHelper - getNavItems for Employer role includes talent pool and candidate review shortcuts', () => {
  const employerUser = { id: 3, name: 'Bosphorus Tech', email: 'hr@bosphorustech.com', role: 'employer' };
  const items = getNavItems(employerUser, 'users');
  const labels = items.map(i => i.label);

  assert.ok(labels.includes('Yetenek Havuzu (Alumni)'));
  assert.ok(labels.includes('Job Board'));
  assert.ok(labels.includes('📢 İlan Ver'));
  assert.ok(labels.includes('📋 Adaylar & Başvurular'));
  assert.ok(labels.some(l => l.includes('Bosphorus Tech')));
  assert.ok(labels.includes('🚪 Çıkış Yap'));

  assert.ok(!labels.some(l => l.includes('Admin Panel')));
});

test('navHelper - getNavItems for Alumni role includes profile and personal jobs/applications shortcuts', () => {
  const alumniUser = { id: 4, userId: 4, name: 'Can Demir', email: 'can@alumni.edu', role: 'alumni' };
  const items = getNavItems(alumniUser, 'users');
  const labels = items.map(i => i.label);

  assert.ok(labels.includes('Alumni Directory'));
  assert.ok(labels.includes('👤 Profilim'));
  assert.ok(labels.includes('💼 İlanlarım'));
  assert.ok(labels.includes('📝 Başvurularım'));
  assert.ok(labels.some(l => l.includes('Can Demir')));
  assert.ok(labels.includes('🚪 Çıkış Yap'));

  const profileItem = items.find(i => i.label === '👤 Profilim');
  assert.strictEqual(profileItem.href, '/users/4');

  const jobsItem = items.find(i => i.label === '💼 İlanlarım');
  assert.strictEqual(jobsItem.href, '/users/4/jobs');
});

test('navHelper - renderNavLinksHtml produces accessible HTML markup and active indicator', () => {
  const html = renderNavLinksHtml(null, 'announcements');
  assert.ok(html.startsWith('<ul class="nav-links"'));
  assert.ok(html.endsWith('</ul>'));
  assert.ok(html.includes('href="/announcements" class="nav-link active"'));
  assert.ok(html.includes('href="/login"'));
});

test('navHelper - renderTopBarRightHtml renders login buttons for guests and user pill + logout for members', () => {
  const guestHtml = renderTopBarRightHtml(null);
  assert.ok(guestHtml.includes('/login'));
  assert.ok(guestHtml.includes('/register'));
  assert.ok(!guestHtml.includes('🚪 Çıkış Yap'));

  const memberUser = { id: 5, name: 'Zeynep Kaya', email: 'zeynep@alumni.edu', role: 'alumni' };
  const memberHtml = renderTopBarRightHtml(memberUser);
  assert.ok(memberHtml.includes('Zeynep Kaya'));
  assert.ok(memberHtml.includes('Mezun'));
  assert.ok(memberHtml.includes('/users/5'));
  assert.ok(memberHtml.includes('🚪 Çıkış Yap'));
  assert.ok(memberHtml.includes('/logout'));
});

test('navHelper - injectDynamicNav updates navigation and top bar in HTML template strings', () => {
  const mockTemplate = `
    <div class="top-bar-inner">
      <div class="top-bar-left">Status</div>
      <div class="top-bar-right">OLD_TOP_BAR</div>
    </div>
    <header class="main-nav">
      <ul class="nav-links">
        <li><a href="/">Old Home</a></li>
      </ul>
    </header>
  `;

  const injected = injectDynamicNav(mockTemplate, {
    currentUser: { id: 1, name: 'Hakan Ural', email: 'admin@istanbul.edu.tr', role: 'admin' },
    activePage: 'users'
  });

  assert.ok(injected.includes('🛡️ Admin Panel'));
  assert.ok(injected.includes('Hakan Ural'));
  assert.ok(injected.includes('🚪 Çıkış Yap'));
  assert.ok(!injected.includes('OLD_TOP_BAR'));
  assert.ok(!injected.includes('Old Home'));
});

test('Integration - Web requests dynamically reflect authentication state and user roles', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. Guest request to /users: sees Login and Register, no Admin Panel, no Logout button
    const guestRes = await fetch(`http://127.0.0.1:${port}/users`, {
      headers: { Accept: 'text/html' }
    });
    assert.strictEqual(guestRes.status, 200);
    const guestHtml = await guestRes.text();
    assert.ok(guestHtml.includes('🔑 Login') || guestHtml.includes('Giriş Yap'));
    assert.ok(guestHtml.includes('➕ Register') || guestHtml.includes('Kayıt Ol'));
    assert.ok(!guestHtml.includes('🛡️ Admin Panel'));
    assert.ok(!guestHtml.includes('🚪 Çıkış Yap'));

    // 2. Authenticated Admin request to /users: sees 🛡️ Admin Panel, 👑 icon, and 🚪 Çıkış Yap
    const adminUser = { id: 4, name: 'Admin User', email: 'admin@istanbul.edu.tr', role: 'admin', accountStatus: 'active' };
    const adminToken = User.createSessionToken(adminUser);

    const adminRes = await fetch(`http://127.0.0.1:${port}/users`, {
      headers: {
        Accept: 'text/html',
        Cookie: `session=${adminToken}`
      }
    });
    assert.strictEqual(adminRes.status, 200);
    const adminHtml = await adminRes.text();
    assert.ok(adminHtml.includes('🛡️ Admin Panel'));
    assert.ok(adminHtml.includes('🚪 Çıkış Yap'));
    assert.ok(adminHtml.includes('👑'));

    // 3. Authenticated Student request to /jobs: sees 💼 İş & Staj, 📝 Başvurularım, and 🎓 icon
    const studentUser = { id: 2, name: 'Ayşe Yılmaz', email: 'ayse@alumni.edu', role: 'student', accountStatus: 'active' };
    const studentToken = User.createSessionToken(studentUser);

    const studentRes = await fetch(`http://127.0.0.1:${port}/jobs`, {
      headers: {
        Accept: 'text/html',
        Cookie: `session=${studentToken}`
      }
    });
    assert.strictEqual(studentRes.status, 200);
    const studentHtml = await studentRes.text();
    assert.ok(studentHtml.includes('💼 İş & Staj'));
    assert.ok(studentHtml.includes('📝 Başvurularım'));
    assert.ok(studentHtml.includes('🚪 Çıkış Yap'));
    assert.ok(!studentHtml.includes('🛡️ Admin Panel'));

    // 4. Authenticated Employer request to /jobs: sees 📢 İlan Ver, 📋 Adaylar & Başvurular, and 💼 icon
    const employerUser = { id: 3, name: 'Tech Employer', email: 'hr@techcorp.com', role: 'employer', accountStatus: 'active' };
    const employerToken = User.createSessionToken(employerUser);

    const employerRes = await fetch(`http://127.0.0.1:${port}/jobs`, {
      headers: {
        Accept: 'text/html',
        Cookie: `session=${employerToken}`
      }
    });
    assert.strictEqual(employerRes.status, 200);
    const employerHtml = await employerRes.text();
    assert.ok(employerHtml.includes('📢 İlan Ver'));
    assert.ok(employerHtml.includes('📋 Adaylar & Başvurular'));
    assert.ok(employerHtml.includes('🚪 Çıkış Yap'));
    assert.ok(!employerHtml.includes('🛡️ Admin Panel'));

    // 5. Static landing pages contain client-side hydration logic
    const indexRes = await fetch(`http://127.0.0.1:${port}/`);
    assert.strictEqual(indexRes.status, 200);
    const indexHtml = await indexRes.text();
    assert.ok(indexHtml.includes('initDynamicNav'));

    const aboutRes = await fetch(`http://127.0.0.1:${port}/about`);
    assert.strictEqual(aboutRes.status, 200);
    const aboutHtml = await aboutRes.text();
    assert.ok(aboutHtml.includes('initDynamicNav'));

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('User-Specific Pages - GET /profile redirects authenticated members to their profile and unauthenticated to /login', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // 1. Unauthenticated GET /profile redirects to /login?returnUrl=/profile
    const unauthRes = await fetch(`http://127.0.0.1:${port}/profile`, {
      headers: { Accept: 'text/html' },
      redirect: 'manual'
    });
    assert.strictEqual(unauthRes.status, 302);
    assert.ok(unauthRes.headers.get('location').includes('/login'));

    // 2. Authenticated GET /profile redirects to /users/:id
    const user = { id: 2, name: 'Ayşe Yılmaz', email: 'ayse@alumni.edu', role: 'student' };
    const token = User.createSessionToken(user);

    const authRes = await fetch(`http://127.0.0.1:${port}/profile`, {
      headers: {
        Accept: 'text/html',
        Cookie: `session=${token}`
      },
      redirect: 'manual'
    });
    assert.strictEqual(authRes.status, 302);
    assert.ok(authRes.headers.get('location').includes('/users/2'));

    // 3. User viewing their own profile sees Personal Workspace banner and role-specific cards
    const profileRes = await fetch(`http://127.0.0.1:${port}/users/2`, {
      headers: {
        Accept: 'text/html',
        Cookie: `session=${token}`
      }
    });
    assert.strictEqual(profileRes.status, 200);
    const profileHtml = await profileRes.text();
    assert.ok(profileHtml.includes('Personal Workspace'));
    assert.ok(profileHtml.includes('Ayşe Yılmaz'));
    assert.ok(profileHtml.includes('Mezun Aktiviteleri'));
    assert.ok(profileHtml.includes('/users/2/applications'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
