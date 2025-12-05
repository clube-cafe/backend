import { Router, Request, Response } from "express";
import { AssinaturaController } from "../controllers/AssinaturaController";
import { PagamentoController } from "../controllers/PagamentoController";
import { PagamentoPendenteController } from "../controllers/PagamentoPendenteController";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const assinaturaController = new AssinaturaController();
const pagamentoController = new PagamentoController();
const pagamentoPendenteController = new PagamentoPendenteController();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /users/{user_id}/assinaturas:
 *   get:
 *     summary: Listar assinaturas de um usuário
 *     tags:
 *       - Assinaturas
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:user_id/assinaturas", (req: Request, res: Response) => {
  const { user_id } = req.params;
  req.params.user_id = user_id;
  assinaturaController.getAssinaturasByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos:
 *   get:
 *     summary: Listar pagamentos de um usuário
 *     tags:
 *       - Pagamentos
 */
router.get("/:user_id/pagamentos", (req: Request, res: Response) => {
  pagamentoController.getPagamentosByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos/total:
 *   get:
 *     summary: Total de pagamentos por usuário
 *     tags:
 *       - Pagamentos
 */
router.get("/:user_id/pagamentos-total", (req: Request, res: Response) => {
  pagamentoController.getTotalPagamentosByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos-pendentes:
 *   get:
 *     summary: Listar pagamentos pendentes de um usuário
 *     tags:
 *       - Pagamentos Pendentes
 */
router.get("/:user_id/pagamentos-pendentes", (req: Request, res: Response) => {
  pagamentoPendenteController.getPagamentosPendentesByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/pagamentos-pendentes/total:
 *   get:
 *     summary: Total de pagamentos pendentes por usuário
 *     tags:
 *       - Pagamentos Pendentes
 */
router.get("/:user_id/pagamentos-pendentes-total", (req: Request, res: Response) => {
  pagamentoPendenteController.getTotalPagamentosPendentesByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos:
 *   get:
 *     summary: Listar histórico de um usuário
 *     tags:
 *       - Histórico
 */
router.get("/:user_id/historicos", (req: Request, res: Response) => {
  historicoController.getHistoricosByUserId(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/periodo:
 *   get:
 *     summary: Listar histórico de usuário por período
 *     tags:
 *       - Histórico
 */
router.get("/:user_id/historicos-periodo", (req: Request, res: Response) => {
  historicoController.getHistoricosByUserIdAndPeriodo(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/total/entradas:
 *   get:
 *     summary: Total de entradas por usuário
 *     tags:
 *       - Histórico
 */
router.get("/:user_id/historicos-total/entradas", (req: Request, res: Response) => {
  historicoController.getTotalEntradasByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/total/saidas:
 *   get:
 *     summary: Total de saídas por usuário
 *     tags:
 *       - Histórico
 */
router.get("/:user_id/historicos-total/saidas", (req: Request, res: Response) => {
  historicoController.getTotalSaidasByUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}/historicos/saldo:
 *   get:
 *     summary: Saldo por usuário
 *     tags:
 *       - Histórico
 */
router.get("/:user_id/historicos-saldo", (req: Request, res: Response) => {
  historicoController.getSaldoAtualByUser(req, res);
});

export default router;
