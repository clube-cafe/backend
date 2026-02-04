import { Router } from "express";
import { planoAssinaturaController } from "../controllers/PlanoAssinaturaController";
import { authenticate } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Planos de Assinatura
 *   description: Gerenciamento de planos de assinatura
 */

/**
 * @swagger
 * /planos:
 *   post:
 *     summary: Criar novo plano de assinatura
 *     tags: [Planos de Assinatura]
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
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               periodicidade:
 *                 type: string
 *                 enum: [MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL]
 *     responses:
 *       201:
 *         description: Plano criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  planoAssinaturaController.createPlano.bind(planoAssinaturaController)
);

/**
 * @swagger
 * /planos:
 *   get:
 *     summary: Listar todos os planos de assinatura
 *     tags: [Planos de Assinatura]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de planos a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de planos a pular
 *       - in: query
 *         name: apenasAtivos
 *         schema:
 *           type: boolean
 *         description: Retornar apenas planos ativos (padrão true)
 *     responses:
 *       200:
 *         description: Lista de planos
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", planoAssinaturaController.getAllPlanos.bind(planoAssinaturaController));

/**
 * @swagger
 * /planos/{id}:
 *   get:
 *     summary: Obter plano por ID
 *     tags: [Planos de Assinatura]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Plano encontrado
 *       404:
 *         description: Plano não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/:id", planoAssinaturaController.getPlanoById.bind(planoAssinaturaController));

/**
 * @swagger
 * /planos/{id}:
 *   put:
 *     summary: Atualizar plano de assinatura
 *     tags: [Planos de Assinatura]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               periodicidade:
 *                 type: string
 *                 enum: [MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL]
 *               ativo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Plano não encontrado
 */
router.put(
  "/:id",
  authenticate,
  isAdmin,
  planoAssinaturaController.updatePlano.bind(planoAssinaturaController)
);

/**
 * @swagger
 * /planos/{id}:
 *   delete:
 *     summary: Deletar plano de assinatura
 *     tags: [Planos de Assinatura]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     responses:
 *       204:
 *         description: Plano deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Plano não encontrado
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  planoAssinaturaController.deletePlano.bind(planoAssinaturaController)
);

export default router;
