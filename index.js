const http = require("http");
const Logger = require("./config/logger");
const logger = new Logger();
const dbClient = require("./config/db");
dbClient.initDB(logger);
const app = require("./app").getApp(logger);
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

server.listen(port, host, () => {
  logger.Client.info(`backend is running at http://${host}:${port}`);
});
