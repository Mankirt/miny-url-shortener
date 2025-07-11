const express = require('express');
const axios = require('axios');
const router = express.Router();

function generateRandomUrl() {
  const id = Math.random().toString(36).substring(2, 8); // e.g. 'a7sd9f'
  return `https://example.com/page/${id}`;
}

router.get('/', async (req, res) => {
  const count = parseInt(req.query.count) || 50;
  const baseUrl = req.protocol + '://' + req.get('host');

  const promises = [];

  const start = Date.now();

  for (let i = 0; i < count; i++) {
    const original_url = generateRandomUrl();

    const p = axios.post(`${baseUrl}/api/shorten`, { original_url })
      .then(() => ({ ok: true }))
      .catch(err => {
        console.error(err.message);
        return { ok: false };
      });

    promises.push(p);
  }

  const results = await Promise.all(promises);
  const end = Date.now();

  const success = results.filter(r => r.ok).length;
  const fail = count - success;
  const avgMs = (end - start) / count;

  res.json({ total: count, success, fail, avgMs });
});

module.exports = router;
