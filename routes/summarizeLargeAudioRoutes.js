const express = require('express');
const { summarizeLargeAudio } = require('../controllers/summarizeLargeAudioController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/summarize-large-audio', upload.single('audio'), summarizeLargeAudio);

module.exports = router;
