const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

router.get('/', repoController.home);
router.post('/analyze', repoController.analyzeRepo);

module.exports = router;
