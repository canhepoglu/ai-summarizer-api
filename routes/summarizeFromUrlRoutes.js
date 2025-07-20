const express = require('express');
const { summarizeFromUrl } = require('../controllers/summarizeFromUrlController');
const router = express.Router();
router.post('/summarize-from-url', summarizeFromUrl);
module.exports = router;