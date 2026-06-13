import { processNextPost } from '../services/poster.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

async function run() {
  const seriesName = process.argv[2] || env.SERIES || 'javascript';
  logger.info(`Starting scheduled Instagram post job for series: ${seriesName}...`);
  try {
    const post = await processNextPost(seriesName);
    if (post) {
      logger.info('Job completed successfully.');
    } else {
      logger.info('Job completed: No post was processed.');
    }
    process.exit(0);
  } catch (err) {
    logger.error(err, 'Job failed with error:');
    process.exit(1);
  }
}

run();
