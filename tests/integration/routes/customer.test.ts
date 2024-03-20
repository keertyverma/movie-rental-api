import request from "supertest";
import { Types, disconnect } from "mongoose";
import config from "config";
import http from "http";

import appServer from "../../../src";
import { Customer, ICustomer } from "../../../src/models/customer.model";

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
    it("should return BadRequest-400 if 'name' required parameter is not passed", async () => {
      // name is the required parameter to create customer.
      const res = await request(server)
        .post(endpoint)
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
      const res = await request(server).post(endpoint).send({
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
      const res = await request(server).post(endpoint).send(customerData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");

      const responseData = res.body.data;
      expect(responseData.name).toBe(customerData.name);
      expect(responseData.phone).toBe(customerData.phone);
      expect(responseData.isGold).toBeFalsy;
    });
  });
});
