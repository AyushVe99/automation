import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { getDb } from './db/index.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { NotFoundError, ValidationError, UnauthorizedError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use('/generated', express.static(path.resolve(__dirname, '../../generated')));

// Mount routes
app.use('/', routes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError) {
    res.status(err.statusCode).send(err.message);
  } else if (err instanceof ValidationError) {
    res.status(err.statusCode).send(`Validation Error: ${err.message}`);
  } else if (err instanceof UnauthorizedError) {
    res.status(err.statusCode).send(err.message);
  } else {
    logger.error(err, 'Unhandled Exception:');
    res.status(500).send('Internal Server Error');
  }
});

async function startServer() {
  try {
    // Initialize DB
    await getDb();
    logger.info('Database initialized.');

    app.listen(PORT, () => {
      logger.info(`🚀 100 Days Content Automation Dashboard running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(err, 'Failed to start server:');
    process.exit(1);
  }
}

// Catch unhandled rejections and exceptions
process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled Rejection:');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception:');
  process.exit(1);
});

startServer();
