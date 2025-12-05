import { Router, Request, Response } from "express";
import { PagamentoController } from "../controllers/PagamentoController";
import { PagamentoPendenteController } from "../controllers/PagamentoPendenteController";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const pagamentoController = new PagamentoController();
const pagamentoPendenteController = new PagamentoPendenteController();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /pagamentos/periodo:
 *   get:
 *     summary: Listar pagamentos por período
 *     tags:
 *       - Pagamentos
 */
router.get("/pagamentos-periodo", (req: Request, res: Response) =>
  pagamentoController.getPagamentosByDateRange(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/periodo:
 *   get:
 *     summary: Listar pagamentos pendentes por período
 *     tags:
 *       - Pagamentos Pendentes
 */
router.get("/pagamentos-pendentes-periodo", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentosPendentesByPeriodo(req, res)
);

/**
 * @swagger
 * /historicos/periodo:
 *   get:
 *     summary: Listar histórico por período
 *     tags:
 *       - Histórico
 */
router.get("/historicos-periodo", (req: Request, res: Response) =>
  historicoController.getHistoricosByPeriodo(req, res)
);

/**
 * @swagger
 * /historicos/total/entradas:
 *   get:
 *     summary: Total de entradas
 *     tags:
 *       - Histórico
 */
router.get("/historicos-total/entradas", (req: Request, res: Response) =>
  historicoController.getTotalEntradas(req, res)
);

/**
 * @swagger
 * /historicos/total/saidas:
 *   get:
 *     summary: Total de saídas
 *     tags:
 *       - Histórico
 */
router.get("/historicos-total/saidas", (req: Request, res: Response) =>
  historicoController.getTotalSaidas(req, res)
);

/**
 * @swagger
 * /historicos/saldo:
 *   get:
 *     summary: Saldo atual
 *     tags:
 *       - Histórico
 */
router.get("/historicos-saldo", (req: Request, res: Response) =>
  historicoController.getSaldoAtual(req, res)
);

export default router;
