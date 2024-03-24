import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Movie } from "../../../src/models/movie.model";
import { Customer } from "../../../src/models/customer.model";
import { IRental, Rental } from "../../../src/models/rental.model";
import { Genre } from "../../../src/models/genre.model";
import { User } from "../../../src/models/user.model";
import moment from "moment";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/returns`;

describe("/api/v1/returns", () => {
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
    await Movie.deleteMany({});
    await Customer.deleteMany({});
    await Rental.deleteMany({});
  });

  describe("POST /", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const returnData = {
        customerId: new Types.ObjectId().toString(),
      };
      const res = await request(server).post(endpoint).send(returnData);

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // customerId and movieId are the required parameters.
      const returnData = {
        customerId: new Types.ObjectId().toString(),
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(returnData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"movieId" is required',
      });
    });

    it("should return BadRequest-400 if no rental found for the customer/movie", async () => {
      // movieId value must be a mongodb objectId
      const returnData = {
        customerId: new Types.ObjectId().toString(),
        movieId: new Types.ObjectId().toString(),
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(returnData);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: "Rental not found.",
      });
    });

    it("should return BadRequest-400 if return is already processed", async () => {
      // create rental and return it.
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
      await Rental.create({
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
        dateReturned: new Date(),
      });

      const returnData = {
        customerId: customer.id,
        movieId: movie.id,
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(returnData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: "Return already processed.",
      });
    });

    it("should return rental and update movie stock if request is valid", async () => {
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
      // create rental and set dateOut 5 days before date
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
        dateOut: moment().subtract(5, "days"),
      });
      // calculate expecte rental fee
      const rentalDays = 5;
      const expectedRentalFee =
        rentalDays * (rental as IRental).movie.dailyRentalRate;

      // movie not in stock
      const returnData = {
        customerId: customer.id,
        movieId: movie.id,
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(returnData);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData._id).toBe(rental.id);
      // rental should be returned
      expect(responseData.dateReturned).not.toBeNull;
      const rentalInDB = await Rental.findById(rental.id);
      const diff = moment().diff(rentalInDB?.dateReturned, "seconds");
      expect(diff).toBeLessThan(10 * 1000);
      // rental fee is updated
      expect(responseData.rentalFee).toBe(expectedRentalFee);
      // movie stock is increased by 1
      const updatedMovie = await Movie.findById(movie.id);
      expect(updatedMovie?.numberInStock).toBe(movie.numberInStock + 1);
    });
  });
});
