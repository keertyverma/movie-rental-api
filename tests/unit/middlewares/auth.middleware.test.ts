import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { User } from "../../../src/models/user.model";
import auth from "../../../src/middlewares/auth.middleware";

describe("auth middleware", () => {
  it("should populate req.user with the payload of a valid JWT", () => {
    const payload = {
      _id: new Types.ObjectId().toString(),
      name: "Mickey Mouse",
      email: "test@test.com",
      isAdmin: true,
    };
    const token = new User(payload).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    } as unknown as Request;
    const res = {} as Response;
    const next: jest.Mock<NextFunction> = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(payload);
  });
});
