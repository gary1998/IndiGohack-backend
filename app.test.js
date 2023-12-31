const app = require("./app");

describe("app", () => {
  describe("getApp", () => {
    beforeEach(() => {
      delete process.env.MONGO_URI;
    });
    test("if logger not provided", () => {
      let expressApp = app.getApp();
      expect(expressApp).toBeNull();
    });

    test("if invalid logger is provided", () => {
      try {
        app.getApp("hello");
      } catch (err) {
        expect(err.toString()).toBe(
          "TypeError: Cannot read properties of undefined (reading 'debug')"
        );
      }
    });

    test("if logger is provided", () => {
      let Logger = require("./config/logger");
      let logClient = new Logger();
      let expressApp = app.getApp(logClient);
      expect(expressApp).not.toBeNull();
    });
  });

  describe("e2e", () => {
    beforeAll((done) => {
      done();
    });

    const request = require("supertest");
    const Logger = require("./config/logger");
    const logger = new Logger();
    require("./config/db").initDB(logger);
    const expressApp = app.getApp(logger);

    describe("/api/auth/register", () => {
      test("no body", async () => {
        const res = await request(expressApp).post("/api/auth/register");
        expect(res.statusCode).toEqual(500);
      });
      test("invalid email in body", async () => {
        const res = await request(expressApp).post("/api/auth/register").send({
          email: "abc",
          password: "abc",
          name: "abc",
          phone: "abc",
        });
        expect(res.statusCode).toEqual(500);
      });
      test("invalid phone in body", async () => {
        const res = await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "abc",
        });
        expect(res.statusCode).toEqual(500);
      });
      test("duplicate case", async () => {
        await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "9999999999",
        });
        const res = await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "9999999999",
        });
        expect(res.statusCode).toEqual(409);
        const Staff = require("./model/staff.model.js");
        const resp = await Staff.deleteOne({ email: "abc@def.com" });
        expect(resp.deletedCount).toEqual(1);
      });
      test("success case", async () => {
        const res = await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "9999999999",
        });
        expect(res.statusCode).toEqual(201);
        const Staff = require("./model/staff.model.js");
        const resp = await Staff.deleteOne({ email: "abc@def.com" });
        expect(resp.deletedCount).toEqual(1);
      });
    });

    describe("/api/auth/login", () => {
      test("no body", async () => {
        const res = await request(expressApp).post("/api/auth/login");
        expect(res.statusCode).toEqual(400);
      });
      test("invalid creds in body", async () => {
        const res = await request(expressApp).post("/api/auth/login").send({
          email: "abc",
          password: "abc",
        });
        expect(res.statusCode).toEqual(400);
      });
      test("valid creds in body", async () => {
        await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "9999999999",
        });
        const res = await request(expressApp).post("/api/auth/login").send({
          email: "abc@def.com",
          password: "abc",
        });
        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(JSON.stringify(res.body))).toHaveProperty("token");
        const Staff = require("./model/staff.model.js");
        const resp = await Staff.deleteOne({ email: "abc@def.com" });
        expect(resp.deletedCount).toEqual(1);
      });
    });

    describe("/api/unmr/register", () => {
      test("no body", async () => {
        const res = await request(expressApp).post("/api/unmr/register");
        expect(res.statusCode).toEqual(500);
      });
      test("invalid body", async () => {
        const res = await request(expressApp).post("/api/unmr/register").send({
          name: "abc",
        });
        expect(res.statusCode).toEqual(500);
      });
      test("duplicate case", async () => {
        await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: Date.now(),
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        const res = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: Date.now(),
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(res.statusCode).toEqual(409);
        const UNMR = require("./model/unmr.model.js");
        const resp = await UNMR.deleteOne({ pnr: "abc" });
        expect(resp.deletedCount).toEqual(1);
      });
      test("valid body", async () => {
        const res = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: Date.now(),
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(res.statusCode).toEqual(201);
        expect(JSON.parse(JSON.stringify(res.body))).toHaveProperty("pnr");
        const UNMR = require("./model/unmr.model.js");
        const resp = await UNMR.deleteOne({ pnr: "abc" });
        expect(resp.deletedCount).toEqual(1);
      });
    });

    describe("/api/unmr/search", () => {
      test("no body", async () => {
        const res = await request(expressApp).post("/api/unmr/search");
        expect(res.statusCode).toEqual(400);
      });
      test("invalid body", async () => {
        const res = await request(expressApp).post("/api/unmr/search").send({});
        expect(res.statusCode).toEqual(400);
      });
      test("valid body", async () => {
        const res = await request(expressApp).post("/api/unmr/search").send({
          pnr: "abc",
          date: Date.now(),
        });
        expect(res.statusCode).toEqual(200);
      });
    });

    describe("/api/unmr/status", () => {
      test("no pnr supplied", async () => {
        const res = await request(expressApp).get("/api/unmr/status");
        expect(res.statusCode).toEqual(400);
      });
      test("valid body", async () => {
        const res = await request(expressApp).get("/api/unmr/status?pnr=abc");
        expect(res.statusCode).toEqual(200);
      });
    });

    describe("/api/admin/feed", () => {
      beforeEach(async () => {
        await request(expressApp).post("/api/auth/register").send({
          email: "abc@def.com",
          password: "abc",
          name: "abc",
          phone: "9999999999",
        });
      });
      afterEach(async () => {
        const Staff = require("./model/staff.model.js");
        const resp = await Staff.deleteOne({ email: "abc@def.com" });
        expect(resp.deletedCount).toEqual(1);
      });
      test("no auth token", async () => {
        let res = await request(expressApp).post("/api/admin/feed");
        expect(res.statusCode).toEqual(403);
      });
      test("no body", async () => {
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token);
        expect(res.statusCode).toEqual(404);
      });
      test("invalid body", async () => {
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            name: "abc",
          });
        expect(res.statusCode).toEqual(404);
      });
      test("valid body invalid unmr", async () => {
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        const res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: "abc",
            name: "abc",
            date: Date.now(),
          });
        expect(res.statusCode).toEqual(404);
      });
      test("valid body valid unmr", async () => {
        let unmr = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: "2023-07-06",
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(unmr.statusCode).toEqual(201);
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        const res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "started",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(201);
        const UNMR = require("./model/unmr.model.js");
        await UNMR.deleteOne(JSON.parse(JSON.stringify(unmr.body)));
        const Evt = require("./model/event.model.js");
        await Evt.deleteOne(JSON.parse(JSON.stringify(res.body)));
      });
      test("obsolete event feed", async () => {
        let unmr = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: "2023-07-06",
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(unmr.statusCode).toEqual(201);
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        let res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "completed",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(201);
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "completed",
            time: Date.now(),
            step_number: 2,
          });
        expect(res.statusCode).toEqual(201);
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "started",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(400);
        const UNMR = require("./model/unmr.model.js");
        await UNMR.deleteOne(JSON.parse(JSON.stringify(unmr.body)));
        const Evt = require("./model/event.model.js");
        await Evt.deleteMany({
          unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
        });
      });
      test("same event feed", async () => {
        let unmr = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: "2023-07-06",
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(unmr.statusCode).toEqual(201);
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        let res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "started",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(201);
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "completed",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(400);
        const UNMR = require("./model/unmr.model.js");
        await UNMR.deleteOne(JSON.parse(JSON.stringify(unmr.body)));
        const Evt = require("./model/event.model.js");
        await Evt.deleteMany({
          unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
        });
      });
      test("new feed over failure", async () => {
        let unmr = await request(expressApp).post("/api/unmr/register").send({
          pnr: "abc",
          name: "abc",
          date: "2023-07-06",
          source: "abc",
          destination: "abc",
          receiver_name: "abc",
          receiver_phone: "9999999999",
          parent_email: "abc@xyz.com",
        });
        expect(unmr.statusCode).toEqual(201);
        const loginResp = await request(expressApp)
          .post("/api/auth/login")
          .send({
            email: "abc@def.com",
            password: "abc",
          });
        const user = JSON.parse(JSON.stringify(loginResp.body));
        let res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "failed",
            time: Date.now(),
            step_number: 1,
          });
        expect(res.statusCode).toEqual(201);
        res = await request(expressApp)
          .post("/api/admin/feed")
          .set("Authorization", user.token)
          .send({
            unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
            event_name: "abc",
            step_status: "completed",
            time: Date.now(),
            step_number: 2,
          });
        expect(res.statusCode).toEqual(400);
        const UNMR = require("./model/unmr.model.js");
        await UNMR.deleteOne(JSON.parse(JSON.stringify(unmr.body)));
        const Evt = require("./model/event.model.js");
        await Evt.deleteOne({
          unmr_pnr: JSON.parse(JSON.stringify(unmr.body)).pnr,
        });
      });
    });

    afterAll((done) => {
      const mongoose = require("mongoose");
      mongoose.connection.close();
      done();
    });
  });
});
