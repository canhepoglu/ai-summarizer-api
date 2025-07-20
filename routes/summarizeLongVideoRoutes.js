const express = require('express');
const { summarizeLongVideo } = require('../controllers/summarizeLongVideoController');
const router = express.Router();
router.post('/summarize-long-video', summarizeLongVideo);
module.exports = router;