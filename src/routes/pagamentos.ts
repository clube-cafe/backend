import { Router, Request, Response } from "express";
import { PagamentoController } from "../controllers/PagamentoController";

const router = Router();
const pagamentoController = new PagamentoController();

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: Registrar novo pagamento
 *     tags:
 *       - Pagamentos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pagamento'
 */
router.post("/", (req: Request, res: Response) => pagamentoController.createPagamento(req, res));

/**
 * @swagger
 * /pagamentos/completo:
 *   post:
 *     summary: Registrar pagamento com atualização automática de pendência e histórico
 *     tags:
 *       - Pagamentos
 */
router.post("/completo", (req: Request, res: Response) =>
  pagamentoController.registrarPagamentoCompleto(req, res)
);

/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Listar todos os pagamentos
 *     tags:
 *       - Pagamentos
 */
router.get("/", (req: Request, res: Response) => pagamentoController.getAllPagamentos(req, res));

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: Obter pagamento por ID
 *     tags:
 *       - Pagamentos
 */
router.get("/:id", (req: Request, res: Response) => pagamentoController.getPagamentoById(req, res));

/**
 * @swagger
 * /pagamentos/forma/{forma_pagamento}:
 *   get:
 *     summary: Listar pagamentos por forma
 *     tags:
 *       - Pagamentos
 */
router.get("/forma/:forma_pagamento", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByForma(req, res)
);

/**
 * @swagger
 * /pagamentos/{id}:
 *   put:
 *     summary: Atualizar pagamento
 *     tags:
 *       - Pagamentos
 */
router.put("/:id", (req: Request, res: Response) => pagamentoController.updatePagamento(req, res));

/**
 * @swagger
 * /pagamentos/{id}:
 *   delete:
 *     summary: Deletar pagamento
 *     tags:
 *       - Pagamentos
 */
router.delete("/:id", (req: Request, res: Response) =>
  pagamentoController.deletePagamento(req, res)
);

/**
 * @swagger
 * /pagamentos/total/geral:
 *   get:
 *     summary: Total de pagamentos
 *     tags:
 *       - Pagamentos
 */
router.get("/total/geral", (req: Request, res: Response) =>
  pagamentoController.getTotalPagamentos(req, res)
);

export default router;
