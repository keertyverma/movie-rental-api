import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Genre, IGenre } from "../../../src/models/genre.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/genres`;

describe("/api/genres", () => {
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
});
