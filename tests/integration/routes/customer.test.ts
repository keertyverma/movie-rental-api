import request from "supertest";
import { disconnect } from "mongoose";
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
});
