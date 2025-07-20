const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeText(text, tone = 'formal', language = 'en') {
    const prompt = `Summarize the following in ${tone} tone and ${language} language:\n\n${text}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a summarizer.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
}

module.exports = { summarizeText };