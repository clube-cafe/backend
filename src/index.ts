import express, { Request, Response } from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import { UserRepository } from "./repository/UserRepository";
import { TIPO_USER } from "./models/enums";

import "./models/User";
import "./models/Assinatura";
import "./models/Pagamento";
import "./models/PagamentoPendente";
import "./models/Historico";

dotenv.config();

const app = express();
app.use(express.json());

const userRepo = new UserRepository();

// Rota para riar usuário
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { nome, email, tipo_user } = req.body;

    if (!nome || !email || !tipo_user) {
      return res.status(400).json({ 
        message: "Campos obrigatórios: nome, email, tipo_user" 
      });
    }

    if (!Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({ 
        message: "tipo_user deve ser ADMIN ou ASSINANTE" 
      });
    }

    const user = await userRepo.createUser(nome, email, tipo_user);
    return res.status(201).json(user);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao criar o usuário", error: error.message });
  }
});

// Rota para istar usuários
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await userRepo.getAllUsers();
    return res.json(users);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter os usuários", error: error.message });
  }
});

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao obter o usuário", error: error.message });
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo_user } = req.body;

    if (tipo_user && !Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({ 
        message: "tipo_user deve ser ADMIN ou ASSINANTE" 
      });
    }

    const user = await userRepo.updateUser(id, nome, email, tipo_user);
    return res.json(user);
  } catch (error: any) {
    console.error(error);
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res
      .status(statusCode)
      .json({ message: error.message || "Erro ao atualizar o usuário", error: error.message });
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userRepo.deleteUser(id);
    return res.status(204).send();
  } catch (error: any) {
    console.error(error);
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res
      .status(statusCode)
      .json({ message: error.message || "Erro ao deletar o usuário", error: error.message });
  }
});


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
      console.log(`   URL de conexao: postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
      
      console.log(`\npgAdmin Web:`);
      console.log(`   URL: http://localhost:5050`);
      console.log(`   Email: admin@clubecafe.com`);
      console.log(`   Senha: admin123`);
      console.log("\n");
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

