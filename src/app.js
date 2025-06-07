require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Routes
const repoRoutes = require('./routes/repo');
app.use('/', repoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  if (!process.env.GITHUB_TOKEN) {
    console.warn('Warning: No GitHub token provided. API rate limits will be restricted.');
  } else {
    console.log('GitHub token loaded successfully.');
  }
});
