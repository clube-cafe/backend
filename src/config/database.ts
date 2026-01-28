import { Sequelize } from "sequelize";
import { env } from "./env";

const sequelize = new Sequelize({
  dialect: env.DB_DIALECT,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  logging: env.NODE_ENV === "development" ? console.log : false,
});

export default sequelize;
