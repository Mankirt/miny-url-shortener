const express = require('express');
const router = express.Router();

const db  = require('../db');

const crypto = require('crypto');

function generateShortUrl() {
    return crypto.randomBytes(3).toString('base64url'); 
}


router.post('/shorten', async (req, res) => {
    const { original_url } = req.body;

    

    //Basic validation
    if(!original_url || !original_url.startsWith('http')) {
        return res.status(400).json({error: "Invalid or missing URL"});
    }
    try{
        const existing = await db.query(
            'SELECT short_code FROM urls WHERE original_url = $1',
            [original_url]
            );
        if (existing.rows.length > 0) {
            const short_url = `${req.protocol}://${req.get('host')}/${existing.rows[0].short_code}`;
            return res.status(200).json({ short_url });
        }
    } catch (error) {
        console.error("Error checking existing URL:", error);
        return res.status(500).json({error: "Internal server error"});
    }

    const short_code = generateShortUrl();
    try{
        await db.query(
        'INSERT INTO urls (original_url, short_code) VALUES ($1, $2)', [original_url, short_code]
        );
        const short_url = `${req.protocol}://${req.get('host')}/${short_code}`;
        res.status(201).json({short_url});
    } catch (error) {
        console.error("Error inserting URL into database:", error);
        res.status(500).json({error: "Internal server error"});
    }
    
});

router.get('/:short_code', async (req, res) => {
    const {short_code} = req.params;

    try{

        const result = await db.query(
            'SELECT original_url FROM urls WHERE short_code = $1',
            [short_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "URL not found"});
        }

        const original_url = result.rows[0].original_url;
        res.redirect(original_url);
    } catch (error) {
        console.error("Error retrieving original URL:", error);
        res.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;