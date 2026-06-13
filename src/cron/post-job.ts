import { processNextPost } from '../services/poster.js';
import { logger } from '../utils/logger.js';

async function run() {
  logger.info('Starting scheduled Instagram post job...');
  try {
    const post = await processNextPost();
    if (post) {
      logger.info('Job completed successfully.');
    } else {
      logger.info('Job completed: No post was processed.');
    }
  } catch (err) {
    logger.error(err, 'Job failed with error:');
    process.exit(1);
  }
}

run();
