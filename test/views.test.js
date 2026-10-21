const test = require('node:test');
const assert = require('node:assert');
const UserView = require('../views/UserView');
const JobPostingView = require('../views/JobPostingView');
const ApplicationView = require('../views/ApplicationView');

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
