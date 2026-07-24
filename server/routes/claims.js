const express = require('express');
const router = express.Router();
const pool = require('../db');
const { searchTrustedSources } = require('../services/tavily');


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
                verdict: 'Insufficient Data',
                sourcesFound: 0,
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
            insertedSources.push({ id: sourceResult.rows[0].id, title: t.title, url: t.url, score: t.score });
        }
        res.status(201).json({
            claimId: claimId,
            sourcesFound: insertedSources.length,
            sources: insertedSources
        });
    }catch (error) {
        console.error('Error processing claim:', error);
        res.status(500).json({ error: 'Something went wrong while processing the claim.' });
    }
});

module.exports = router;