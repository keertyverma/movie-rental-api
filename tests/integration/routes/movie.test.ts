import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Movie } from "../../../src/models/movie.model";
import { Genre } from "../../../src/models/genre.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/movies`;

describe("/api/v1/movies", () => {
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
    await Movie.deleteMany({});
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all movies", async () => {
      // populate movie document
      const genre = await Genre.create({
        name: "action",
      });
      const movie = await Movie.create({
        title: "king kong",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 2,
        dailyRentalRate: 5,
      });

      const res = await request(server).get(endpoint);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);

      const movieData = res.body.data[0];
      expect(movieData._id).toBe(movie.id);
      expect(movieData.genre._id).toBe(genre.id);
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
      // can not find movie by given id
      const id = new Types.ObjectId().toString();
      const res = await request(server).get(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Movie with id = ${id} was not found.`,
      });
    });

    it("should return movie by passing id", async () => {
      const genre = await Genre.create({
        name: "action",
      });
      const movie = await Movie.create({
        title: "king kong",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 2,
        dailyRentalRate: 5,
      });

      const res = await request(server).get(`${endpoint}/${movie.id}`);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData._id).toBe(movie.id);
      expect(responseData.title).toBe(movie.title);
      expect(responseData.genre._id).toBe(genre.id);
    });
  });
});
