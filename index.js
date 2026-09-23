const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/hello', (req, res) => {
  res.send('Hello World');
});

app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  res.send(`Hello ${formattedName}!`);
});

app.get('/sum/:number1/:number2', (req, res) => {
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
