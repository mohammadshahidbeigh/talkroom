import {Server} from "socket.io";
import {User} from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      io?: Server;
    }
  }
}

export {};
