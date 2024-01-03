import pino from "pino";
import { Logger } from "next-axiom";

// Custom logger wrapper that swaps the arguments for the Pino logger
class PinoLoggerWrapper {
  constructor(private logger: pino.Logger) {}

  // Wrapper methods for different log levels
  info(msg: string, obj?: object) {
    this.logger.info(msg, obj);
  }

  error(msg: string, obj?: object) {
    this.logger.error(msg, obj);
  }

  debug(msg: string, obj?: object) {
    this.logger.debug(msg, obj);
  }

  warn(msg: string, obj?: object) {
    this.logger.warn(msg, obj);
  }
}

export const getLogger = (context: string, args?: object) => {
  if (process.env.LOGGING_METHOD === "axiom") {
    const logger = new Logger().with({ context, ...args });
    return logger;
  }

  // Create a Pino logger and wrap it with the custom wrapper
  const pinoLogger = pino({
    level: process.env.PINO_LOG_LEVEL || "info",
  }).child({ context, ...args });

  return new PinoLoggerWrapper(pinoLogger);
};