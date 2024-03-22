import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";
import { User } from "../../../src/models/user.model";

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const payload = {
      _id: new Types.ObjectId().toString(),
      name: "Mickey Mouse",
      email: "test@test.com",
      isAdmin: true,
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    // verfiy token
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject(payload);
  });
});
