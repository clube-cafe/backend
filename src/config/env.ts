import dotenv from "dotenv";
import { Logger } from "../utils/Logger";

dotenv.config();

interface EnvConfig {
  DB_DIALECT: "postgres" | "mysql";
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
  JWT_SECRET: string;
  FRONTEND_URL?: string;
  DEBUG?: string;
}

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME", "JWT_SECRET"] as const;

function validateEnv(): void {
  const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  const missing: string[] = [];

  if (nodeEnv === "test") {
    return;
  }

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    Logger.error("Variáveis de ambiente obrigatórias não definidas:", { missing });
    throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missing.join(", ")}`);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && (jwtSecret === "your_jwt_secret_key" || jwtSecret.length < 32)) {
    Logger.warn(
      "JWT_SECRET está usando valor padrão ou é muito curto. Isso é inseguro em produção!"
    );
    if (nodeEnv === "production") {
      throw new Error(
        "JWT_SECRET deve ser uma string segura com pelo menos 32 caracteres em produção"
      );
    }
  }
}

export function getEnvConfig(): EnvConfig {
  validateEnv();

  const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  const dbDialect = (process.env.DB_DIALECT || "postgres") as "postgres" | "mysql";
  const isTest = nodeEnv === "test";

  return {
    DB_DIALECT: dbDialect,
    DB_HOST: process.env.DB_HOST || (isTest ? "localhost" : ""),
    DB_PORT: Number(process.env.DB_PORT) || (dbDialect === "postgres" ? 5432 : 3306),
    DB_USER: process.env.DB_USER || (isTest ? "test" : ""),
    DB_PASS: process.env.DB_PASS || (isTest ? "test" : ""),
    DB_NAME: process.env.DB_NAME || (isTest ? "test_db" : ""),
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: nodeEnv,
    JWT_SECRET:
      process.env.JWT_SECRET || (isTest ? "test_jwt_secret_key_for_testing_only_min_32_chars" : ""),
    FRONTEND_URL: process.env.FRONTEND_URL,
    DEBUG: process.env.DEBUG,
  };
}

export const env = getEnvConfig();
