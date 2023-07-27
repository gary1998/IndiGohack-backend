const auth = require("./auth");

const mockReq = {
  headers: {
    "content-type": "application/json",
    authorization: "abc",
    accept: "application/json",
  },
  user: "",
};

const mockRes = {
  status: () => {
    return {
      send: () => {
        return this;
      },
    };
  },
};

const mockNext = jest.fn();

describe("verifyToken", () => {
  beforeEach(() => {
    delete process.env.MONGO_URI;
  });
  test("if auth token is not provided", () => {
    const Logger = require("../config/logger");
    const logClient = new Logger();
    let verifyToken = auth(logClient);

    delete mockReq.headers["authorization"];
    mockRes.status = (code) => {
      expect(code).toEqual(403);
      return {
        send: (resp) => {
          expect(resp).toEqual({ error: "auth token not supplied" });
        },
      };
    };

    verifyToken(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("if invalid auth token is provided", () => {
    const Logger = require("../config/logger");
    const logClient = new Logger();
    let verifyToken = auth(logClient);

    mockReq.headers["authorization"] = "abc123";
    mockRes.status = (code) => {
      expect(code).toEqual(401);
      return {
        send: (resp) => {
          expect(resp).toEqual({ error: "invalid token supplied" });
        },
      };
    };

    verifyToken(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("if correct auth token is provided", () => {
    const Logger = require("../config/logger");
    const logClient = new Logger();
    let verifyToken = auth(logClient);
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      "sample message",
      process.env.TOKEN_KEY || "IndiGoHack"
    );
    mockReq.headers["authorization"] = token;
    mockRes.status = (code) => {
      expect(code).toEqual(401);
      return {
        send: (resp) => {
          expect(resp).toEqual({ error: "invalid token supplied" });
        },
      };
    };
    verifyToken(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
