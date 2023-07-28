const mongoose = require("mongoose");

const initDB = (logger) => {
  logger.Client.debug("db connection is being initialized");
  mongoose
    .connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "IndiGoHack",
    })
    .then(() => {
      logger.Client.debug("connection has been established to the db");
    })
    .catch((err) => {
      logger.Client.debug("cannot connect to db, exiting...");
      logger.Client.error(err);
      process.exit(1);
    });
};

module.exports = { initDB };
