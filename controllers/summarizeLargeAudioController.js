const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { transcribeAudio } = require('../services/whisperService');
const { summarizeText } = require('../services/gptService');

exports.summarizeLargeAudio = async (req, res) => {
    const { tone = 'formal', language = 'en' } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Audio file is required.' });

    try {
        const id = Date.now();
        const audioPath = req.file.path;
        const chunkDir = path.join(__dirname, `../../uploads/large-audio-${id}`);
        fs.mkdirSync(chunkDir);

        const chunkPaths = splitByDuration(audioPath, chunkDir, 600); // 600 saniye = 10 dakika
        const fullTranscript = await transcribeAllChunks(chunkPaths);

        const finalPrompt = `Lütfen ${tone} tonda ve ${language} dilinde aşağıdaki metni özetle:\n\n${fullTranscript}`;
        const summary = await summarizeText(finalPrompt, tone, language);

        fs.unlinkSync(audioPath);
        fs.rmdirSync(chunkDir, { recursive: true });

        res.json({ summary, tone, language });
    } catch (err) {
        console.error('LARGE AUDIO ERROR:', err);
        res.status(500).json({ error: 'Large audio summarization failed.' });
    }
};

function splitByDuration(inputPath, outputDir, segmentSeconds = 600) {
    const outputPattern = path.join(outputDir, 'part-%03d.mp3');
    const cmd = `ffmpeg -i "${inputPath}" -f segment -segment_time ${segmentSeconds} -c copy "${outputPattern}"`;
    execSync(cmd);

    const files = fs.readdirSync(outputDir)
        .filter(file => file.endsWith('.mp3'))
        .map(file => path.join(outputDir, file))
        .sort();

    return files;
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
