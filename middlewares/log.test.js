const log = require("./log");

let mockReq = {
  method: "POST",
  hostname: "https://example.com",
  url: "/abc123",
};

let mockRes = {
  contentBody: "",
  statusCode: "",
  send: () => {},
  on: () => {},
};

let mockNext = jest.fn();

describe("requestLoggerMiddleware", () => {
  beforeEach(() => {
    delete process.env.MONGO_URI;
  });
  test("if all interfaces are correct", () => {
    const Logger = require("../config/logger");
    const logClient = new Logger();
    let requestLoggerMiddleware = log(logClient);
    mockRes.send = (resp) => {
      expect(resp).toEqual("RECV <<< POST /abc123 https://example.com");
    };
    mockRes.on = (evt, _) => {
      expect(evt).toEqual("finish");
    };
    requestLoggerMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test("if request interface is not correct", () => {
    const Logger = require("../config/logger");
    const logClient = new Logger();
    let requestLoggerMiddleware = log(logClient);
    mockRes.send = (resp) => {
      expect(resp).toEqual("RECV <<< undefined undefined undefined");
    };
    mockRes.on = (evt, _) => {
      expect(evt).toEqual("finish");
    };
    requestLoggerMiddleware("mockReq", mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test("if response interface is not correct", () => {
    try {
      const Logger = require("../config/logger");
      const logClient = new Logger();
      let requestLoggerMiddleware = log(logClient);
      requestLoggerMiddleware(mockReq, "mockRes", mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    } catch (err) {
      expect(err.toString()).toEqual("TypeError: res.on is not a function");
    }
  });
});
