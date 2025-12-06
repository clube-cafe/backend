import { Router, Request, Response } from "express";
import { UserRepository } from "../repository/UserRepository";
import { TIPO_USER } from "../models/enums";

const router = Router();
const userRepo = new UserRepository();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro ao criar
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { nome, email, tipo_user } = req.body;

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

    const user = await userRepo.createUser(nome, email, tipo_user);
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ message: "Erro ao criar o usuário", error: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await userRepo.getAllUsers();
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: "Erro ao obter os usuários", error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Não encontrado
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepo.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: "Erro ao obter o usuário", error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Não encontrado
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo_user } = req.body;

    if (tipo_user && !Object.values(TIPO_USER).includes(tipo_user)) {
      return res.status(400).json({
        message: "tipo_user deve ser ADMIN ou ASSINANTE",
      });
    }

    const user = await userRepo.updateUser(id, nome, email, tipo_user);
    return res.json(user);
  } catch (error: any) {
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message || "Erro ao atualizar o usuário",
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deletado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userRepo.deleteUser(id);
    return res.status(204).send();
  } catch (error: any) {
    const statusCode = error.message === "Usuário não encontrado" ? 404 : 500;
    return res.status(statusCode).json({
      message: error.message || "Erro ao deletar o usuário",
    });
  }
});

export default router;
