import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Genre, IGenre } from "../../../src/models/genre.model";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/genres`;

describe("/api/v1/genres", () => {
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
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      // populate 2 genre documents
      const genres = await Genre.create([
        {
          name: "action",
        },
        {
          name: "romantic",
        },
      ]);

      const res = await request(server).get(endpoint);
      const responseData = res.body.data;

      expect(res.statusCode).toBe(200);
      expect(responseData.length).toBe(genres.length);
      expect(
        responseData.some((genre: IGenre) => genre.name === "action")
      ).toBeTruthy();
      expect(
        responseData.some((genre: IGenre) => genre.name === "romantic")
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const genreId = "123";
      const res = await request(server).get(`${endpoint}/${genreId}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${genreId}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // can not find genre by given id
      const id = new Types.ObjectId().toString();
      const res = await request(server).get(`${endpoint}/${id}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} was not found.`,
      });
    });

    it("should return genre by passing id", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "action",
      });
      const res = await request(server).get(`${endpoint}/${genre.id}`);
      const responseData = res.body.data;
      expect(res.statusCode).toBe(200);
      expect(responseData._id).toBe(genre.id);
      expect(responseData.name).toBe(genre.name);
    });
  });

  describe("POST /", () => {
    let token: string;
    const exec = async (payload: any) => {
      return await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(payload);
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      token = "";
      const res = await exec({ name: "action" });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if token is invalid", async () => {
      token = "invalid token";
      const res = await exec({ name: "action" });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("Invalid token.");
    });

    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // name is the required parameter to create genre.
      const res = await exec({ genrename: "action" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"name" is required',
      });
    });

    it("should return BadRequest-400 if genre name length is not within range of 5 to 25", async () => {
      const res = await exec({ name: "ac" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"name" length must be at least 5 characters long',
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      // passing some parameter in request body which is not allowed
      const res = await exec({
        name: "genre-1",
        randomParam: "this parameter is not allowed",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"randomParam" is not allowed',
      });
    });

    it("should create genre if request is valid", async () => {
      const res = await exec({ name: "action" });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.name).toBe("action"); // genre name should is capitalized
    });
  });

  describe("PATCH /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      // "id" should be of mongoDB object ID format like 65f415f9fa340f3183c8a44e
      const id = "123";
      const res = await request(server).patch(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      // "randomParam" parameter passed on request body is wrong and not allowed
      const toUpdate = {
        name: "new genre",
        randomParam: "abcd",
      };
      const id = new Types.ObjectId().toString();

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"randomParam" is not allowed',
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // genre is not found with given "id"
      const id = new Types.ObjectId().toString();
      const toUpdate = {
        name: "genre-2",
      };

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} was not found.`,
      });
    });

    it("should update genre by passing valid data", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "actions",
      });

      // update genre
      const toUpdate = { name: "action" };
      const res = await request(server)
        .patch(`${endpoint}/${genre.id}`)
        .send(toUpdate);

      expect(res.statusCode).toBe(200);

      const responseData = res.body.data;
      expect(responseData._id).toBe(genre.id);
      expect(responseData.name).toBe("action");
    });
  });

  describe("DELETE /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "123";
      const res = await request(server).delete(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      const id = new Types.ObjectId().toString();
      const res = await request(server).delete(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Genre with id = ${id} was not found.`,
      });
    });

    it("should delete genre by passing valid id", async () => {
      // create a genre
      const genre = await Genre.create({
        name: "action",
      });

      // delete genre
      const res = await request(server).delete(`${endpoint}/${genre.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(genre.id);

      // confirm if genre is deleted from db
      const deletedGenre = await Genre.findById(genre.id);
      expect(deletedGenre).toBeNull;
    });
  });
});
