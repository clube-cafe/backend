import swaggerJsdoc from "swagger-jsdoc";
import { swaggerSchemas } from "./swagger/schemas";

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
        url: "http://localhost:3000",
        description: "Servidor Local",
      },
    ],
    components: {
      schemas: swaggerSchemas,
    },
  },
  apis: ["./src/routes/**/*.ts"],
};

export const specs = swaggerJsdoc(options);
