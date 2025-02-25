import pino from 'pino';
import { config } from './config';

const isProduction = config.NODE_ENV === 'production';

export const logger = pino({
  level: config.LOG_LEVEL,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            ignore: 'time,pid,hostname,level',
            messageFormat: '[ragpi]: {msg}',
          },
        },
      }),
});
