const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { transcribeAudio } = require('../services/whisperService');
const { summarizeText } = require('../services/gptService');

exports.summarizeFromUrl = async (req, res) => {
    const { url, tone = 'formal', language = 'en' } = req.body;
    try {
        const id = Date.now();
        const audioPath = path.join(__dirname, `../../uploads/from-url-${id}.mp3`);
        const cmd = `yt-dlp -x --audio-format mp3 -o "${audioPath}" "${url}"`;
        execSync(cmd, { stdio: 'inherit' });
        const transcript = await transcribeAudio(audioPath);
        fs.unlinkSync(audioPath);
        const summary = await summarizeText(transcript, tone, language);
        res.json({ transcript, summary, tone, language });
    } catch (err) {
        console.error('YT URL Error:', err);
        res.status(500).json({ error: 'Summarization from URL failed.' });
    }
};
