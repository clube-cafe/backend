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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMetricas'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Erro ao obter métricas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardAssinaturas'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Erro ao obter detalhes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pagamentos obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardPendentes'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Erro ao obter pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/pendentes", (req: Request, res: Response) => {
  return dashboardController.obterPagamentosPendentes(req, res);
});

export default router;
