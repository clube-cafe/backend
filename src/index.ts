import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import sequelize from "./config/database";
import { env } from "./config/env";
import { specs } from "./swagger";
import { setupRoutes } from "./config/routes";
import { SchedulerJobs } from "./config/SchedulerJobs";
import { errorHandler, validateContentType, requestLogger } from "./middleware/errorHandler";
import { Logger } from "./utils/Logger";
import "./models";

const app = express();
const PORT = env.PORT;

app.use(
  cors({
    origin: env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);
app.use(validateContentType);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo ao Clube do Café API",
    docs: `http://localhost:${PORT}/api-docs`,
    version: "1.0.0",
    status: "operational",
  });
});

setupRoutes(app);
app.use(errorHandler);

const syncOptions =
  env.NODE_ENV === "production"
    ? { alter: false }
    : env.NODE_ENV === "test"
      ? { force: true }
      : { alter: true };

sequelize
  .sync(syncOptions)
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
