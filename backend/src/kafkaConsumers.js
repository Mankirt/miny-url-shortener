// backend/src/kafkaConsumers.js
const kafka = require('./kafkaMock');

const urlCreatedEvents = [];
const urlVisitedEvents = [];

kafka.subscribe("url_created", (message) => {
  console.log("[Consumer] URL Created Event Received:", message);
  urlCreatedEvents.push({ ...message, receivedAt: Date.now() });
});

kafka.subscribe("url_visited", (message) => {
  console.log("[Consumer] URL Visited Event Received:", message);
  urlVisitedEvents.push({ ...message, receivedAt: Date.now() });
});

// Clear events every 1 hour (3600000 ms)
setInterval(() => {
  urlCreatedEvents.length = 0;
  urlVisitedEvents.length = 0;
  urlLookupEvents.length = 0;
  console.log("[Consumer] Cleared event arrays to free memory.");
}, 60 * 60 * 1000);

// Export arrays to use in API for stats/dashboard
module.exports = {
  urlCreatedEvents,
  urlVisitedEvents
};
