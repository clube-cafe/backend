import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import sequelize from "./config/database";
import { env } from "./config/env";
import { specs } from "./swagger";
import { setupRoutes } from "./config/routes";
import { SchedulerJobs } from "./config/SchedulerJobs";
import { errorHandler, validateContentType, requestLogger } from "./middlewares/errorHandler";
import { globalLimiter } from "./middlewares/rateLimit";
import { Logger } from "./utils/Logger";
import "./models";

const app = express();
const PORT = env.PORT;

app.use(helmet());

const allowedOrigins = (env.FRONTEND_URL ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

if (env.NODE_ENV === "production") {
  app.use(globalLimiter);
}

app.use(express.json({ limit: "100kb" }));
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

    const server = app.listen(PORT, () => {
      Logger.info(`Servidor rodando em http://localhost:${PORT}`);
      Logger.info(`Documentação: http://localhost:${PORT}/api-docs`);
      Logger.info("[CRON] Jobs agendados iniciados");
    });

    const shutdown = (signal: string) => {
      Logger.info(`${signal} recebido, encerrando graciosamente...`);
      SchedulerJobs.pararJobs();
      server.close(async (err) => {
        if (err) {
          Logger.error("Erro ao fechar servidor HTTP", err);
          process.exit(1);
        }
        try {
          await sequelize.close();
          Logger.info("Conexão com o banco encerrada");
          process.exit(0);
        } catch (e) {
          Logger.error("Erro ao fechar conexão com o banco", e);
          process.exit(1);
        }
      });

      setTimeout(() => {
        Logger.error("Shutdown não completou em 10s, forçando saída");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((error) => {
    Logger.error("Erro ao conectar ao banco de dados", error);
    process.exit(1);
  });
