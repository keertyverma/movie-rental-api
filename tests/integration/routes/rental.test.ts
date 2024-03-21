import request from "supertest";
import { Types, disconnect } from "mongoose";
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

      const res = await request(server).get(endpoint);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);

      const rentalData = res.body.data[0];
      expect(rentalData._id).toBe(rental.id);
      expect(rentalData.customer._id).toBe(customer.id);
      expect(rentalData.movie._id).toBe(movie.id);
    });
  });

  describe("POST /", () => {
    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // customerId and movieId are the required parameters.
      const rentalData = {
        customerId: new Types.ObjectId().toString(),
      };
      const res = await request(server).post(endpoint).send(rentalData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"movieId" is required',
      });
    });
    it("should return BadRequest-400 if movieId data format is wrong", async () => {
      // movieId value must be a mongodb objectId
      const rentalData = {
        customerId: new Types.ObjectId().toString(),
        movieId: "123",
      };
      const res = await request(server).post(endpoint).send(rentalData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"movieId" must be a valid MongoDB ObjectId',
      });
    });
    it("should return BadRequest-400 if movieId is invalid", async () => {
      // create customer
      const customer = await Customer.create({
        name: "Mickey Mouse",
        phone: "1234567891",
      });
      // There is no movie with given movieId present in DB
      const movieId = new Types.ObjectId().toString();
      const rentalData = {
        customerId: customer.id,
        movieId: movieId,
      };
      const res = await request(server).post(endpoint).send(rentalData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid movieId = ${movieId}`,
      });
    });
    it("should return BadRequest-400 if movie is not in stock", async () => {
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
        numberInStock: 0,
        dailyRentalRate: 5,
      });
      // movie not in stock
      const rentalData = {
        customerId: customer.id,
        movieId: movie.id,
      };
      const res = await request(server).post(endpoint).send(rentalData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Movie not in stock`,
      });
    });

    it("should create rental if movie is in stock", async () => {
      // create customer, movie, genre
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

      const rentalData = {
        customerId: customer.id,
        movieId: movie.id,
      };
      const res = await request(server).post(endpoint).send(rentalData);

      expect(res.statusCode).toBe(201);
      const rental = res.body.data;
      expect(rental._id).not.toBeNull;
      expect(rental.customer._id).toBe(customer.id);
      expect(rental.movie._id).toBe(movie.id);

      //dateOut should be set with valid date format
      expect(rental).toHaveProperty("dateOut");
      const dateOutValue = new Date(rental.dateOut);
      expect(dateOutValue.toString()).not.toBe("Invalid Date");

      // movie numberinstock should be reduced by 1
      const updatedMovie = await Movie.findById(movie.id);
      expect(updatedMovie?.numberInStock).toBe(movie.numberInStock - 1);
    });
  });
});
