import { Personal } from "../../database/entity/models";

declare global {
  namespace Express {
    interface Request {
      admin: Personal;
    }
  }
}