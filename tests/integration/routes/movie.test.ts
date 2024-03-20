import request from "supertest";
import { disconnect } from "mongoose";
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
});
