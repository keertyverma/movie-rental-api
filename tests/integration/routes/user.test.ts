import request from "supertest";
import { disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/users`;

describe("/api/v1/users", () => {
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

  describe("POST /register", () => {
    it("should return BadRequest-400 if email parameter is not passed", async () => {
      // name, email and password are the required parameter to create user.
      const userData = {
        name: "Mickey Mouse",
        password: "clubhouse",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);

      expect(res.statusCode).toBe(400);

      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"email" is required',
      });
    });

    it("should return BadRequest-400 if user already registered", async () => {
      await User.create({
        name: "Mickey Mouse",
        password: "clubhouse",
        email: "test@test.com",
      });

      const userData = {
        name: "Mickey Mouse",
        password: "pluto",
        email: "test@test.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "User already registered.",
      });
    });

    it("should create user if request is valid", async () => {
      const userData = {
        name: "Mickey Mouse",
        password: "pluto",
        email: "test@test.com",
      };
      const res = await request(server)
        .post(`${endpoint}/register`)
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.header["x-auth-token"]).not.toBeNull();

      const responseData = res.body.data;
      expect(responseData._id).not.toBeNull;
      expect(responseData.name).toBe(userData.name);
      expect(responseData.email).toBe(userData.email);
      expect(responseData).not.toHaveProperty("password");
    });
  });
});
