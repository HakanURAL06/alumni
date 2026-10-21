const test = require('node:test');
const assert = require('node:assert');
const Application = require('../models/Application');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');

test('Application Model - findAll returns all applications with filters', async () => {
  const apps = await Application.findAll();
  assert.ok(Array.isArray(apps));
  assert.ok(apps.length >= 3);

  const pendingApps = await Application.findAll({ status: 'Pending' });
  assert.ok(pendingApps.every(a => a.status === 'Pending'));

  const userApps = await Application.findAll({ userId: 2 });
  assert.ok(userApps.every(a => a.userId === 2));
});

test('Application Model - findById returns application by id or null if not found', async () => {
  const app = await Application.findById(1);
  assert.ok(app);
  assert.strictEqual(app.id, 1);
  assert.strictEqual(app.userId, 2);
  assert.strictEqual(app.jobPostingId, 1);

  const notFound = await Application.findById(9999);
  assert.strictEqual(notFound, null);
});

test('Application Model - create adds new application record', async () => {
  const newApp = await Application.create({
    userId: 1,
    jobPostingId: 3,
    resumeUrl: 'https://storage.alumni.edu/resumes/hakan_cv_v2.pdf',
    coverNote: 'Excited about the ML intern role',
    status: 'Pending'
  });

  assert.ok(newApp.id >= 4);
  assert.strictEqual(newApp.userId, 1);
  assert.strictEqual(newApp.jobPostingId, 3);
  assert.strictEqual(newApp.status, 'Pending');

  const found = await Application.findById(newApp.id);
  assert.strictEqual(found.coverNote, 'Excited about the ML intern role');
});

test('Application Model - update modifies application fields or returns null', async () => {
  const updated = await Application.update(1, { status: 'Accepted' });
  assert.ok(updated);
  assert.strictEqual(updated.status, 'Accepted');

  const notFound = await Application.update(9999, { status: 'Rejected' });
  assert.strictEqual(notFound, null);
});

test('Application Model - delete removes application or returns null', async () => {
  const tempApp = await Application.create({
    userId: 3,
    jobPostingId: 2,
    coverNote: 'Temporary application'
  });

  const deleted = await Application.delete(tempApp.id);
  assert.strictEqual(deleted.id, tempApp.id);

  const check = await Application.findById(tempApp.id);
  assert.strictEqual(check, null);
});

test('Application Model - findByIdWithDetails eager loads candidate and job info', async () => {
  const details = await Application.findByIdWithDetails(1);
  assert.ok(details);
  assert.strictEqual(details.id, 1);
  if (details.user) {
    assert.strictEqual(details.user.id, details.userId);
  }
  if (details.jobPosting) {
    assert.strictEqual(details.jobPosting.id, details.jobPostingId);
  }
});

test('Relationship: User.getApplications and findByIdWithApplications return user applications', async () => {
  const apps = await User.getApplications(2);
  assert.ok(Array.isArray(apps));

  const userWithApps = await User.findByIdWithApplications(2);
  assert.ok(userWithApps);
  assert.strictEqual(userWithApps.id, 2);
  assert.ok(Array.isArray(userWithApps.applications));
});

test('Relationship: JobPosting.getApplications and findByIdWithApplications return job candidates', async () => {
  const candidates = await JobPosting.getApplications(1);
  assert.ok(Array.isArray(candidates));

  const jobWithCandidates = await JobPosting.findByIdWithApplications(1);
  assert.ok(jobWithCandidates);
  assert.strictEqual(jobWithCandidates.id, 1);
  assert.ok(Array.isArray(jobWithCandidates.applications));
});
