// backend/src/kafkaMock.js
const EventEmitter = require('events');

class MockKafka extends EventEmitter {
  send(topic, message) {
    console.log(`[Mock Kafka] Message sent to topic "${topic}":`, message);
    this.emit(topic, message);
  }

  subscribe(topic, handler) {
    this.on(topic, handler);
  }
}

const kafka = new MockKafka();

module.exports = kafka;
