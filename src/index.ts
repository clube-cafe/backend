import express, { Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import sequelize from "./config/database";
import { specs } from "./swagger";

import usersRouter from "./routes/users";
import assinaturasRouter from "./routes/assinaturas";
import pagamentosRouter from "./routes/pagamentos";
import pagamentosPendentesRouter from "./routes/pagamentosPendentes";
import historicosRouter from "./routes/historicos";
import userRelatedRouter from "./routes/userRelated";
import queriesRouter from "./routes/queries";

import "./models/User";
import "./models/Assinatura";
import "./models/Pagamento";
import "./models/PagamentoPendente";
import "./models/Historico";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Bem-vindo ao Clube do Café API",
    docs: "http://localhost:3000/api-docs",
  });
});

app.use("/users", usersRouter);
app.use("/assinaturas", assinaturasRouter);
app.use("/pagamentos", pagamentosRouter);
app.use("/pagamentos-pendentes", pagamentosPendentesRouter);
app.use("/historicos", historicosRouter);
app.use("/users", userRelatedRouter);
app.use("/", queriesRouter);

const PORT = process.env.PORT || 3000;

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASS = process.env.DB_PASS || "postgres123";
const DB_NAME = process.env.DB_NAME || "clube_cafe";

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("\nBanco de dados conectado com sucesso!");
    app.listen(PORT, () => {
      console.log(`\nServidor rodando na porta ${PORT}`);
      console.log(`URL da API: http://localhost:${PORT}`);

      console.log("\nPostgreSQL:");
      console.log(`   Host: ${DB_HOST}`);
      console.log(`   Porta: ${DB_PORT}`);
      console.log(`   Database: ${DB_NAME}`);
      console.log(`   Usuario: ${DB_USER}`);
      console.log(`   Senha: ${DB_PASS}`);
      console.log(
        `   URL de conexao: postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
      );

      console.log("\npgAdmin Web:");
      console.log("   URL: http://localhost:5050");
      console.log("   Email: admin@clubecafe.com");
      console.log("   Senha: admin123");
      console.log("\n");

      console.log("Swagger UI: http://localhost:3000/api-docs");
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });
