const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// View Engine Configuration (MVC View Layer)
const UserView = require('./views/UserView');
const AnnouncementView = require('./views/AnnouncementView');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', (filePath, options, callback) => {
  try {
    if (filePath.endsWith('users.html')) {
      const output = UserView.renderUsers(options.users || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('userDetail.html')) {
      const output = UserView.renderUserDetail(options.user || {});
      return callback(null, output);
    }
    if (filePath.endsWith('userEdit.html')) {
      const output = UserView.renderUserEdit(options.user || {});
      return callback(null, output);
    }
    if (filePath.endsWith('announcements.html')) {
      const output = AnnouncementView.renderAnnouncements(options.announcements || [], options);
      return callback(null, output);
    }
    if (filePath.endsWith('announcementDetail.html')) {
      const output = AnnouncementView.renderAnnouncementDetail(options.announcement || {});
      return callback(null, output);
    }
    if (filePath.endsWith('announcementEdit.html')) {
      const output = AnnouncementView.renderAnnouncementEdit(options.announcement || {});
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
