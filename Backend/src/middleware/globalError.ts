import { Request, Response, NextFunction } from "express";

export const globalError = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  const statusCode = err.status || err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};