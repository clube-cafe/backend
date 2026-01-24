import express, { Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import sequelize from "./config/database";
import { specs } from "./swagger";
import { setupRoutes } from "./config/routes";
import { SchedulerJobs } from "./config/SchedulerJobs";
import "./models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Root
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo ao Clube do Café API",
    docs: `http://localhost:${PORT}/api-docs`,
  });
});

// Routes
setupRoutes(app);

// Database e Server
sequelize
  .sync({ force: true })
  .then(() => {
    SchedulerJobs.iniciarJobs();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Documentação: http://localhost:${PORT}/api-docs`);
      console.log("[CRON] Jobs agendados iniciados");
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
