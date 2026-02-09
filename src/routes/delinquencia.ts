import { Router, Request, Response } from "express";
import { DelinquenciaController } from "../controllers/DelinquenciaController";

const router = Router();
const delinquenciaController = new DelinquenciaController();

/**
 * @swagger
 * /delinquencia:
 *   get:
 *     summary: Obter relatório geral de inadimplência
 *     description: Retorna todas as assinaturas com pagamentos atrasados, agrupadas por usuário
 *     tags:
 *       - Delinquência
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de inadimplência obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DelinquenciaRelatorio'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Erro ao obter relatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req: Request, res: Response) => {
  return delinquenciaController.obterAssinaturasEmAtraso(req, res);
});

/**
 * @swagger
 * /delinquencia/{user_id}:
 *   get:
 *     summary: Obter relatório de inadimplência de um usuário específico
 *     description: Retorna detalhes de atrasos, próximos pagamentos e resumo de assinaturas do usuário
 *     tags:
 *       - Delinquência
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
 *         description: Relatório obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DelinquenciaUsuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Erro ao obter relatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:user_id", (req: Request, res: Response) => {
  return delinquenciaController.obterRelatorioPorUser(req, res);
});

export default router;
