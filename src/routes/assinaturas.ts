import { Router, Request, Response } from "express";
import { AssinaturaController } from "../controllers/AssinaturaController";

const router = Router();
const assinaturaController = new AssinaturaController();

/**
 * @swagger
 * /assinaturas:
 *   post:
 *     summary: Criar nova assinatura
 *     tags:
 *       - Assinaturas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assinatura'
 *     responses:
 *       201:
 *         description: Assinatura criada
 *       400:
 *         description: Dados inválidos
 */
router.post("/", (req: Request, res: Response) => assinaturaController.createAssinatura(req, res));

/**
 * @swagger
 * /assinaturas/com-pendencias:
 *   post:
 *     summary: Criar assinatura e gerar pagamentos pendentes automaticamente
 *     description: Cria uma assinatura e gera automaticamente todos os pagamentos pendentes baseados na periodicidade do plano escolhido
 *     tags:
 *       - Assinaturas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - plano_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               plano_id:
 *                 type: string
 *                 format: uuid
 *               dia_vencimento:
 *                 type: number
 *                 description: Dia do mês para vencimento (1-28, padrão 10)
 *                 example: 10
 *     responses:
 *       201:
 *         description: Assinatura criada com pendências geradas
 *       400:
 *         description: Dados inválidos
 */
router.post("/com-pendencias", (req: Request, res: Response) =>
  assinaturaController.createAssinaturaComPendencias(req, res)
);

/**
 * @swagger
 * /assinaturas:
 *   get:
 *     summary: Listar todas as assinaturas
 *     tags:
 *       - Assinaturas
 *     responses:
 *       200:
 *         description: Lista de assinaturas
 */
router.get("/", (req: Request, res: Response) => assinaturaController.getAllAssinaturas(req, res));

/**
 * @swagger
 * /assinaturas/{id}:
 *   get:
 *     summary: Obter assinatura por ID
 *     tags:
 *       - Assinaturas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", (req: Request, res: Response) =>
  assinaturaController.getAssinaturaById(req, res)
);

/**
 * @swagger
 * /assinaturas/{id}:
 *   put:
 *     summary: Atualizar assinatura
 *     tags:
 *       - Assinaturas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put("/:id", (req: Request, res: Response) =>
  assinaturaController.updateAssinatura(req, res)
);

/**
 * @swagger
 * /assinaturas/{assinatura_id}/cancelar:
 *   post:
 *     summary: Cancelar assinatura
 *     description: Cancela uma assinatura ativa, invalida todas as pendências pendentes/atrasadas e registra no histórico
 *     tags:
 *       - Assinaturas
 *     parameters:
 *       - in: path
 *         name: assinatura_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Cliente solicitou cancelamento"
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *       404:
 *         description: Assinatura não encontrada
 *       400:
 *         description: Erro ao cancelar
 */
router.post("/:assinatura_id/cancelar", (req: Request, res: Response) =>
  assinaturaController.cancelarAssinatura(req, res)
);

export default router;
