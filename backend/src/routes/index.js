const express = require('express');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const petitionRoutes = require('./petition.routes');
const pollRoutes = require('./poll.routes');
const officialRoutes = require('./official.routes'); // Moved to top
const reportRoutes = require('./report.routes');     // Moved to top
const { sendSuccess } = require('../utils/response');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'Civix API is operational', {
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Petition routes
router.use('/petitions', petitionRoutes);

// Poll routes
router.use('/polls', pollRoutes);

// Official routes
router.use('/official', officialRoutes);

// Report routes
router.use('/reports', reportRoutes);

module.exports = router;