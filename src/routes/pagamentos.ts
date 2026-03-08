import { Router, Request, Response } from "express";
import { PagamentoController } from "../controllers/PagamentoController";

const router = Router();
const pagamentoController = new PagamentoController();

// ========== CRIAÇÃO ==========

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: Criar pagamento
 *     description: |
 *       Cria um novo pagamento com status PENDENTE.
 *
 *       O pagamento pode ser associado a uma assinatura ou ser avulso.
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
 *         description: Pagamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado
 */
router.post("/criar", (req: Request, res: Response) =>
  pagamentoController.createPagamento(req, res)
);

/**
 * @swagger
 * /pagamentos/registrar:
 *   post:
 *     summary: Registrar pagamento completo
 *     description: |
 *       Registra o pagamento de um pagamento pendente/atrasado.
 *
 *       **Funcionalidades:**
 *       - Busca o pagamento e usa o valor dele
 *       - Data do pagamento é registrada automaticamente pelo servidor
 *       - Marca o pagamento como PAGO
 *       - Se o pagamento está associado a uma assinatura PENDENTE, ativa a assinatura
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
 *             $ref: '#/components/schemas/RegistrarPagamentoRequest'
 *     responses:
 *       201:
 *         description: Pagamento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrarPagamentoResponse'
 *       400:
 *         description: Dados inválidos ou pagamento já realizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Pagamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundError'
 *       401:
 *         description: Não autorizado
 */
router.post("/registrar", (req: Request, res: Response) =>
  pagamentoController.registrarPagamentoCompleto(req, res)
);

// ========== LEITURA ==========

/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Listar todos os pagamentos
 *     description: Lista todos os pagamentos (admin only). Suporta paginação.
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
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
 *       403:
 *         description: Acesso restrito a administradores
 */
router.get("/", (req: Request, res: Response) => pagamentoController.getAllPagamentos(req, res));

/**
 * @swagger
 * /pagamentos/pendentes:
 *   get:
 *     summary: Listar pagamentos pendentes e atrasados
 *     description: Retorna pagamentos com status PENDENTE ou ATRASADO (admin only)
 *     tags:
 *       - Pagamentos
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
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       403:
 *         description: Acesso restrito a administradores
 */
router.get("/pendentes", (req: Request, res: Response) =>
  pagamentoController.getPagamentosPendentes(req, res)
);

/**
 * @swagger
 * /pagamentos/vencidos:
 *   get:
 *     summary: Listar pagamentos vencidos
 *     description: Retorna pagamentos com status PENDENTE cuja data de vencimento já passou
 *     tags:
 *       - Pagamentos
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
 *                 $ref: '#/components/schemas/PagamentoResponse'
 */
router.get("/vencidos", (req: Request, res: Response) =>
  pagamentoController.getPagamentosVencidos(req, res)
);

/**
 * @swagger
 * /pagamentos/status/{status}:
 *   get:
 *     summary: Listar pagamentos por status
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDENTE, ATRASADO, PAGO, CANCELADO]
 *     responses:
 *       200:
 *         description: Lista de pagamentos filtrados por status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 *       403:
 *         description: Acesso restrito a administradores
 */
router.get("/status/:status", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByStatus(req, res)
);

/**
 * @swagger
 * /pagamentos/forma/{forma_pagamento}:
 *   get:
 *     summary: Listar pagamentos por forma de pagamento
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
 *           enum: [PIX, CARTAO, CAIXA]
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
 */
router.get("/forma/:forma_pagamento", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByForma(req, res)
);

/**
 * @swagger
 * /pagamentos/periodo:
 *   get:
 *     summary: Listar pagamentos por período de vencimento
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
 *       - in: query
 *         name: data_fim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Datas inválidas
 */
router.get("/periodo", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByVencimentoPeriodo(req, res)
);

/**
 * @swagger
 * /pagamentos/total/geral:
 *   get:
 *     summary: Total de pagamentos realizados
 *     description: Retorna o valor total de todos os pagamentos com status PAGO
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
 */
router.get("/total/geral", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentos(req, res)
);

/**
 * @swagger
 * /pagamentos/total/pendentes:
 *   get:
 *     summary: Total de pagamentos pendentes
 *     description: Retorna o valor total dos pagamentos com status PENDENTE ou ATRASADO
 *     tags:
 *       - Pagamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de pagamentos pendentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 */
router.get("/total/pendentes", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentosPendentes(req, res)
);

/**
 * @swagger
 * /pagamentos/total/pendentes/{user_id}:
 *   get:
 *     summary: Total de pagamentos pendentes do usuário
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
 *     responses:
 *       200:
 *         description: Total de pagamentos pendentes do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 */
router.get("/total/pendentes/:user_id", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentosPendentesByUser(req, res)
);

/**
 * @swagger
 * /pagamentos/user/{user_id}:
 *   get:
 *     summary: Listar pagamentos do usuário
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
 *     responses:
 *       200:
 *         description: Lista de pagamentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PagamentoResponse'
 */
router.get("/user/:user_id", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByUserId(req, res)
);

/**
 * @swagger
 * /pagamentos/total/user/{user_id}:
 *   get:
 *     summary: Total de pagamentos do usuário
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
 *     responses:
 *       200:
 *         description: Total de pagamentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalResponse'
 */
router.get("/total/user/:user_id", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentosByUser(req, res)
);

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
 *     responses:
 *       200:
 *         description: Pagamento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       404:
 *         description: Pagamento não encontrado
 */
router.get("/:id", (req: Request, res: Response) => pagamentoController.getPagamentoById(req, res));

// ========== ATUALIZAÇÃO ==========

/**
 * @swagger
 * /pagamentos/{id}:
 *   put:
 *     summary: Atualizar pagamento
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoUpdateRequest'
 *     responses:
 *       200:
 *         description: Pagamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       404:
 *         description: Pagamento não encontrado
 */
router.put("/:id", (req: Request, res: Response) => pagamentoController.updatePagamento(req, res));

/**
 * @swagger
 * /pagamentos/{id}/status:
 *   patch:
 *     summary: Atualizar status do pagamento
 *     description: |
 *       Atualiza apenas o status do pagamento. Transições válidas:
 *       - PENDENTE → ATRASADO, PAGO, CANCELADO
 *       - ATRASADO → PAGO, CANCELADO
 *       - PAGO → (nenhuma)
 *       - CANCELADO → (nenhuma)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagamentoStatusRequest'
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PagamentoResponse'
 *       400:
 *         description: Transição de status inválida
 *       404:
 *         description: Pagamento não encontrado
 */
router.patch("/:id/status", (req: Request, res: Response) =>
  pagamentoController.updateStatusPagamento(req, res)
);

// ========== EXCLUSÃO ==========

/**
 * @swagger
 * /pagamentos/{id}:
 *   delete:
 *     summary: Deletar pagamento
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
 *     responses:
 *       204:
 *         description: Pagamento deletado
 *       404:
 *         description: Pagamento não encontrado
 */
router.delete("/:id", (req: Request, res: Response) =>
  pagamentoController.deletePagamento(req, res)
);

export default router;
