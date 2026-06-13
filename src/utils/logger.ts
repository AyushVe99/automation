import pino from 'pino';

export const logger = pino({
  level: process.env.DRY_RUN === 'true' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});
