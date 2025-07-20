const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { transcribeAudio } = require('../services/whisperService');
const { summarizeText } = require('../services/gptService');

exports.summarizeLongVideo = async (req, res) => {
    const { url, tone = 'formal', language = 'en' } = req.body;
    try {
        const id = Date.now();
        const audioDir = path.join(__dirname, `../../uploads/segments-${id}`);
        const audioPath = path.join(__dirname, `../../uploads/full-${id}.mp3`);
        fs.mkdirSync(audioDir, { recursive: true });
        const cmdDownload = `yt-dlp -x --audio-format mp3 -o "${audioPath}" "${url}"`;
        execSync(cmdDownload, { stdio: 'inherit' });
        const chunkPaths = await splitAudioIntoChunks(audioPath, audioDir);
        const fullTranscript = await transcribeAllChunks(chunkPaths);
        const prompt = `Lütfen ${tone} tonda ve ${language} dilinde bu transkriptin özetini çıkar:\n\n${fullTranscript}`;
        const summary = await summarizeText(prompt, tone, language);
        fs.unlinkSync(audioPath);
        fs.rmdirSync(audioDir, { recursive: true });
        res.json({ summary, tone, language });
    } catch (err) {
        console.error('LONG VIDEO ERROR:', err);
        res.status(500).json({ error: 'Long video summarization failed.' });
    }
};

async function splitAudioIntoChunks(inputPath, outputDir) {
    const chunkPaths = [];
    const duration = 300; // 5 dakika
    const ffprobePath = require('ffprobe-static').path;
    const getDurationCmd = `${ffprobePath} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
    const totalDuration = parseInt(execSync(getDurationCmd).toString());
    const totalChunks = Math.ceil(totalDuration / duration);

    for (let i = 0; i < totalChunks; i++) {
        const output = path.join(outputDir, `chunk-${i}.mp3`);
        const cmd = `ffmpeg -i "${inputPath}" -ss ${i * duration} -t ${duration} -y "${output}"`;
        execSync(cmd);
        chunkPaths.push(output);
    }

    return chunkPaths;
}

async function transcribeAllChunks(paths) {
    let fullTranscript = '';
    for (const chunk of paths) {
        const text = await transcribeAudio(chunk);
        fullTranscript += text + '\n\n';
        fs.unlinkSync(chunk);
    }
    return fullTranscript;
}