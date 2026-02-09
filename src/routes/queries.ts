import { Router, Request, Response } from "express";
import { PagamentoController } from "../controllers/PagamentoController";
import { PagamentoPendenteController } from "../controllers/PagamentoPendenteController";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const pagamentoController = new PagamentoController();
const pagamentoPendenteController = new PagamentoPendenteController();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /pagamentos/periodo:
 *   get:
 *     summary: Listar pagamentos por período
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de pagamentos no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       400:
 *         description: Parâmetros de data inválidos
 *       401:
 *         description: Não autorizado
 */
router.get("/pagamentos-periodo", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByDateRange(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/periodo:
 *   get:
 *     summary: Listar pagamentos pendentes por período
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de pagamentos pendentes no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       400:
 *         description: Parâmetros de data inválidos
 *       401:
 *         description: Não autorizado
 */
router.get("/pagamentos-pendentes-periodo", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentosPendentesByPeriodo(req, res)
);

/**
 * @swagger
 * /historicos/periodo:
 *   get:
 *     summary: Listar histórico por período
 *     tags:
 *       - Histórico
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de registros históricos no período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistoricoResponse'
 *       400:
 *         description: Parâmetros de data inválidos
 *       401:
 *         description: Não autorizado
 */
router.get("/historicos-periodo", (req: Request, res: Response) =>
  historicoController.getHistoricosByPeriodo(req, res)
);

/**
 * @swagger
 * /historicos/total/entradas:
 *   get:
 *     summary: Total de entradas
 *     tags:
 *       - Histórico
 */
router.get("/historicos-total/entradas", (req: Request, res: Response) =>
  historicoController.getTotalEntradas(req, res)
);

/**
 * @swagger
 * /historicos/total/saidas:
 *   get:
 *     summary: Total de saídas
 *     tags:
 *       - Histórico
 */
router.get("/historicos-total/saidas", (req: Request, res: Response) =>
  historicoController.getTotalSaidas(req, res)
);

/**
 * @swagger
 * /historicos/saldo:
 *   get:
 *     summary: Saldo atual
 *     tags:
 *       - Histórico
 */
router.get("/historicos-saldo", (req: Request, res: Response) =>
  historicoController.getSaldoAtual(req, res)
);

export default router;
