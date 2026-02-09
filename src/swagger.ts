import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSchemas } from "./swagger/schemas";
import { env } from "./config/env";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "☕ Clube do Café - API",
      version: "1.0.0",
      description: "API para gestão financeira e administrativa do Clube do Café do LSD",
      contact: {
        name: "Time Clube do Café",
        url: "https://github.com/clube-cafe/backend",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Servidor Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Autenticação com token JWT",
        },
      },
      schemas: swaggerSchemas,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"],
};

export const specs = swaggerJsdoc(options);
