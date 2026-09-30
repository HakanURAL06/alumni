const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store (no database)
const users = [
  { id: 1, name: 'Hakan Ural', department: 'Computer Engineering', graduationYear: 2024, email: 'hakan@alumni.edu' },
  { id: 2, name: 'Ayşe Yılmaz', department: 'Industrial Engineering', graduationYear: 2023, email: 'ayse@alumni.edu' },
  { id: 3, name: 'Mehmet Demir', department: 'Electrical & Electronics Engineering', graduationYear: 2022, email: 'mehmet@alumni.edu' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, department, graduationYear, email } = req.body || {};

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name: name || 'Yeni Mezun',
    department: department || 'Computer Engineering',
    graduationYear: graduationYear ? Number(graduationYear) : 2024,
    email: email || `${(name || 'mezun').toLowerCase().replace(/\s+/g, '')}@alumni.edu`
  };

  users.push(newUser);

  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, department, graduationYear, email } = req.body || {};
  if (name !== undefined) user.name = name;
  if (department !== undefined) user.department = department;
  if (graduationYear !== undefined) user.graduationYear = Number(graduationYear);
  if (email !== undefined) user.email = email;

  res.json({
    message: 'User updated successfully (PUT)',
    user
  });
});

app.patch('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, department, graduationYear, email } = req.body || {};
  if (name !== undefined) user.name = name;
  if (department !== undefined) user.department = department;
  if (graduationYear !== undefined) user.graduationYear = Number(graduationYear);
  if (email !== undefined) user.email = email;

  res.json({
    message: 'User modified successfully (PATCH)',
    user
  });
});

app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = users.splice(index, 1)[0];

  res.json({
    message: 'User deleted successfully',
    deletedUser
  });
});

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
