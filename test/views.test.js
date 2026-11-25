const test = require('node:test');
const assert = require('node:assert');
const UserView = require('../views/UserView');
const JobPostingView = require('../views/JobPostingView');
const ApplicationView = require('../views/ApplicationView');
const AdminView = require('../views/AdminView');

test('UserView - renderUsers renders alumni list and form for POST /users', () => {
  const dummyUsers = [
    { id: 1, name: 'Hakan Ural', department: 'Computer Engineering', graduationYear: 2024, email: 'hakan@alumni.edu' },
    { id: 2, name: 'Ayşe Yılmaz', department: 'Industrial Engineering', graduationYear: 2023, email: 'ayse@alumni.edu' }
  ];

  const html = UserView.renderUsers(dummyUsers);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Alumni Directory'));
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('Computer Engineering'));
  assert.ok(html.includes('Ayşe Yılmaz'));
  assert.ok(html.includes('<form action="/users" method="POST">'));
  assert.ok(html.includes('name="name"'));
  assert.ok(html.includes('name="department"'));
  assert.ok(html.includes('name="graduationYear"'));
  assert.ok(html.includes('name="email"'));
});

test('UserView - renderUsers displays success message when passed in options', () => {
  const html = UserView.renderUsers([], { message: 'Alumni created successfully!' });
  assert.ok(html.includes('Alumni created successfully!'));
  assert.ok(html.includes('alert-success'));
});

test('UserView - renderUserDetail renders single alumni profile view', () => {
  const user = { id: 42, name: 'Zeynep Kaya', department: 'Architecture', graduationYear: 2021, email: 'zeynep@alumni.edu' };
  const html = UserView.renderUserDetail(user);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Zeynep Kaya'));
  assert.ok(html.includes('Architecture'));
  assert.ok(html.includes('2021'));
  assert.ok(html.includes('zeynep@alumni.edu'));
});

test('UserView - renderUserEdit renders alumni edit form view', () => {
  const user = { id: 10, name: 'Can Demir', department: 'Economics', graduationYear: 2022, email: 'can@alumni.edu' };
  const html = UserView.renderUserEdit(user);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Edit Alumni Profile'));
  assert.ok(html.includes('action="/users/10/edit"'));
  assert.ok(html.includes('value="Can Demir"'));
  assert.ok(html.includes('value="Economics"'));
  assert.ok(html.includes('value="2022"'));
  assert.ok(html.includes('value="can@alumni.edu"'));
});

test('UserView - renderProfile renders dedicated personal profile workspace with tabs and forms', () => {
  const user = {
    id: 1,
    name: 'Hakan Ural',
    department: 'Computer Engineering',
    graduationYear: 2024,
    email: 'hakan@istanbul.edu.tr',
    role: 'admin',
    accountStatus: 'active',
    isMentor: true
  };
  const jobs = [
    { id: 10, title: 'Lead Architect', company: 'IU Tech', jobType: 'Full-time', location: 'Istanbul', status: 'Active' }
  ];
  const applications = [
    { id: 20, jobPostingId: 10, jobTitle: 'Lead Architect', jobCompany: 'IU Tech', status: 'Accepted', appliedAt: '2026-11-01' }
  ];

  const html = UserView.renderProfile(user, { jobs, applications, message: 'Profil başarıyla güncellendi' });
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('hakan@istanbul.edu.tr'));
  assert.ok(html.includes('Computer Engineering'));
  assert.ok(html.includes('2024'));
  assert.ok(html.includes('action="/profile/edit"'));
  assert.ok(html.includes('action="/profile/password"'));
  assert.ok(html.includes('Lead Architect'));
  assert.ok(html.includes('Profil başarıyla güncellendi'));
  assert.ok(html.includes('Verified Mentor'));
});

