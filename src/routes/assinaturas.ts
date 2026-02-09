import { Router, Request, Response } from "express";
import { AssinaturaController } from "../controllers/AssinaturaController";
import { authenticate } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/roleMiddleware";

const router = Router();
const assinaturaController = new AssinaturaController();

/**
 * @swagger
 * /assinaturas:
 *   post:
 *     summary: Criar nova assinatura
 *     description: |
 *       Cria uma nova assinatura com status PENDENTE e gera automaticamente um pagamento pendente.
 *
 *       **Fluxo:**
 *       1. Cria assinatura com status PENDENTE
 *       2. Gera pagamento pendente com o valor do plano
 *       3. Retorna assinatura e pagamento pendente
 *       4. Use o ID do pagamento pendente no POST /pagamentos para ativar a assinatura
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssinaturaCreateRequest'
 *     responses:
 *       201:
 *         description: Assinatura e pagamento pendente criados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssinaturaCreateResponse'
 *       400:
 *         description: Dados inválidos ou usuário já possui assinatura ativa/pendente
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
router.post("/", authenticate, (req: Request, res: Response) =>
  assinaturaController.createAssinatura(req, res)
);

/**
 * @swagger
 * /assinaturas/com-pendencias:
 *   post:
 *     summary: Criar assinatura e gerar pagamentos pendentes automaticamente
 *     description: Cria uma assinatura e gera automaticamente todos os pagamentos pendentes baseados na periodicidade do plano escolhido
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssinaturaComPendenciasRequest'
 *     responses:
 *       201:
 *         description: Assinatura criada com pendências geradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assinatura:
 *                   $ref: '#/components/schemas/AssinaturaResponse'
 *                 pagamentosPendentes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado
 */
router.post("/com-pendencias", authenticate, (req: Request, res: Response) =>
  assinaturaController.createAssinaturaComPendencias(req, res)
);

/**
 * @swagger
 * /assinaturas:
 *   get:
 *     summary: Listar todas as assinaturas (Admin)
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de assinaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssinaturaResponse'
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
router.get("/", authenticate, isAdmin, (req: Request, res: Response) =>
  assinaturaController.getAllAssinaturas(req, res)
);

/**
 * @swagger
 * /assinaturas/{id}:
 *   get:
 *     summary: Obter assinatura por ID
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da assinatura
 *     responses:
 *       200:
 *         description: Detalhes da assinatura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssinaturaResponse'
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Assinatura não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.get("/:id", authenticate, (req: Request, res: Response) =>
  assinaturaController.getAssinaturaById(req, res)
);

/**
 * @swagger
 * /assinaturas/{id}:
 *   put:
 *     summary: Atualizar assinatura (Admin ou próprio usuário)
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da assinatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssinaturaUpdateRequest'
 *     responses:
 *       200:
 *         description: Assinatura atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssinaturaResponse'
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Assinatura não encontrada
 */
router.put("/:id", authenticate, (req: Request, res: Response) =>
  assinaturaController.updateAssinatura(req, res)
);

/**
 * @swagger
 * /assinaturas/{assinatura_id}/cancelar:
 *   post:
 *     summary: Cancelar assinatura (Admin)
 *     description: Cancela uma assinatura ativa, invalida todas as pendências pendentes/atrasadas e registra no histórico
 *     tags:
 *       - Assinaturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assinatura_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da assinatura
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelarAssinaturaRequest'
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assinatura cancelada com sucesso"
 *                 assinatura:
 *                   $ref: '#/components/schemas/AssinaturaResponse'
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
 *         description: Assinatura não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 */
router.post("/:assinatura_id/cancelar", authenticate, isAdmin, (req: Request, res: Response) =>
  assinaturaController.cancelarAssinatura(req, res)
);

export default router;
