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
 *             $ref: '#/components/schemas/PlanoAssinaturaCreateRequest'
 *     responses:
 *       201:
 *         description: Plano criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoAssinaturaResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlanoAssinaturaResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *           format: uuid
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Plano encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoAssinaturaResponse'
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
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
 *           format: uuid
 *         description: ID do plano
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoAssinaturaUpdateRequest'
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoAssinaturaResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
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
 *           format: uuid
 *         description: ID do plano
 *     responses:
 *       204:
 *         description: Plano deletado com sucesso
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenError'
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  planoAssinaturaController.deletePlano.bind(planoAssinaturaController)
);

export default router;
