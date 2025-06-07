const githubService = require('../services/githubService');

exports.home = (req, res) => {
  res.render('pages/home', { error: null });
};

exports.analyzeRepo = async (req, res) => {
  const { repoUrl } = req.body;
  try {
    const data = await githubService.fetchRepoInsights(repoUrl);
    res.render('pages/results', { data, error: null });
  } catch (error) {
    res.render('pages/home', { error: error.message || 'Failed to fetch repo data.' });
  }
};
