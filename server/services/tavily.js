require('dotenv').config();
const { tavily } = require('@tavily/core');

const client = tavily({ apiKey: process.env.TAVILY_API });

const RELEVANCE_THRESHOLD = 0.4

const trusted_domains = [
    'who.int', 
    'reliefweb.int',
    'fews.net',
    'icpac.net',
    'redcross.or.ke',
    'meteo.go.ke',
    'ndoc.go.ke',
    'ndma.go.ke',
    'kemri.go.ke',
    'health.go.ke',
    'disastermanagement.go.ke',
    'specialprogrammes.go.ke'
]

async function searchTrustedSources(claimText){
    try {
        const response = await client.search(claimText, {
            includeDomains: trusted_domains,
            maxResults: 5,
            timeRange: 'year',
        });
        const relevant = response.results.filter(r => r.score >= RELEVANCE_THRESHOLD);
        return relevant;
    } catch (error) {
        console.error('Error searching trusted sources:', error);
        throw error;
    }
}

module.exports = { searchTrustedSources };