test('JobPostingView - renderJobs renders job postings board and creation form', () => {
  const dummyJobs = [
    { id: 1, title: 'Senior Backend Engineer', company: 'TechCorp', location: 'Remote', jobType: 'Full-time', salary: '₺85,000', status: 'Active' },
    { id: 2, title: 'Data Scientist', company: 'DeepData', location: 'Ankara', jobType: 'Full-time', salary: '₺95,000', status: 'Active' }
  ];

  const html = JobPostingView.renderJobs(dummyJobs);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Job Postings & Career Opportunities'));
  assert.ok(html.includes('Senior Backend Engineer'));
  assert.ok(html.includes('TechCorp'));
  assert.ok(html.includes('Data Scientist'));
  assert.ok(html.includes('<form action="/jobs" method="POST">'));
});

test('JobPostingView - renderJobDetail renders single job detail with application form', () => {
  const job = {
    id: 1,
    title: 'Senior Backend Engineer',
    company: 'TechCorp',
    location: 'Istanbul / Hybrid',
    jobType: 'Full-time',
    salary: '₺85,000 / month',
    contactEmail: 'careers@techcorp.com',
    description: 'Scaling distributed cloud microservices',
    requirements: 'Node.js, PostgreSQL, Docker',
    postedBy: 1,
    postedByUser: { name: 'Hakan Ural' }
  };

  const html = JobPostingView.renderJobDetail(job);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Senior Backend Engineer'));
  assert.ok(html.includes('TechCorp'));
  assert.ok(html.includes('Quick Apply with Alumni Profile'));
  assert.ok(html.includes('<form action="/applications" method="POST">'));
  assert.ok(html.includes('name="jobPostingId" value="1"'));
});

test('JobPostingView - renderJobEdit renders edit form pre-filled with job data', () => {
  const job = {
    id: 5,
    title: 'Security Analyst',
    company: 'SecureNet',
    location: 'Izmir',
    jobType: 'Full-time',
    salary: '₺80,000',
    contactEmail: 'sec@securenet.com',
    description: 'Security auditing',
    requirements: 'SIEM tools',
    status: 'Active'
  };

  const html = JobPostingView.renderJobEdit(job);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('action="/jobs/5/edit"'));
  assert.ok(html.includes('value="Security Analyst"'));
  assert.ok(html.includes('value="SecureNet"'));
});

test('ApplicationView - renderApplications renders application dashboard table and metrics', () => {
  const dummyApps = [
    { id: 1, userId: 1, candidateName: 'Hakan Ural', jobPostingId: 1, jobTitle: 'Senior Backend Engineer', jobCompany: 'TechCorp', resumeUrl: 'https://example.com/cv.pdf', status: 'Submitted', appliedAt: '2026-10-21' },
    { id: 2, userId: 2, candidateName: 'Ayşe Yılmaz', jobPostingId: 2, jobTitle: 'Data Scientist', jobCompany: 'DeepData', status: 'Accepted', appliedAt: '2026-10-21' }
  ];

  const html = ApplicationView.renderApplications(dummyApps);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Job Applications & Candidate Submissions'));
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('TechCorp'));
  assert.ok(html.includes('Total Applications'));
  assert.ok(html.includes('<form action="/applications" method="POST">'));
});

test('ApplicationView - renderApplicationDetail renders candidate review card', () => {
  const app = {
    id: 1,
    userId: 1,
    user: { name: 'Hakan Ural', email: 'hakan@alumni.edu', department: 'Computer Engineering', graduationYear: 2024 },
    jobPostingId: 2,
    jobPosting: { title: 'Backend Lead', company: 'CloudOps', location: 'Remote' },
    resumeUrl: 'https://example.com/cv.pdf',
    coverNote: 'Excited about distributed architecture',
    status: 'Under Review',
    appliedAt: '2026-10-21'
  };

  const html = ApplicationView.renderApplicationDetail(app);
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Application Record #1'));
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('Backend Lead'));
  assert.ok(html.includes('CloudOps'));
  assert.ok(html.includes('Excited about distributed architecture'));
  assert.ok(html.includes('action="/applications/1/status"'));
});

