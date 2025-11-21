const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { setupMonitoring } = require('./monitoring/sentry');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

const { sentryErrorHandler } = setupMonitoring(app);

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Health and Fitness Tracker API');
});

app.get('/health', (req, res) => {
  const state = require('mongoose').connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ ok: true, db: states[state] ?? state });
});

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

if (sentryErrorHandler) {
  app.use(sentryErrorHandler);
}

module.exports = app;
