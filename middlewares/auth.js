const jwt = require("jsonwebtoken");

const verifyToken = (logger) => (req, res, next) => {
  logger.Client.debug("verifying auth token...");
  const token = req.headers["authorization"];
  if (!token) {
    logger.Client.error("no auth token was provided");
    return res.status(403).send({ error: "auth token not supplied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY || "IndiGoHack");
    req.user = decoded;
  } catch (err) {
    logger.Client.error("auth token is invalid");
    return res.status(401).send({ error: "invalid token supplied" });
  }
  return next();
};

module.exports = verifyToken;
