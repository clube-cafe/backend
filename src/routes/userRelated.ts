import { Router, Request, Response } from "express";
import { AssinaturaController } from "../controllers/AssinaturaController";
import { PagamentoController } from "../controllers/PagamentoController";
import { PagamentoPendenteController } from "../controllers/PagamentoPendenteController";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const assinaturaController = new AssinaturaController();
const pagamentoController = new PagamentoController();
const pagamentoPendenteController = new PagamentoPendenteController();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /users/{user_id}/assinaturas:
 *   get:
 *     summary: Listar assinaturas de um usuário
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de assinaturas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssinaturaResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/assinaturas", (req: Request, res: Response) => {
  const { user_id } = req.params;
  req.params.user_id = user_id;
  assinaturaController.getAssinaturasByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos:
 *   get:
 *     summary: Listar pagamentos de um usuário
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de pagamentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/pagamentos", (req: Request, res: Response) => {
  pagamentoController.getPagamentosByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos/total:
 *   get:
 *     summary: Total de pagamentos por usuário
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Total de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/pagamentos-total", (req: Request, res: Response) => {
  pagamentoController.getTotalPagamentosByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos-pendentes:
 *   get:
 *     summary: Listar pagamentos pendentes de um usuário
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de pagamentos pendentes do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/pagamentos-pendentes", (req: Request, res: Response) => {
  pagamentoPendenteController.getPagamentosPendentesByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos-pendentes/total:
 *   get:
 *     summary: Total de pagamentos pendentes por usuário
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Total de pagamentos pendentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/pagamentos-pendentes-total", (req: Request, res: Response) => {
  pagamentoPendenteController.getTotalPagamentosPendentesByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos:
 *   get:
 *     summary: Listar histórico de um usuário
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de registros históricos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/historicos", (req: Request, res: Response) => {
  historicoController.getHistoricosByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/periodo:
 *   get:
 *     summary: Listar histórico de usuário por período
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *       - in: query
 *         name: data_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do período (YYYY-MM-DD)
 *         example: "2026-01-01"
 *       - in: query
 *         name: data_fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do período (YYYY-MM-DD)
 *         example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Lista de históricos no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoResponse'
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/historicos-periodo", (req: Request, res: Response) => {
  historicoController.getHistoricosByUserIdAndPeriodo(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/total/entradas:
 *   get:
 *     summary: Total de entradas por usuário
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Total de entradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/historicos-total/entradas", (req: Request, res: Response) => {
  historicoController.getTotalEntradasByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/total/saidas:
 *   get:
 *     summary: Total de saídas por usuário
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Total de saídas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/historicos-total/saidas", (req: Request, res: Response) => {
  historicoController.getTotalSaidasByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/saldo:
 *   get:
 *     summary: Saldo por usuário
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Saldo atual do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaldoResponse'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Não autorizado
 */
router.get("/:user_id/historicos-saldo", (req: Request, res: Response) => {
  historicoController.getSaldoAtualByUser(req, res);
});

export default router;
