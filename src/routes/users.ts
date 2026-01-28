import { Router, Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/authController";
import { authService } from "../services/AuthService";
import { TIPO_USER } from "../models/enums";
import { Logger } from "../utils/Logger";
import { env } from "../config/env";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, tipo_user, password } = req.body;

    if (!nome || !email || !tipo_user) {
      return res.status(400).json({
        message: "Campos obrigatórios: nome, email, tipo_user",
      });
    }

    const userPassword = password || (env.NODE_ENV === "test" ? "test123456" : null);

    if (!userPassword) {
      return res.status(400).json({
        message: "Password é obrigatório",
      });
    }

    if (!Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({
        message: "tipo_user deve ser ADMIN ou ASSINANTE",
      });
    }

    if (env.NODE_ENV === "production") {
      Logger.warn("Rota /users POST sendo usada em produção - considere removê-la ou protegê-la");
    }

    const result = await authService.register(nome, email, userPassword, tipo_user);

    return res.status(201).json({
      id: result.user.id,
      nome: result.user.nome,
      email: result.user.email,
      tipo_user: result.user.tipo_user,
    });
  } catch (error: any) {
    if (
      error.message === "Email already registered" ||
      error.message === "Este email já está registrado"
    ) {
      return res.status(409).json({ message: "Email já cadastrado" });
    }
    Logger.error("Erro ao criar usuário", error);
    return res.status(500).json({
      message: "Erro ao criar o usuário",
      error: env.NODE_ENV === "development" ? error.message : "Erro interno do servidor",
    });
  }
});

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
