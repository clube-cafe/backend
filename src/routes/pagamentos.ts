import { Router, Request, Response } from "express";
import { PagamentoController } from "../controllers/PagamentoController";

const router = Router();
const pagamentoController = new PagamentoController();

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: Registrar pagamento
 *     description: |
 *       Registra um pagamento a partir de um pagamento pendente.
 *
 *       **Funcionalidades:**
 *       - Busca o pagamento pendente e usa o valor dele
 *       - Data do pagamento é registrada automaticamente pelo servidor
 *       - Marca o pagamento pendente como PAGO
 *       - Se o pendente está associado a uma assinatura PENDENTE, ativa a assinatura
 *       - Registra entrada no histórico financeiro
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoCreateRequest'
 *     responses:
 *       201:
 *         description: Pagamento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoCreateResponse'
 *       400:
 *         description: Dados inválidos ou pagamento já realizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Pagamento pendente não encontrado
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
 */
router.post("/", (req: Request, res: Response) =>
  pagamentoController.registrarPagamentoCompleto(req, res)
);

/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Listar todos os pagamentos
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/", (req: Request, res: Response) => pagamentoController.getAllPagamentos(req, res));

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: Obter pagamento por ID
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       404:
 *         description: Pagamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.get("/:id", (req: Request, res: Response) => pagamentoController.getPagamentoById(req, res));

/**
 * @swagger
 * /pagamentos/forma/{forma_pagamento}:
 *   get:
 *     summary: Listar pagamentos por forma
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forma_pagamento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PIX, CARTAO, BOLETO, DINHEIRO]
 *         description: Forma de pagamento
 *     responses:
 *       200:
 *         description: Lista de pagamentos da forma especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       400:
 *         description: Forma de pagamento inválida
 *       401:
 *         description: Não autorizado
 */
router.get("/forma/:forma_pagamento", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByForma(req, res)
);

/**
 * @swagger
 * /pagamentos/{id}:
 *   put:
 *     summary: Atualizar pagamento
 *     description: Atualiza dados de um pagamento (use com cuidado)
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forma_pagamento:
 *                 type: string
 *                 enum: [PIX, CARTAO, BOLETO, DINHEIRO]
 *               observacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       404:
 *         description: Pagamento não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put("/:id", (req: Request, res: Response) => pagamentoController.updatePagamento(req, res));

/**
 * @swagger
 * /pagamentos/{id}:
 *   delete:
 *     summary: Deletar pagamento
 *     description: Remove um pagamento (use com cuidado - não reverte o status do pendente)
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do pagamento
 *     responses:
 *       204:
 *         description: Pagamento deletado
 *       404:
 *         description: Pagamento não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete("/:id", (req: Request, res: Response) =>
  pagamentoController.deletePagamento(req, res)
);

/**
 * @swagger
 * /pagamentos/total/geral:
 *   get:
 *     summary: Total de pagamentos
 *     description: Retorna o valor total de todos os pagamentos realizados
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 *       401:
 *         description: Não autorizado
 */
router.get("/total/geral", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentos(req, res)
);

export default router;
