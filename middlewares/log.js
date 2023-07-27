const requestLoggerMiddleware = (logger) => (req, res, next) => {
  logger.Client.info(`RECV <<< ${req.method} ${req.url} ${req.hostname}`);
  res.send = resDotSendInterceptor(res, res.send);
  res.on("finish", () => {
    logger.Client.info(`SEND >>> ${res.statusCode}`);
    console.log("\n");
  });
  next();
};

const resDotSendInterceptor = (res, send) => (content) => {
  res.contentBody = content;
  res.send = send;
  res.send(content);
};

module.exports = requestLoggerMiddleware;
