const test = require('node:test');
const assert = require('node:assert/strict');
const { UserFactory, AnnouncementFactory, JobPostingFactory, ApplicationFactory } = require('../factories');

test('UserFactory - create generates valid default user', () => {
  UserFactory.resetCounter(1);
  const user = UserFactory.create();

  assert.ok(user.id);
  assert.ok(user.name);
  assert.ok(user.department);
  assert.ok(user.graduationYear);
  assert.ok(user.email.includes('@alumni.edu'));
});

test('UserFactory - create applies custom overrides', () => {
  const customUser = UserFactory.create({
    name: 'Custom Alumni',
    department: 'Software Engineering',
    graduationYear: 2025,
    email: 'custom@alumni.edu'
  });

  assert.equal(customUser.name, 'Custom Alumni');
  assert.equal(customUser.department, 'Software Engineering');
  assert.equal(customUser.graduationYear, 2025);
  assert.equal(customUser.email, 'custom@alumni.edu');
});

test('UserFactory - createMany generates specified number of unique users', () => {
  UserFactory.resetCounter(1);
  const count = 5;
  const users = UserFactory.createMany(count);

  assert.equal(users.length, count);
  const ids = new Set(users.map(u => u.id));
  assert.equal(ids.size, count);
});

test('AnnouncementFactory - create generates valid default announcement', () => {
  AnnouncementFactory.resetCounter(1);
  const announcement = AnnouncementFactory.create();

  assert.ok(announcement.id);
  assert.ok(announcement.title);
  assert.ok(announcement.content);
  assert.ok(announcement.category);
  assert.ok(announcement.author);
  assert.ok(announcement.date);
});

test('AnnouncementFactory - create applies custom overrides', () => {
  const customAnnouncement = AnnouncementFactory.create({
    title: 'Custom Job Fair',
    category: 'Career',
    author: 'Placement Cell',
    date: '2026-12-01'
  });

  assert.equal(customAnnouncement.title, 'Custom Job Fair');
  assert.equal(customAnnouncement.category, 'Career');
  assert.equal(customAnnouncement.author, 'Placement Cell');
  assert.equal(customAnnouncement.date, '2026-12-01');
});

test('AnnouncementFactory - createMany generates specified number of announcements', () => {
  AnnouncementFactory.resetCounter(1);
  const count = 4;
  const announcements = AnnouncementFactory.createMany(count);

  assert.equal(announcements.length, count);
  const ids = new Set(announcements.map(a => a.id));
  assert.equal(ids.size, count);
});

test('JobPostingFactory - create generates valid default job posting', () => {
  JobPostingFactory.resetCounter(1);
  const job = JobPostingFactory.create();

  assert.ok(job.id);
  assert.ok(job.title);
  assert.ok(job.company);
  assert.ok(job.jobType);
  assert.ok(job.location);
  assert.ok(job.contactEmail.includes('@'));
  assert.ok(job.postedBy);
});

test('JobPostingFactory - createMany generates specified number of jobs', () => {
  JobPostingFactory.resetCounter(1);
  const count = 5;
  const jobs = JobPostingFactory.createMany(count);

  assert.equal(jobs.length, count);
  const ids = new Set(jobs.map(j => j.id));
  assert.equal(ids.size, count);
});

test('ApplicationFactory - create generates valid default application', () => {
  ApplicationFactory.resetCounter(1);
  const app = ApplicationFactory.create();

  assert.ok(app.id);
  assert.ok(app.userId);
  assert.ok(app.jobPostingId);
  assert.ok(app.resumeUrl);
  assert.ok(app.status);
});

test('ApplicationFactory - createMany generates specified number of applications', () => {
  ApplicationFactory.resetCounter(1);
  const count = 4;
  const apps = ApplicationFactory.createMany(count);

  assert.equal(apps.length, count);
  const ids = new Set(apps.map(a => a.id));
  assert.equal(ids.size, count);
});
