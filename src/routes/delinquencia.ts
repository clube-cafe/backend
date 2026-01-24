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
 *     responses:
 *       200:
 *         description: Relatório de inadimplência obtido com sucesso
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
 *                     properties:
 *                       user:
 *                         type: object
 *                       assinaturas:
 *                         type: array
 *                       atrasos:
 *                         type: object
 *       500:
 *         description: Erro ao obter relatório
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
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Relatório obtido com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao obter relatório
 */
router.get("/:user_id", (req: Request, res: Response) => {
  return delinquenciaController.obterRelatorioPorUser(req, res);
});

export default router;
