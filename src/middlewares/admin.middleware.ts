import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import config from "config";

const admin = (req: Request, res: Response, next: NextFunction) => {
  // Used to check if authenticated user has admin access to perform the operation
  if (
    config.get("requiresAuth") &&
    req.user &&
    !(req.user as { isAdmin: boolean }).isAdmin
  ) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send(
        "Access Denied. You do not have permission to perform this operation."
      );
  }

  next();
};

export default admin;
