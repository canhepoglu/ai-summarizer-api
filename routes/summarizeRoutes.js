const express = require('express');
const { summarize } = require('../controllers/summarizeController');

module.exports = (upload) => {
    const router = express.Router();
    router.post('/summarize', upload.single('audio'), summarize);
    return router;
};