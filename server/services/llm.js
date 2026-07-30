const GROQ_URL= 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

const SYSTEM_PROMPT = `You are a fact-verification assistant for early warning and disaster response.
You will be given a claim and a list of sources retrieved from trusted institutional domains (WHO, ReliefWeb, FEWS NET, ICPAC, Red Cross Kenya, Kenya Meteorological Department, NDOC, NDMA).
Rules:
1. Use ONLY the provided sources. Never rely on your own general knowlegde of the topic.
2. If no source directly addresses the claim, respond "unverified" - do not guess.
3. Only respond "false" if a source explicitly contradicts the claim.
4. Only respond "verified" if a source directly confirms the claim.
5. Always cite the specific source IDs your verdict relies on.

Respond only with valid JSON in this exact shape, no other text:
{
 "verdict": "verified" | "unverified" | "false",
 "confidence": 0.0-1.0,
 "reasoning": "One or two sentences. If you are to reference the source in the reasoning, pick out its publicly known name from the source e.g. WHO, Red Cross, fews, relief web and add if verified, mention the date or the month and year, and if you can confirm if the given claim is affecting the given location ",
 "cited_sources": [{"title": "exact source title", "url", "exact source url"}],
}`;

async function getVerdict(claimText, sources) {
    const sourceList = sources.map(
        s => `[${s.id}] ${s.title}\nURL: ${s.url}\nSummary: ${(s.content || '').slice(0, 500)}`
    ).join('\n\n');

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Claim: ${claimText}\nSources:\n${sourceList}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2
        }),
    });
    if (!response.ok) {
        const err_text = await response.text();
        throw new Error(`Groq API error (${response.status}): ${err_text}`);
    }
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

module.exports = { getVerdict };