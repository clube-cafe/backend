import { Router, Request, Response } from "express";
import { PagamentoPendenteController } from "../controllers/PagamentoPendenteController";

const router = Router();
const pagamentoPendenteController = new PagamentoPendenteController();

/**
 * @swagger
 * /pagamentos-pendentes:
 *   post:
 *     summary: Criar pagamento pendente
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoPendenteCreateRequest'
 *     responses:
 *       201:
 *         description: Pagamento pendente criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado
 */
router.post("/", (req: Request, res: Response) =>
  pagamentoPendenteController.createPagamentoPendente(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes:
 *   get:
 *     summary: Listar pagamentos pendentes
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/", (req: Request, res: Response) =>
  pagamentoPendenteController.getAllPagamentosPendentes(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/{id}:
 *   get:
 *     summary: Obter pagamento pendente por ID
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento pendente
 *     responses:
 *       200:
 *         description: Pagamento pendente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       404:
 *         description: Pagamento pendente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentoPendenteById(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/status/{status}:
 *   get:
 *     summary: Listar pagamentos pendentes por status
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDENTE, ATRASADO, PAGO, CANCELADO]
 *         description: Status do pagamento
 *     responses:
 *       200:
 *         description: Lista de pagamentos com o status especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado
 */
router.get("/status/:status", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentosPendentesByStatus(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/vencidos:
 *   get:
 *     summary: Listar pagamentos vencidos
 *     description: Retorna todos os pagamentos com data de vencimento anterior à data atual
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos vencidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/vencidos", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentosPendentesVencidos(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/{id}:
 *   put:
 *     summary: Atualizar pagamento pendente
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento pendente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoPendenteUpdateRequest'
 *     responses:
 *       200:
 *         description: Pagamento pendente atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       404:
 *         description: Pagamento pendente não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put("/:id", (req: Request, res: Response) =>
  pagamentoPendenteController.updatePagamentoPendente(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/{id}/status:
 *   patch:
 *     summary: Atualizar status do pagamento pendente
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento pendente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoPendenteStatusRequest'
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoPendenteResponse'
 *       404:
 *         description: Pagamento pendente não encontrado
 *       401:
 *         description: Não autorizado
 */
router.patch("/:id/status", (req: Request, res: Response) =>
  pagamentoPendenteController.updateStatusPagamentoPendente(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/{id}:
 *   delete:
 *     summary: Deletar pagamento pendente
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento pendente
 *     responses:
 *       204:
 *         description: Pagamento pendente deletado
 *       404:
 *         description: Pagamento pendente não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete("/:id", (req: Request, res: Response) =>
  pagamentoPendenteController.deletePagamentoPendente(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/total/geral:
 *   get:
 *     summary: Total de pagamentos pendentes
 *     description: Retorna o valor total de todos os pagamentos pendentes
 *     tags:
 *       - Pagamentos Pendentes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de pagamentos pendentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/total/geral", (req: Request, res: Response) =>
  pagamentoPendenteController.getTotalPagamentosPendentes(req, res)
);

export default router;
