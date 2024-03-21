import request from "supertest";
import { disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Movie } from "../../../src/models/movie.model";
import { Customer } from "../../../src/models/customer.model";
import { Rental } from "../../../src/models/rental.model";
import { Genre } from "../../../src/models/genre.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/rentals`;

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
    await Customer.deleteMany({});
    await Rental.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all rental", async () => {
      // populate rental document
      const customer = await Customer.create({
        name: "Mickey Mouse",
        phone: "1234567891",
      });

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

      const rental = await Rental.create({
        customer: {
          _id: customer.id,
          name: customer.name,
          phone: customer.phone,
          isGold: customer.isGold,
        },
        movie: {
          _id: movie.id,
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
        },
      });

      console.log(rental);

      const res = await request(server).get(endpoint);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);

      const rentalData = res.body.data[0];
      expect(rentalData._id).toBe(rental.id);
      expect(rentalData.customer._id).toBe(customer.id);
      expect(rentalData.movie._id).toBe(movie.id);
    });
  });
});
