const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const {
  logger,
  authMiddleware,
  genericNotFoundPageHandler,
  notFoundGuardian,
  guardian404ErrorHandler,
  serverErrorGuardian
} = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

// View Engine Configuration (MVC View Layer)
const UserView = require('./views/UserView');
const AnnouncementView = require('./views/AnnouncementView');
const JobPostingView = require('./views/JobPostingView');
const ApplicationView = require('./views/ApplicationView');
const NotFoundView = require('./views/NotFoundView');
const AdminView = require('./views/AdminView');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', (filePath, options, callback) => {
  try {
    if (filePath.endsWith('admin.html')) {
      const output = AdminView.renderDashboard(options.data || options, options);
      return callback(null, output);
    }
    if (filePath.endsWith('users.html')) {
      const output = UserView.renderUsers(options.users || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('userDetail.html')) {
      const output = UserView.renderUserDetail(options.user || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('userEdit.html')) {
      const output = UserView.renderUserEdit(options.user || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('register.html')) {
      const output = UserView.renderRegister(options);
      return callback(null, output);
    }
    if (filePath.endsWith('login.html')) {
      const output = UserView.renderLogin(options);
      return callback(null, output);
    }
    if (filePath.endsWith('profile.html')) {
      const output = UserView.renderProfile(options.user || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('announcements.html')) {
      const output = AnnouncementView.renderAnnouncements(options.announcements || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('announcementDetail.html')) {
      const output = AnnouncementView.renderAnnouncementDetail(options.announcement || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('announcementEdit.html')) {
      const output = AnnouncementView.renderAnnouncementEdit(options.announcement || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('jobs.html')) {
      const output = JobPostingView.renderJobs(options.jobs || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('jobDetail.html')) {
      const output = JobPostingView.renderJobDetail(options.job || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('jobEdit.html')) {
      const output = JobPostingView.renderJobEdit(options.job || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('applications.html')) {
      const output = ApplicationView.renderApplications(options.applications || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('applicationDetail.html')) {
      const output = ApplicationView.renderApplicationDetail(options.application || {}, options);
      return callback(null, output);
    }
    if (filePath.endsWith('404.html')) {
      const output = NotFoundView.renderNotFound(options);
      return callback(null, output);
    }
    const fs = require('fs');
    fs.readFile(filePath, 'utf-8', callback);
  } catch (err) {
    callback(err);
  }
});

// Swagger Documentation
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/swagger.json', (req, res) => res.json(swaggerDocument));

// Routes (MVC Architecture)
const apiUserRoutes = require('./routes/apiUser');
const userRoutes = require('./routes/user');
const apiAnnouncementRoutes = require('./routes/apiAnnouncement');
const announcementRoutes = require('./routes/announcement');

// Authentication & Session Endpoints (Web & REST API)
const ApiUserController = require('./controllers/ApiUserController');
const UserController = require('./controllers/UserController');

app.post(['/api/login', '/api/auth/login'], ApiUserController.login);
app.post(['/api/logout', '/api/auth/logout'], ApiUserController.logout);
app.get(['/api/me', '/api/users/me', '/api/profile'], ApiUserController.me);

app.get(['/login', '/signin'], UserController.getLoginForm);
app.post(['/login', '/signin'], UserController.login);
app.get(['/logout', '/signout'], UserController.logout);
app.post(['/logout', '/signout'], UserController.logout);
app.get(['/register', '/signup'], UserController.getRegisterForm);
app.post(['/register', '/signup', '/api/register'], UserController.register);
app.get(['/profile', '/me'], UserController.getProfile);
app.post('/profile/edit', UserController.updateProfile);
app.post('/profile/password', UserController.updatePassword);

// ApiUser routes -> ApiUserController (RESTful API)
app.use('/apiuser', apiUserRoutes);
app.use('/apiusers', apiUserRoutes);
app.use('/api/users', apiUserRoutes);
app.use('/api/user', apiUserRoutes);

// User routes -> UserController (Web & Presentation)
app.use('/user', userRoutes);
app.use('/users', userRoutes);

// ApiAnnouncement routes -> ApiAnnouncementController (RESTful API)
app.use('/apiannouncement', apiAnnouncementRoutes);
app.use('/apiannouncements', apiAnnouncementRoutes);
app.use('/api/announcements', apiAnnouncementRoutes);
app.use('/api/announcement', apiAnnouncementRoutes);

// Announcement routes -> AnnouncementController (Web & Management Interface)
app.use('/announcement', announcementRoutes);
app.use('/announcements', announcementRoutes);

// ApiJobPosting routes -> ApiJobPostingController (Direct RESTful API & Nested under users)
const apiJobPostingRoutes = require('./routes/apiJobPosting');
const jobPostingRoutes = require('./routes/jobPosting');

app.use('/apijob', apiJobPostingRoutes);
app.use('/apijobs', apiJobPostingRoutes);
app.use('/api/jobs', apiJobPostingRoutes);
app.use('/api/job-postings', apiJobPostingRoutes);

// JobPosting routes -> JobPostingController (Direct Web Presentation)
app.use('/jobs', jobPostingRoutes);
app.use('/job-postings', jobPostingRoutes);

// ApiApplication routes -> ApiApplicationController (Direct RESTful API & Nested under users/jobs)
const apiApplicationRoutes = require('./routes/apiApplication');
const applicationRoutes = require('./routes/application');

app.use('/apiapplication', apiApplicationRoutes);
app.use('/apiapplications', apiApplicationRoutes);
app.use('/api/applications', apiApplicationRoutes);
app.use('/api/application', apiApplicationRoutes);

// Application routes -> ApplicationController (Direct Web Presentation)
app.use('/applications', applicationRoutes);
app.use('/application', applicationRoutes);

// Admin Console & REST API -> AdminController (Strictly Guarded by requireAuth & requireRole('admin'))
const adminRoutes = require('./routes/admin');
const apiAdminRoutes = require('./routes/apiAdmin');

app.use('/admin', adminRoutes);
app.use(['/api/admin', '/apiadmin'], apiAdminRoutes);

app.all('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.all('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.all(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok' });
});

app.all('/hello', (req, res) => {
  res.send('Hello World');
});

app.all('/hello/:name', (req, res) => {
  const { name } = req.params;
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  res.send(`Hello ${formattedName}!`);
});

app.all('/sum/:number1/:number2', (req, res) => {
  const num1 = Number(req.params.number1);
  const num2 = Number(req.params.number2);

  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Lütfen geçerli sayılar giriniz');
  }

  const sum = num1 + num2;
  res.send(`toplam= ${sum}`);
});

// Generic 404 Page & Guardian Middleware Pipeline
app.all(['/404', '/404.html'], genericNotFoundPageHandler);
app.use(notFoundGuardian);
app.use(guardian404ErrorHandler);
app.use(serverErrorGuardian);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
