const express  = require('express');
const router = express.Router();
const { simplifyBulletin } = require('../services/groq');
const { sendSms } = require('../services/sms');
const  pool = require('../db');

router.post('/preview', async (req, res) => {
  const { original_text, ward, language } = req.body;
  if (!original_text?.trim()) {
    return res.status(400).json({error: 'Original Text is Required'});
  }

  try{
    const simplified_text = await simplifyBulletin(original_text, language);
    const result = await pool.query(
      `INSERT INTO bulletins (original_text, simplified_text, language, ward)
      VALUES ($1, $2, $3, $4) returning id `,
      [original_text, simplified_text, language, ward]
    );
    res.status(201).json({bulletin_id: result.rows[0].id, simplified_text})
  }catch(err){
    console.error(err);
    res.status(500).json({error: "Failed to simplify Bulletin"});
  }

});

// To send to every subscriber in their respective wards with their preferred language
router.post('/:id/send', async (req, res) => {
  const { id } = req.params;
  try{
    const bulletinResult = await pool.query(`SELECT * FROM bulletins where id = $1 `, [id]);
    const bulletin = bulletinResult.rows[0];
    if (!bulletin) return res.status(404).json({error: "Bulletin not found"});

    const subsResult = await pool.query(`SELECT id, phone_number, preferred_language FROM subscribers where ward = $1`, [bulletin.ward])
    if (subsResult.rows.length === 0) return res.status(204).json({ error: "No subscribers found for this ward"});

    //Group Subscribers by language
    const groups = {};
    for (const sub of subsResult.rows) {
      const lang = sub.preferred_language || 'sw';
      groups[lang] = groups[lang] || [];
      groups[lang].push(sub);
    };
    let totalSent = 0;
    for (const [lang, subs] of Object.entries(groups)) {
      const text = lang === bulletin.language ? bulletin.simplified_text : simplifyBulletin(bulletin.original_text, lang);

      const numbers = subs.map (s => s.phone_number);
      sendSms(numbers, text);

      const subIds = subs.map(s => s.id);
      await pool.query(`UPDATE subscribers SET last_bulletin_id = $1 where id = any($2)`, [bulletin.id, subIds]);
      totalSent += numbers.length;
    };
    await pool.query(`UPDATE bulletins SET sent_at = now() where id = $1`, [id]);
    res.json({ sent: true, recipients: totalSent, languages: Object.keys(groups) });


  }catch(err){
    console.error(err);
    res.status(500).json({error: "Failed to send bulletin"});
  }
});

module.exports = router;