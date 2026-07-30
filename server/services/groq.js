const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const LANGUAGE_NAMES = { sw: 'Kiswahili', en: 'English', kam: 'Kikamba' };

function buildSimplifyPrompt(languageCode) {
  const language = LANGUAGE_NAMES[languageCode] || 'Kiswahili';
  return `You are a translator and simplifier for emergency bulletins.
Given an official warning bulletin, rewrite it in plain, simple ${language} that a person with no technical background can understand.
Keep it short — 2-4 sentences. Preserve all critical facts (what, where, when, what action to take). Do not add information not present in the original.

Respond ONLY with valid JSON: {"simplified_text": "the translated version"}`;
}

async function simplifyBulletin(originalText, languageCode) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSimplifyPrompt(languageCode) },
        { role: 'user', content: originalText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });
  if (!response.ok) throw new Error(`Groq API error: ${await response.text()}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content).simplified_text;
}

module.exports = { simplifyBulletin };