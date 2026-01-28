import { Router, Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/authController";
import { authService } from "../services/AuthService";
import { TIPO_USER } from "../models/enums";

const router = Router();

/**
 * POST /users
 * Create a new user (for testing - uses default password if not provided)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, tipo_user, password } = req.body;

    if (!nome || !email || !tipo_user) {
      return res.status(400).json({
        message: "Campos obrigatórios: nome, email, tipo_user",
      });
    }

    if (!Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({
        message: "tipo_user deve ser ADMIN ou ASSINANTE",
      });
    }

    // Use default password for testing if not provided
    const userPassword = password || "test123456";

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
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({
      message: "Erro ao criar o usuário",
      error: error.message,
    });
  }
});

/**
 * GET /users
 * Get all users
 */
router.get("/", getAllUsers);

/**
 * GET /users/:id
 * Get user by ID
 */
router.get("/:id", getUserById);

/**
 * PUT /users/:id
 * Update user
 */
router.put("/:id", updateUser);

/**
 * DELETE /users/:id
 * Delete user
 */
router.delete("/:id", deleteUser);

export default router;
