const userRouter = require('./user');
const apiUserRouter = require('./apiUser');
const announcementRouter = require('./announcement');
const apiAnnouncementRouter = require('./apiAnnouncement');
const jobPostingRouter = require('./jobPosting');
const apiJobPostingRouter = require('./apiJobPosting');
const applicationRouter = require('./application');
const apiApplicationRouter = require('./apiApplication');

module.exports = {
  userRouter,
  apiUserRouter,
  announcementRouter,
  apiAnnouncementRouter,
  jobPostingRouter,
  apiJobPostingRouter,
  applicationRouter,
  apiApplicationRouter
};
