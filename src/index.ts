import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import sequelize from "./config/database";
import { specs } from "./swagger";
import { setupRoutes } from "./config/routes";
import { SchedulerJobs } from "./config/SchedulerJobs";
import { errorHandler, validateContentType, requestLogger } from "./middleware/errorHandler";
import { Logger } from "./utils/Logger";
import "./models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * Middlewares globais
 */
app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);
app.use(validateContentType);

/**
 * Swagger
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/**
 * Root
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo ao Clube do Café API",
    docs: `http://localhost:${PORT}/api-docs`,
    version: "1.0.0",
    status: "operational",
  });
});

/**
 * Routes
 */
setupRoutes(app);

/**
 * Error handler
 */
app.use(errorHandler);

/**
 * Database & Server
 */
sequelize
  .sync({ force: true })
  .then(() => {
    SchedulerJobs.iniciarJobs();

    app.listen(PORT, () => {
      Logger.info(`Servidor rodando em http://localhost:${PORT}`);
      Logger.info(`Documentação: http://localhost:${PORT}/api-docs`);
      Logger.info("[CRON] Jobs agendados iniciados");
    });
  })
  .catch((error) => {
    Logger.error("Erro ao conectar ao banco de dados", error);
    process.exit(1);
  });
