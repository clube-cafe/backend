import { Router } from "express";
import {
  login,
  logout,
  register,
  getAllUsers,
  getUserById,
  getProfile,
  updateUser,
  updateProfile,
  deleteUser,
  changePassword,
} from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Credenciais inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - password
 *               - tipo_user
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               tipo_user:
 *                 type: string
 *                 enum: [ADMIN, ASSINANTE]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout de usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Atualizar perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 */
router.put("/profile", authenticate, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Alterar senha do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta
 */
router.post("/change-password", authenticate, changePassword);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Listar todos os usuários (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       403:
 *         description: Acesso negado
 */
router.get("/users", authenticate, isAdmin, getAllUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Obter usuário por ID (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/users/:id", authenticate, isAdmin, getUserById);

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Atualizar usuário (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               tipo_user:
 *                 type: string
 *                 enum: [ADMIN, ASSINANTE]
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.put("/users/:id", authenticate, isAdmin, updateUser);

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: Deletar usuário (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário deletado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/users/:id", authenticate, isAdmin, deleteUser);

export default router;
