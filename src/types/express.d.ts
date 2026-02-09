import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        tipo_user?: string;
      };
    }
  }
}
