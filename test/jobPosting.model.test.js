const test = require('node:test');
const assert = require('node:assert');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

test('JobPosting Model - findAll returns all job postings with filters', async () => {
  const jobs = await JobPosting.findAll();
  assert.ok(Array.isArray(jobs));
  assert.ok(jobs.length >= 3);

  const activeJobs = await JobPosting.findAll({ status: 'Active' });
  assert.ok(activeJobs.every(j => j.status === 'Active'));

  const fullTimeJobs = await JobPosting.findAll({ jobType: 'Full-time' });
  assert.ok(fullTimeJobs.every(j => j.jobType === 'Full-time'));
});

test('JobPosting Model - findById returns job by id or null if not found', async () => {
  const job = await JobPosting.findById(1);
  assert.ok(job);
  assert.strictEqual(job.id, 1);
  assert.strictEqual(job.company, 'TechCorp Innovations');

  const notFound = await JobPosting.findById(9999);
  assert.strictEqual(notFound, null);
});

test('JobPosting Model - create adds new job posting with valid schema', async () => {
  const newJob = await JobPosting.create({
    title: 'Cloud Architect',
    company: 'SkyScale Systems',
    location: 'Remote',
    jobType: 'Full-time',
    description: 'Design enterprise cloud migrations',
    requirements: 'AWS, Kubernetes, Terraform',
    salary: '₺95,000 / month',
    contactEmail: 'jobs@skyscale.com',
    postedBy: 1,
    status: 'Active',
    applicationDeadline: '2026-12-15'
  });

  assert.ok(newJob.id >= 4);
  assert.strictEqual(newJob.title, 'Cloud Architect');
  assert.strictEqual(newJob.company, 'SkyScale Systems');
  assert.strictEqual(newJob.contactEmail, 'jobs@skyscale.com');
  assert.strictEqual(newJob.postedBy, 1);

  const found = await JobPosting.findById(newJob.id);
  assert.strictEqual(found.title, 'Cloud Architect');
});

test('JobPosting Model - update modifies existing job posting or returns null', async () => {
  const updated = await JobPosting.update(1, { salary: '₺120,000 / month' });
  assert.ok(updated);
  assert.strictEqual(updated.salary, '₺120,000 / month');

  const notFound = await JobPosting.update(9999, { salary: '₺100' });
  assert.strictEqual(notFound, null);
});

test('JobPosting Model - delete removes job posting or returns null', async () => {
  const tempJob = await JobPosting.create({
    title: 'Temporary Role',
    company: 'Temp Corp',
    contactEmail: 'temp@temp.com'
  });

  const deleted = await JobPosting.delete(tempJob.id);
  assert.strictEqual(deleted.id, tempJob.id);

  const check = await JobPosting.findById(tempJob.id);
  assert.strictEqual(check, null);
});

test('JobPosting Model - findByCompany and findByJobType search correctly', async () => {
  const byCompany = await JobPosting.findByCompany('Digital Solutions');
  assert.ok(byCompany.length >= 1);
  assert.strictEqual(byCompany[0].company, 'Digital Solutions Lab');

  const byType = await JobPosting.findByJobType('Internship');
  assert.ok(byType.length >= 1);
  assert.strictEqual(byType[0].jobType, 'Internship');
});

test('Relationship: JobPosting.findByIdWithUser returns job with populated user', async () => {
  const jobWithUser = await JobPosting.findByIdWithUser(1);
  assert.ok(jobWithUser);
  assert.strictEqual(jobWithUser.id, 1);
  if (jobWithUser.postedBy) {
    assert.ok(jobWithUser.user);
    assert.strictEqual(jobWithUser.user.id, jobWithUser.postedBy);
  }
});

test('Relationship: JobPosting.getPostedByUser returns publisher alumni user', async () => {
  const user = await JobPosting.getPostedByUser(1);
  if (user) {
    assert.strictEqual(user.id, 1);
    assert.ok(user.name);
  }
});

test('Relationship: User.getJobPostings and findByIdWithJobPostings return user jobs', async () => {
  const userJobs = await User.getJobPostings(1);
  assert.ok(Array.isArray(userJobs));

  const userWithJobs = await User.findByIdWithJobPostings(1);
  assert.ok(userWithJobs);
  assert.strictEqual(userWithJobs.id, 1);
  assert.ok(Array.isArray(userWithJobs.jobPostings));
});
