import cron from 'node-cron';
import { processNextPost } from '../services/poster.js';
import { logger } from '../utils/logger.js';

// ✅ ACTIVE — JavaScript series @ 9:00 AM daily
cron.schedule('0 9 * * *', async () => {
  logger.info('Cron triggered: Starting daily JS post job');
  try {
    await processNextPost('javascript');
  } catch (err) {
    logger.error(err, 'Cron job failed for JS:');
  }
});

// ✅ ACTIVE — React Mastery series @ 12:00 PM daily
cron.schedule('0 12 * * *', async () => {
  logger.info('Cron triggered: Starting daily React Mastery post job');
  try {
    await processNextPost('react-mastery');
  } catch (err) {
    logger.error(err, 'Cron job failed for React Mastery:');
  }
});

// ✅ ACTIVE — Node.js Mastery series @ 3:00 PM daily
cron.schedule('0 15 * * *', async () => {
  logger.info('Cron triggered: Starting daily Node Mastery post job');
  try {
    await processNextPost('node-mastery');
  } catch (err) {
    logger.error(err, 'Cron job failed for Node Mastery:');
  }
});

// ✅ ACTIVE — JS Architecture series @ 6:00 PM daily
cron.schedule('0 18 * * *', async () => {
  logger.info('Cron triggered: Starting daily JS-Arch post job');
  try {
    await processNextPost('js-arch');
  } catch (err) {
    logger.error(err, 'Cron job failed for JS-Arch:');
  }
});

// ⛔ PAUSED — DSA series (data is safe, posting stopped)
// cron.schedule('0 15 * * *', async () => {
//   logger.info('Cron triggered: Starting daily DSA post job');
//   try {
//     await processNextPost('dsa');
//   } catch (err) {
//     logger.error(err, 'Cron job failed for DSA:');
//   }
// });

// ⛔ PAUSED — FAANG-DSA series (data is safe, posting stopped)
// cron.schedule('30 9 * * *', async () => {
//   logger.info('Cron triggered: Starting daily FAANG DSA post job');
//   try {
//     await processNextPost('faang-dsa');
//   } catch (err) {
//     logger.error(err, 'Cron job failed for FAANG DSA:');
//   }
// });

logger.info('Scheduler started. JS @ 9:00 AM | JS-Arch @ 6:00 PM | DSA & FAANG-DSA: PAUSED');

