import { Router, Request, Response } from "express";
import { DashboardController } from "../controllers/DashboardController";

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /dashboard/metricas:
 *   get:
 *     summary: Obter métricas gerais do dashboard
 *     description: Retorna resumo de assinaturas, receita do mês, e status de pagamentos
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumo:
 *                       type: object
 *                       properties:
 *                         totalAssinaturas:
 *                           type: number
 *                         assinaturasVencidas:
 *                           type: number
 *                         receitaMesAtual:
 *                           type: number
 *                     pagamentos:
 *                       type: object
 *                       properties:
 *                         pendentes:
 *                           type: number
 *                         atrasados:
 *                           type: number
 *                         valorPendente:
 *                           type: number
 *                         valorAtrasado:
 *                           type: number
 *                         valorTotalEmAberto:
 *                           type: number
 *       500:
 *         description: Erro ao obter métricas
 */
router.get("/metricas", (req: Request, res: Response) => {
  return dashboardController.obterMetricas(req, res);
});

/**
 * @swagger
 * /dashboard/assinaturas:
 *   get:
 *     summary: Obter detalhes das assinaturas ativas
 *     description: Retorna lista das 10 últimas assinaturas ativas com pendências
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Detalhes obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erro ao obter detalhes
 */
router.get("/assinaturas", (req: Request, res: Response) => {
  return dashboardController.obterDetalhesAssinaturas(req, res);
});

/**
 * @swagger
 * /dashboard/pendentes:
 *   get:
 *     summary: Obter pagamentos pendentes ou atrasados
 *     description: Retorna lista dos 20 últimos pagamentos pendentes ou atrasados, ordenados por vencimento
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Pagamentos obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Erro ao obter pagamentos
 */
router.get("/pendentes", (req: Request, res: Response) => {
  return dashboardController.obterPagamentosPendentes(req, res);
});

export default router;
