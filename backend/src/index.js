// src/index.js
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('Miny is healthy!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Miny is running on port ${PORT}`);
});

const db = require('./db');

db.query('SELECT NOW()')
  .then(res => console.log('DB connected:', res.rows[0]))
  .catch(err => console.error('DB connection error:', err));



