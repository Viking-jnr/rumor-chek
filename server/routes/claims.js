const express = require('express');
const router = express.Router();
const pool = require('../db');
const { searchTrustedSources } = require('../services/tavily');
const { getVerdict } = require('../services/llm')


router.post('/', async (req, res) => {
    const { claimText, category, location, channel = 'web', subscriber_id = null } = req.body;

    if (!claimText || !claimText.trim()){
        return res.status(400).json({ error: 'Claim text is required!!'});
    }

    try {
        // Update the database with the new claim
        const claimResult = await pool.query(
            `INSERT INTO claims (claim_text, category, location, channel, subscriber_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [claimText, category, location, channel, subscriber_id]
        )
        const claimId = claimResult.rows[0].id

        // Search claims through trusted sources using Tavily
        const trustedResults = await searchTrustedSources(claimText);

        // If no relevant sources are found, insert a verdict of "Insufficient Data"
        if (trustedResults.length === 0) {
            await pool.query(
                `INSERT INTO verdicts (claim_id, verdict, confidence, reasoning)
                VALUES ($1, 'Insufficient Data', 0, 'No sources meeting the relevance threshold were found in the trusted domains.')`,
                [claimId]
            );
            return res.status(200).json({
                claimId: claimId,
                confidence: 0,
                verdict: 'Insufficient Data',
                cited_sources: 0,
                message: 'No relevant sources were found in the trusted domains for this claim.'
            });
        }

        // Cache each result tied to this claim to the database
        const insertedSources = [];
        for (const t of trustedResults){
            const sourceResult = await pool.query(
                `INSERT INTO trusted_sources (title, url, summary, category, region, claim_id, raw_query, relevance_score, fetched_live)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING id`,
                [t.title, t.url, (t.content || '').slice(0, 500), category, location, claimId, claimText, t.score ]
            );
            insertedSources.push({ id: sourceResult.rows[0].id, title: t.title, url: t.url, content: t.content, score: t.score });
        }

        // Call getVerdict to return the verdict of the claim after being processed by the LLM
        let verdictResult
        try{
            verdictResult = await getVerdict(claimText, insertedSources);
        }catch(err){
            console.error('Verdict generation failed:', err);
            verdictResult = {
                verdict: 'unverified',
                confidence: 0,
                reasoning: 'Verdict generation failed. Treat as unverified pending manual review.',
                cited_source_ids: [],
            }
        }
        await pool.query(
            `INSERT into verdicts (claim_id, verdict, confidence, reasoning, cited_sources)
            VALUES ($1, $2, $3, $4, $5)`,
            [claimId, verdictResult.verdict, verdictResult.confidence, verdictResult.reasoning, JSON.stringify(verdictResult.cited_sources)]
        );


        res.status(201).json({
            claimId: claimId,
            verdict: verdictResult.verdict,
            confidence: verdictResult.confidence,
            reasoning: verdictResult.reasoning,
            cited_sources: verdictResult.cited_sources,
            sourcesFound: insertedSources.length,
            sources: insertedSources
        });
    }catch (error) {
        console.error('Error processing claim:', error);
        res.status(500).json({ error: 'Something went wrong while processing the claim.' });
    }
});

router.get('/recent', async (req, res) => {
  try {
    const result = await pool.query(`
      select c.id, c.claim_text, c.category, c.location, c.submitted_at,
             v.verdict, v.confidence, v.reasoning
      from claims c
      left join verdicts v on v.claim_id = c.id
      order by c.submitted_at desc
      limit 20
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent claims' });
  }
});

module.exports = router;