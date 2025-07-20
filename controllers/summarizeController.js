const fs = require('fs');
const { summarizeText } = require('../services/gptService');
const { transcribeAudio } = require('../services/whisperService');

async function summarize(req, res) {
    const { type, tone = 'formal', language = 'en', text } = req.body;
    try {
        let inputText = '';
        if (type === 'text') {
            if (!text) return res.status(400).json({ error: 'Text is required.' });
            inputText = text;
        } else if (type === 'audio') {
            if (!req.file) return res.status(400).json({ error: 'Audio file is required.' });
            inputText = await transcribeAudio(req.file.path);
            fs.unlinkSync(req.file.path);
        } else {
            return res.status(400).json({ error: 'Invalid type: text or audio expected.' });
        }
        const summary = await summarizeText(inputText, tone, language);
        res.json({ transcript: inputText, summary, tone, language });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Summarization failed.' });
    }
}
module.exports = { summarize };