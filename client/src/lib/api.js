const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function submitClaim({ claimText, category, location}) {
    const response = await fetch(`${API_BASE}/api/claims`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({claimText: claimText, category, location, channel: 'web'})
    });

    if (!response.ok) {
        throw new Error("Failed to check claim");
    }

    return response.json();
}

export async function previewBulletin({ originalText, ward, language, accessCode }){
    const response = await fetch(`${API_BASE}/api/bulletins/preview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-code': accessCode,
        },
        body: JSON.stringify({ original_text: originalText, ward, language}),
    });
    if (response.status === 401) throw new Error("UNAUTHORIZED!");
    if (!response.ok) throw new Error("Failed to preview bulletin");
    return response.json();
}

export async function sendBulletin(bulletinId, accessCode) {
    const response = await fetch(`${API_BASE}/api/bulletins/${bulletinId}/send`, {
        method: 'POST',
        headers: { 'x-access-code': accessCode},
    });
    if (response.status === 401) throw new Error("UNAUTHORIZED!");
    if (!response.ok) throw new Error('Failed to send bulletin');
    return response.json();
}