import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // Adjust the type according to your user object
    }
  }
}

// authorization middleware
const auth = (req: Request, res: Response, next: NextFunction) => {
  // check auth token in request header
  const token = req.header("x-auth-token");
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send("Access Denied.Token is not provided.");
  }

  // verify token
  try {
    // decode auth token and store payload in req.user
    req.user = jwt.verify(token, config.get("jwtPrivateKey"));
    next();
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send("Invalid token.");
  }
};

export default auth;
