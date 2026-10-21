/**
 * Models Aggregator
 * Centralizes exports for UserModel, AnnouncementModel, JobPostingModel, and database connection.
 */

const User = require('./User');
const Announcement = require('./Announcement');
const JobPosting = require('./JobPosting');
const Application = require('./Application');
const db = require('./db');

module.exports = {
  User,
  Announcement,
  JobPosting,
  Application,
  db
};
