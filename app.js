const getApp = (logger) => {
  if (!logger) {
    return null;
  } else {
    logger.Client.debug("express app is being initialized");
  }
  const express = require("express");
  const cors = require("cors");
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  const authMiddleware = require("./middlewares/auth");
  const loggingMiddleware = require("./middlewares/log");
  const UNMR = require("./model/unmr.model.js");
  const Event = require("./model/event.model.js");
  const Staff = require("./model/staff.model.js");

  const app = express();

  app.use(cors());
  app.use(loggingMiddleware(logger));
  app.use(express.json());

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, name, phone, password } = req.body;
      const oldUser = await Staff.findOne({ email });
      if (oldUser) {
        logger.Client.debug(`duplicate user found: ${oldUser}`);
        return res.status(409).send({ error: "user already exists" });
      }
      encryptedPassword = await bcrypt.hash(password, 10);
      const userModel = new Staff({
        email: email.toLowerCase(),
        name,
        phone,
        password: encryptedPassword,
      });
      const user = await userModel.save();
      return res.status(201).json({ email: user.email });
    } catch (err) {
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Staff.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY || "IndiGoHack",
          {
            expiresIn: "2h",
          }
        );
        user.token = token;
        return res.status(200).json({ email: user.email, token: user.token });
      }
      return res.status(400).send({ error: "invalid credentials" });
    } catch (err) {
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  app.post("/api/unmr/register", async (req, res) => {
    try {
      const {
        pnr,
        name,
        date,
        source,
        destination,
        receiver_name,
        receiver_phone,
      } = req.body;
      const oldUNMR = await UNMR.findOne({ pnr });
      if (oldUNMR) {
        logger.Client.debug(`duplicate user found: ${oldUNMR}`);
        return res.status(409).send({ error: "unmr already exists" });
      }
      const unmrModel = new UNMR({
        pnr,
        name,
        date,
        source,
        destination,
        receiver_name,
        receiver_phone,
      });
      const unmr = await unmrModel.save();
      return res.status(201).json(unmr);
    } catch (err) {
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  app.post("/api/unmr/search", async (req, res) => {
    try {
      const { pnr, name, date, source, destination, receiver_phone } = req.body;
      if (date == undefined || date == "") {
        return res.status(400).send({ error: "bad request" });
      }
      let searchQuery = {
        pnr: pnr != undefined || pnr != "" ? pnr : undefined,
        name: name != undefined || name != "" ? name : undefined,
        source: source != undefined || source != "" ? source : undefined,
        destination:
          destination != undefined || destination != ""
            ? destination
            : undefined,
        receiver_phone:
          receiver_phone != undefined || receiver_phone != ""
            ? receiver_phone
            : undefined,
        date: date != undefined || date != "" ? date : undefined,
      };
      Object.keys(searchQuery).forEach(
        (key) => searchQuery[key] === undefined && delete searchQuery[key]
      );
      const searchResults = await UNMR.find(searchQuery);
      return res.status(200).json(searchResults);
    } catch (err) {
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  app.get("/api/unmr/status", async (req, res) => {
    try {
      const pnr = req.query["pnr"];
      if (pnr == null || pnr == undefined || pnr == "") {
        return res.status(400).send({ error: "pnr not supplied" });
      }
      const events = await Event.find({ unmr_pnr: pnr }).sort({ time: -1 });
      return res.status(200).json(events);
    } catch (err) {
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  app.post("/api/admin/feed", authMiddleware(logger), async (req, res) => {
    try {
      const { unmr_pnr, step_number, step_status, event_name } = req.body;
      const eventModel = new Event({
        unmr_pnr,
        step_number,
        step_status,
        time: new Date(),
        event_name,
        staff_email: req.user.email,
      });
      const unmr = await UNMR.findOne({ pnr: unmr_pnr });
      if (!unmr) {
        return res.status(404).send({ error: `no such unmr found` });
      } else {
        let prevEvt = await Event.find({ unmr_pnr }).sort({ time: -1 });
        if (prevEvt.length && prevEvt[0].step_number > step_number) {
          return res.status(400).send({ error: `obsolete status provided` });
        }
        if (prevEvt.length && prevEvt[0].step_status == "failed") {
          return res
            .status(400)
            .send({ error: `${unmr_pnr}'s last status was failure` });
        }
      }
      const event = await eventModel.save();
      return res.status(201).json(event);
    } catch (err) {
      console.log(err);
      logger.Client.error(err);
      return res.status(500).send({ error: err });
    }
  });

  return app;
};

module.exports = { getApp };
