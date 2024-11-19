import {Server} from "socket.io";
import {User} from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username?: string;
        email?: string;
      };
      io?: any;
    }
  }
}

export {};
