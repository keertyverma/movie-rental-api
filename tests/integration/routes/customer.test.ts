import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Customer, ICustomer } from "../../../src/models/customer.model";
import { User } from "../../../src/models/user.model";

let server: http.Server;
let endpoint: string = `/${config.get("appName")}/api/v1/customers`;

describe("/api/v1/customers", () => {
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
    await Customer.deleteMany({});
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      // populate 2 customer documents
      const customers = await Customer.create([
        {
          name: "Mickey Mouse",
          phone: "1234567891",
          isGold: false,
        },
        {
          name: "Donald Duck",
          phone: "1234567899",
          isGold: true,
        },
      ]);

      const res = await request(server).get(endpoint);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData.length).toBe(customers.length);
      expect(
        responseData.some(
          (customer: ICustomer) => customer.name === "Mickey Mouse"
        )
      ).toBeTruthy();
      expect(
        responseData.some(
          (customer: ICustomer) => customer.name === "Donald Duck"
        )
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return BadRequest-400 if id is invalid", async () => {
      const customerId = "123";
      const res = await request(server).get(`${endpoint}/${customerId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${customerId}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // can not find customer by given id
      const id = new Types.ObjectId().toString();
      const res = await request(server).get(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Customer with id = ${id} was not found.`,
      });
    });

    it("should return customer by passing id", async () => {
      // create a customer
      const customer = await Customer.create({
        name: "Mickey Mouse",
        phone: "1234567891",
        isGold: false,
      });

      const res = await request(server).get(`${endpoint}/${customer.id}`);

      expect(res.statusCode).toBe(200);
      const responseData = res.body.data;
      expect(responseData._id).toBe(customer.id);
      expect(responseData.name).toBe(customer.name);
    });
  });

  describe("POST /", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const id = "123";
      const res = await request(server)
        .post(endpoint)
        .send({ customername: "Donald Duck" });

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if 'name' required parameter is not passed", async () => {
      // name is the required parameter to create customer.
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send({ customername: "Donald Duck" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"name" is required',
      });
    });

    it("should return BadRequest-400 if 'phone' required parameter is not passed", async () => {
      // phone is the required parameter to create customer.
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send({ name: "Donald Duck" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"phone" is required',
      });
    });

    it("should return BadRequest-400 if request body is invalid", async () => {
      // passing some parameter in request body which is not allowed
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send({
          name: "Donald Duck",
          phone: "1234567818",
          randomParam: "this parameter is not allowed",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: '"randomParam" is not allowed',
      });
    });

    it("should create customer if request is valid", async () => {
      const customerData = {
        name: "Mickey Mouse",
        phone: "1234567891",
      };
      const res = await request(server)
        .post(endpoint)
        .set("x-auth-token", token)
        .send(customerData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const responseData = res.body.data;
      expect(responseData.name).toBe(customerData.name);
      expect(responseData.phone).toBe(customerData.phone);
      expect(responseData.isGold).toBeFalsy;
    });
  });

  describe("PATCH /:id", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return UnAuthorized-401 if client is not authorized", async () => {
      // token is not passed in request header
      const id = "123";
      const res = await request(server).patch(`${endpoint}/${id}`);

      expect(res.statusCode).toBe(401);
      expect(res.text).toBe("Access Denied.Token is not provided.");
    });

    it("should return BadRequest-400 if id is invalid", async () => {
      // "id" should be of mongoDB object ID format like 65f415f9fa340f3183c8a44e
      const id = "123";
      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatchObject({
        code: "BAD_REQUEST",
        message: "Invalid input data",
        details: `Invalid id = ${id}`,
      });
    });

    it("should return NotFound-404 if id does not exists", async () => {
      // customer is not found with given "id"
      const id = new Types.ObjectId().toString();
      const toUpdate = {
        name: "mickey mouse",
      };

      const res = await request(server)
        .patch(`${endpoint}/${id}`)
        .set("x-auth-token", token)
        .send(toUpdate);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Customer with id = ${id} was not found.`,
      });
    });

    it("should update customer by passing valid data", async () => {
      // create a customer
      const customer = await Customer.create({
        name: "mickey mousse",
        phone: "1234567891",
      });

      // update customer
      const toUpdate = { name: "Mickey Mouse" };
      const res = await request(server)
        .patch(`${endpoint}/${customer.id}`)
        .set("x-auth-token", token)
        .send(toUpdate);

      expect(res.statusCode).toBe(200);

      const responseData = res.body.data;
      expect(responseData._id).toBe(customer.id);
      expect(responseData.name).toBe(toUpdate.name); // name is updated
      expect(responseData.phone).toBe(customer.phone); // phone is not updated
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

    it("should return NotFound-404 if id does not exists", async () => {
      const id = new Types.ObjectId().toString();
      const res = await request(server)
        .delete(`${endpoint}/${id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        message: "The requested resource was not found.",
        details: `Customer with id = ${id} was not found.`,
      });
    });

    it("should delete customer by passing valid id", async () => {
      // create a customer
      const customer = await Customer.create({
        name: "mickey mousse",
        phone: "1234567891",
      });

      // delete customer
      const res = await request(server)
        .delete(`${endpoint}/${customer.id}`)
        .set("x-auth-token", token);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(customer.id);

      // confirm if customer is deleted from db
      const deletedCustomer = await Customer.findById(customer.id);
      expect(deletedCustomer).toBeNull;
    });
  });
});
