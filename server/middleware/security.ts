import {Request, Response, NextFunction} from "express";
import helmet from "helmet";
import hpp from "hpp";

export const securityMiddleware = [
  helmet(), // Adds various HTTP headers
  hpp(), // Prevents HTTP Parameter Pollution attacks

  // Custom security headers
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    next();
  },
];
