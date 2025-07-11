const express = require('express');
const router = express.Router();

const db  = require('../db');

const crypto = require('crypto');

const redisClient = require('../redisClient');

const kafka = require('../kafkaMock');

function generateShortUrl() {
    return crypto.randomBytes(3).toString('base64url'); 
}

async function generateUniqueShortCode(){
    let shortCode;
    while (true){
        shortCode = generateShortUrl();
        check = await db.query(
            "Select short_code from urls where short_code=$1",[shortCode]
        );
        if (check.rows.length == 0){
            return shortCode;
        }
    }
}

router.post('/shorten', async (req, res) => {
    const { original_url } = req.body;

    try{
        const cachedShortCode = await redisClient.get(original_url);
        if (cachedShortCode){
            const short_url = `${req.protocol}://${req.get('host')}/${cachedShortCode}`;
            kafka.send("url_lookup", {
                original_url,
                short_code: cachedShortCode,
                timestamp: Date.now(),
                source: "redis",
            });
            return res.status(200).json({short_url})
        }
    }catch (err){
        console.error("Refis GET error:'", err);
    }

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
            try {
                await redisClient.set(original_url, existing.rows[0].short_code,{EX: 3600});
                } catch (err) {
                console.error('Redis SET (from DB) error:', err);
                }
             kafka.send("url_lookup", {
                    original_url,
                    short_code: existing.rows[0].short_code,
                    timestamp: Date.now(),
                    source: "db",
                });
            return res.status(200).json({ short_url });
        }
    } catch (error) {
        console.error("Error checking existing URL:", error);
        return res.status(500).json({error: "Internal server error"});
    }

    const short_code = await generateUniqueShortCode();
    try{
        await db.query(
        'INSERT INTO urls (original_url, short_code) VALUES ($1, $2)', [original_url, short_code]
        );
        kafka.send("url_created", { original_url, short_code, timestamp: Date.now() });
        try{
            await redisClient.set(original_url, short_code, {EX:3600});
        }catch(err){
            console.error("Redis SET error:", err);
        }
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
        const cachedUrl = await redisClient.get(short_code);
        if (cachedUrl) {
            kafka.send("url_visited", { short_code, source: "redis", timestamp: Date.now(), ip: req.ip });
            return res.redirect(cachedUrl);
        }
    }catch (err){
        console.error("Redis GET error:", err);
    }
    try{

        const result = await db.query(
            'SELECT original_url FROM urls WHERE short_code = $1',
            [short_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({error: "URL not found"});
        }
        // Store the original URL in Redis for future requests
        try{
            await redisClient.set(short_code, result.rows[0].original_url, {EX:3600});
        } catch (err) {
            console.error("Redis SET error:", err);
        }
        const original_url = result.rows[0].original_url;
        kafka.send("url_visited", { short_code, source: "db", timestamp: Date.now(), ip: req.ip });
        res.redirect(original_url);
    } catch (error) {
        console.error("Error retrieving original URL:", error);
        res.status(500).json({error: "Internal server error"});
    }
});

module.exports = router;