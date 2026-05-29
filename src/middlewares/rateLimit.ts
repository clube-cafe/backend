import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const isTest = env.NODE_ENV === "test";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas de autenticação, tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Muitas requisições, tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});
