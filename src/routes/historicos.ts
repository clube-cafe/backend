import { Router, Request, Response } from "express";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /historicos:
 *   post:
 *     summary: Criar registro de histórico
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoricoCreateRequest'
 *     responses:
 *       201:
 *         description: Histórico criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricoResponse'
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
 */
router.post("/", (req: Request, res: Response) => historicoController.createHistorico(req, res));

/**
 * @swagger
 * /historicos:
 *   get:
 *     summary: Listar todos os históricos
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de históricos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/", (req: Request, res: Response) => historicoController.getAllHistoricos(req, res));

/**
 * @swagger
 * /historicos/tipo/{tipo}:
 *   get:
 *     summary: Listar histórico por tipo (ENTRADA/SAIDA)
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ENTRADA, SAIDA]
 *         description: Tipo de transação
 *     responses:
 *       200:
 *         description: Lista de históricos do tipo especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoResponse'
 *       400:
 *         description: Tipo inválido
 *       401:
 *         description: Não autorizado
 */
router.get("/tipo/:tipo", (req: Request, res: Response) =>
  historicoController.getHistoricosByTipo(req, res)
);

/**
 * @swagger
 * /historicos/total/entradas:
 *   get:
 *     summary: Total de entradas
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de entradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/total/entradas", (req: Request, res: Response) =>
  historicoController.getTotalEntradas(req, res)
);

/**
 * @swagger
 * /historicos/total/saidas:
 *   get:
 *     summary: Total de saídas
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de saídas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/total/saidas", (req: Request, res: Response) =>
  historicoController.getTotalSaidas(req, res)
);

/**
 * @swagger
 * /historicos/saldo:
 *   get:
 *     summary: Saldo atual
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo atual (entradas - saídas)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaldoResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/saldo", (req: Request, res: Response) => historicoController.getSaldoAtual(req, res));

/**
 * @swagger
 * /historicos/{id}:
 *   get:
 *     summary: Obter histórico por ID
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico
 *     responses:
 *       200:
 *         description: Histórico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricoResponse'
 *       404:
 *         description: Histórico não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", (req: Request, res: Response) => historicoController.getHistoricoById(req, res));

/**
 * @swagger
 * /historicos/{id}:
 *   put:
 *     summary: Atualizar histórico
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoricoUpdateRequest'
 *     responses:
 *       200:
 *         description: Histórico atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistoricoResponse'
 *       404:
 *         description: Histórico não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put("/:id", (req: Request, res: Response) => historicoController.updateHistorico(req, res));

/**
 * @swagger
 * /historicos/{id}:
 *   delete:
 *     summary: Deletar histórico
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do histórico
 *     responses:
 *       204:
 *         description: Histórico deletado com sucesso
 *       404:
 *         description: Histórico não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete("/:id", (req: Request, res: Response) =>
  historicoController.deleteHistorico(req, res)
);

export default router;
