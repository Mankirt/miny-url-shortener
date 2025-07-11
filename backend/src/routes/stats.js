const express = require('express');
const router = express.Router();

const { urlCreatedEvents, urlVisitedEvents, urlLookupEvents } = require('../kafkaConsumers');

router.get('/analytics', (req, res) => {
  res.json({
    urlCreatedCount: urlCreatedEvents.length,
    urlVisitedCount: urlVisitedEvents.length,
    urlLookupCount: urlLookupEvents.length,
    recentUrlCreated: urlCreatedEvents.slice(-5).reverse(),
    recentUrlVisited: urlVisitedEvents.slice(-5).reverse(),
    recentUrlLookup: urlLookupEvents.slice(-5).reverse(),
  });
});

module.exports = router;