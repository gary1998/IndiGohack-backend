const db = require("./db");

describe("initDB", () => {
  let mongo_uri = "";
  beforeEach(() => {
    mongo_uri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;
  });
  afterEach(() => {
    process.env.MONGO_URI = mongo_uri;
  });
  test("if logger not provided", () => {
    try {
      db.initDB();
    } catch (err) {
      expect(err.toString()).toBe(
        "TypeError: Cannot read properties of undefined (reading 'Client')"
      );
    }
  });

  test("if invalid logger is provided", () => {
    try {
      db.initDB();
    } catch (err) {
      expect(err.toString()).toBe(
        "TypeError: Cannot read properties of undefined (reading 'Client')"
      );
    }
  });

  test("if logger is provided, but no uri", () => {
    let loggerDebugCallCount = 0;
    let mockLogger = class Logger {
      Client = null;
      constructor() {
        this.Client = {
          debug: (inp) => {
            if (loggerDebugCallCount == 0) {
              expect(inp).toEqual("db connection is being initialized");
              loggerDebugCallCount++;
            } else {
              expect(inp).toEqual("cannot connect to db, exiting...");
            }
          },
          error: (inp) => {
            expect(inp.toString()).toEqual(
              'MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.'
            );
          },
        };
      }
    };
    let logger = new mockLogger();
    jest.spyOn(process, "exit").mockImplementation((n) => {
      expect(n).toEqual(1);
    });
    let dbClient = db.initDB(logger);
    expect(loggerDebugCallCount).toEqual(1);
    expect(dbClient).toBeUndefined();
  });
});
