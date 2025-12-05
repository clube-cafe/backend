import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dialect = (process.env.DB_DIALECT || "postgres") as "postgres" | "mysql";

const sequelize = new Sequelize({
  dialect: dialect,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres123",
  database: process.env.DB_NAME || "clube_cafe",
  logging: false,
});

export default sequelize;
