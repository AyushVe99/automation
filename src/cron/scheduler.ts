import cron from 'node-cron';
import { processNextPost } from '../services/poster.js';
import { logger } from '../utils/logger.js';

// Run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  logger.info('Cron triggered: Starting daily post job');
  try {
    await processNextPost();
  } catch (err) {
    logger.error(err, 'Cron job failed:');
  }
});

logger.info('Scheduler started. Waiting for next cron trigger...');
