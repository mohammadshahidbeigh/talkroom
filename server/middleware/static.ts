import express, {RequestHandler} from "express";
import path from "path";

// Create static middleware with CORS headers
export const staticMiddleware: RequestHandler[] = [
  // CORS middleware specifically for static files
  ((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://talk-room-six.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    next();
  }) as RequestHandler,
  // Static file serving
  express.static(path.join(__dirname, "../../uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
];
