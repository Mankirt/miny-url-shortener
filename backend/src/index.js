// src/index.js
require('dotenv').config();
const express = require('express');
const app = express();
const shortenRouter = require('./routes/shorten');
const statsRouter = require('./routes/stats');
const simulateRouter = require('./routes/simulate');


app.use(express.json());
app.use('/api', shortenRouter);
app.use('/', shortenRouter);
app.use('/api/stats', statsRouter);
app.use('/api/simulate', simulateRouter);
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