test('UserView - renderRegister renders functional registration page with role selector and inputs', () => {
  const html = UserView.renderRegister({
    formData: {
      name: 'Deniz Arslan',
      email: 'deniz@alumni.edu',
      department: 'Faculty of Law (Hukuk Fakültesi)',
      graduationYear: 2025,
      role: 'student',
      title: 'Law Intern',
      company: 'Bosphorus Legal',
      isMentor: true
    }
  });
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Register for the Istanbul University Network'));
  assert.ok(html.includes('action="/register" method="POST"'));
  assert.ok(html.includes('name="role"'));
  assert.ok(html.includes('name="name"'));
  assert.ok(html.includes('name="email"'));
  assert.ok(html.includes('name="password"'));
  assert.ok(html.includes('name="confirmPassword"'));
  assert.ok(html.includes('name="department"'));
  assert.ok(html.includes('name="graduationYear"'));
  assert.ok(html.includes('name="studentNumber"'));
  assert.ok(html.includes('name="title"'));
  assert.ok(html.includes('name="company"'));
  assert.ok(html.includes('name="linkedinUrl"'));
  assert.ok(html.includes('name="isMentor"'));
  assert.ok(html.includes('value="Deniz Arslan"'));
  assert.ok(html.includes('value="deniz@alumni.edu"'));
});

test('UserView - renderLogin renders login view with credentials inputs, options, and demo logins', () => {
  const html = UserView.renderLogin({
    email: 'hakan@alumni.edu',
    returnUrl: '/users',
    rememberMe: true
  });
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Member Portal Login'));
  assert.ok(html.includes('action="/login" method="POST"'));
  assert.ok(html.includes('name="email"'));
  assert.ok(html.includes('name="password"'));
  assert.ok(html.includes('name="rememberMe"'));
  assert.ok(html.includes('value="hakan@alumni.edu"'));
  assert.ok(html.includes('value="/users"'));
  assert.ok(html.includes('checked'));
  assert.ok(html.includes('Quick Demo Sign-In'));
  assert.ok(html.includes('/register'));
});

test('UserView - renderLogin displays error alert when error option is supplied', () => {
  const html = UserView.renderLogin({
    error: 'Invalid email or password.',
    email: 'bad@alumni.edu'
  });
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('alert-danger'));
  assert.ok(html.includes('Invalid email or password.'));
  assert.ok(html.includes('value="bad@alumni.edu"'));
});

test('UserView - renderLogin displays success alert when message option is supplied', () => {
  const html = UserView.renderLogin({
    message: 'You have been logged out successfully. See you soon!',
    alertType: 'success'
  });
  assert.ok(typeof html === 'string');
  assert.ok(html.includes('alert-success'));
  assert.ok(html.includes('You have been logged out successfully'));
});

test('AdminView - renderDashboard renders administration console with KPI metrics and governance controls', () => {
  const dummyData = {
    users: [
      { id: 1, name: 'Hakan Ural', email: 'hakan@alumni.edu', role: 'admin', accountStatus: 'active' },
      { id: 2, name: 'Ayşe Yılmaz', email: 'ayse@alumni.edu', role: 'student', accountStatus: 'active' }
    ],
    jobs: [
      { id: 1, title: 'AI Engineer', company: 'Google', status: 'Active' }
    ],
    announcements: [
      { id: 1, title: 'Alumni Reunion Gala', category: 'Event', date: '2026-12-01' }
    ],
    applications: [
      { id: 1, status: 'Submitted', candidateName: 'Ayşe Yılmaz', jobTitle: 'AI Engineer' }
    ]
  };

  const html = AdminView.renderDashboard(dummyData, {
    message: 'Role updated successfully for User #2!',
    alertType: 'success',
    currentUser: { name: 'SuperAdmin', email: 'admin@istanbul.edu.tr', role: 'admin' }
  });

  assert.ok(typeof html === 'string');
  assert.ok(html.includes('Administration Panel'));
  assert.ok(html.includes('Role updated successfully for User #2!'));
  assert.ok(html.includes('alert-success'));
  assert.ok(html.includes('Hakan Ural'));
  assert.ok(html.includes('Ayşe Yılmaz'));
  assert.ok(html.includes('AI Engineer'));
  assert.ok(html.includes('Alumni Reunion Gala'));
  assert.ok(html.includes('/admin/users/1/role'));
  assert.ok(html.includes('/admin/users/1/status'));
  assert.ok(html.includes('/admin/manipulate'));
  assert.ok(html.includes('Fast Direct Data Manipulation'));
});

