import cron from 'node-cron';
import { processNextPost } from '../services/poster.js';
import { logger } from '../utils/logger.js';

// Run every day at 9:00 AM for JavaScript series
cron.schedule('0 9 * * *', async () => {
  logger.info('Cron triggered: Starting daily JS post job');
  try {
    await processNextPost('javascript');
  } catch (err) {
    logger.error(err, 'Cron job failed for JS:');
  }
});

// Run every day at 3:00 PM for DSA series
cron.schedule('0 15 * * *', async () => {
  logger.info('Cron triggered: Starting daily DSA post job');
  try {
    await processNextPost('dsa');
  } catch (err) {
    logger.error(err, 'Cron job failed for DSA:');
  }
});

logger.info('Scheduler started. JS @ 9:00 AM | DSA @ 3:00 PM.');
