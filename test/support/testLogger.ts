import winston from 'winston';
import * as Transport from 'winston-transport';

const transports: Transport[] = [];

transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    level: 'debug',
  })
);

export const testLogger = winston.createLogger({
  transports,
});
