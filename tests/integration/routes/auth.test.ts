import request from "supertest";
import { disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/auth`;

describe("/api/v1/auth", () => {
  afterAll(async () => {
    // close the MongoDB connection
    await disconnect();
  });

  beforeEach(() => {
    server = appServer;
  });

  afterEach(async () => {
    server.close();
    // db cleanup
    await User.deleteMany({});
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // email and password are the required parameter to authenticate user.
      const userData = {
        password: "clubhouse",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"email" is required',
      });
    });

    it("should return BadRequest-400 if user does not exists", async () => {
      // user does not exists
      const userData = {
        email: "test@test.com",
        password: "clubhouse",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid email or password",
      });
    });

    it("should return BadRequest-400 if password is incorrect", async () => {
      // create user
      const user = await User.create({
        name: "Mickey Mouse",
        password: "pluto",
        email: "test@test.com",
      });

      // sending incorrect password
      const userData = {
        email: "test@test.com",
        password: "clubhouse",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Invalid email or password",
      });
    });

    it("should authenticate user if request is valid", async () => {
      // call /register route so it can create user and store hash password
      const registerRes = await request(server)
        .post(`/${config.get("appName")}/api/v1/users/register`)
        .send({
          name: "Mickey Mouse",
          password: "pluto",
          email: "test@test.com",
        });
      expect(registerRes.statusCode).toBe(201);
      expect(registerRes.body.data._id).not.toBeNull;

      const userData = {
        password: "pluto",
        email: "test@test.com",
      };
      const res = await request(server).post(endpoint).send(userData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.message).toBe("Logged in successfully");
      expect(res.body.data.token).not.toBeNull;
    });
  });
});
