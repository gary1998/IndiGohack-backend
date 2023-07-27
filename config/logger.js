const winston = require("winston");
class Logger {
  Client = null;
  constructor() {
    this.Client = new winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          level:
            (process.env.LOG_LEVEL && process.env.LOG_LEVEL.toLowerCase()) ||
            "info",
        }),
        new winston.transports.File({
          filename: `${Date.now()}.log`,
          dirname: "logs",
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          level:
            (process.env.LOG_LEVEL && process.env.LOG_LEVEL.toLowerCase()) ||
            "info",
        }),
      ],
    });
  }
}

module.exports = Logger;
