import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Movie } from "../../../src/models/movie.model";
import { Genre } from "../../../src/models/genre.model";
import { User } from "../../../src/models/user.model";

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
      const id = "123";
      const res = await request(server).get(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
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

  describe("POST /", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const res = await request(server).post(endpoint).send({
        title: "king kong",
        numberInStock: 12,
        dailyRentalRate: 2,
      });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if required parameter is not passed", async () => {
      // title, genreId, numberInStock, dailyRentalRate are the required parameters.
      const movieData = {
        title: "king kong",
        numberInStock: 12,
        dailyRentalRate: 2,
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"genreId" is required',
      });
    });

    it("should return BadRequest-400 if genreId data format is wrong", async () => {
      // genreId value must be a mongodb objectId
      const movieData = {
        title: "king kong",
        genreId: "1234",
        numberInStock: 12,
        dailyRentalRate: 2,
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"genreId" must be a valid MongoDB ObjectId',
      });
    });

    it("should return BadRequest-400 if genreId is invalid", async () => {
      // There is no genre with given genreId present in DB
      const genreId = new Types.ObjectId().toString();

      const movieData = {
        title: "king kong",
        genreId: genreId,
        numberInStock: 12,
        dailyRentalRate: 2,
      };

      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(movieData);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid genreId = ${genreId}`,
      });
    });

    it("should create movie if request is valid", async () => {
      // create genre
      const genre = await Genre.create({
        name: "action",
      });
      const movieData = {
        title: "king kong",
        genreId: genre.id,
        numberInStock: 12,
        dailyRentalRate: 2,
      };

      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(movieData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const movieResponse = res.body.data;
      expect(movieResponse.title).toBe(movieData.title);
      expect(movieResponse.genre).toMatchObject({
        name: genre.name,
        _id: genre.id,
      });
      expect(movieResponse.numberInStock).toBe(movieData.numberInStock);
      expect(movieResponse.dailyRentalRate).toBe(movieData.dailyRentalRate);
    });
  });

  describe("PUT /:id", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const id = "123";
      const res = await request(server).put(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "123";
      const res = await request(server)
        .put(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return BadRequest-400 if required parameter are not passed", async () => {
      // title, genreId, numberInStock, dailyRentalRate are the required parameters
      const id = new Types.ObjectId().toString();

      // genreId required parameter is not passed
      const toUpdate = {
        title: "king kong",
        numberInStock: 12,
        dailyRentalRate: 2,
      };
      const res = await request(server)
        .put(`${endpoint}/${id}`)
        .set("x-auth-token", token)
        .send(toUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"genreId" is required',
      });
    });

    it("should return BadRequest-400 if genreId is invalid", async () => {
      // There is no genre with given genreId present in DB
      const genreId = new Types.ObjectId().toString();
      const id = new Types.ObjectId().toString();

      const toUpdate = {
        title: "king kong",
        genreId: genreId,
        numberInStock: 12,
        dailyRentalRate: 2,
      };

      const res = await request(server)
        .put(`${endpoint}/${id}`)
        .set("x-auth-token", token)
        .send(toUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid genreId = ${genreId}`,
      });
    });

    it("should update movie by passing valid id", async () => {
      // create genre and movie
      const genre = await Genre.create({
        name: "action",
      });
      const movie = await Movie.create({
        title: "king kong",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 12,
        dailyRentalRate: 5,
      });

      // update movie
      const toUpdate = {
        title: "king kong",
        genreId: genre.id,
        numberInStock: 11,
        dailyRentalRate: 5,
      };
      const res = await request(server)
        .put(`${endpoint}/${movie.id}`)
        .set("x-auth-token", token)
        .send(toUpdate);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData._id).toBe(movie.id);
      expect(responseData.numberInStock).toBe(toUpdate.numberInStock);
    });
  });

  describe("DELETE /:id", () => {
    let token: string;

    beforeEach(() => {
      const user = new User();
      // user must be admin to perform delete operation
      user.isAdmin = true;
      token = user.generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const id = "123";
      const res = await request(server).delete(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return Forbidden-403 if user is not an admin", async () => {
      // create new user without admin access
      token = new User().generateAuthToken();

      const id = "123";
      const res = await request(server)
        .delete(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(403);
      expect(res.text).toBe(
        "Access Denied. You do not have permission to perform this operation."
      );
    });

    it("should return BadRequest-400 if id is invalid", async () => {
      const id = "123";
      const res = await request(server)
        .delete(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if movie with given id does not exists", async () => {
      const id = "65f415f9fa340f3183c8a44e";
      const res = await request(server)
        .delete(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Movie with id = ${id} was not found.`,
      });
    });

    it("should delete movie by passing valid id", async () => {
      // create genre and movie
      const genre = await Genre.create({
        name: "action",
      });
      const movie = await Movie.create({
        title: "king kong",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 12,
        dailyRentalRate: 5,
      });

      // delete movie
      const res = await request(server)
        .delete(`${endpoint}/${movie.id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData._id).toBe(movie.id);

      // confirm if movie is deleted from db
      const deletedMovie = await Movie.findById(movie.id);
      expect(deletedMovie).toBeNull;
    });
  });
});
