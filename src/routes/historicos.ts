import { Router, Request, Response } from "express";
import { HistoricoController } from "../controllers/HistoricoController";

const router = Router();
const historicoController = new HistoricoController();

/**
 * @swagger
 * /historicos:
 *   post:
 *     summary: Criar registro de histórico
 *     tags:
 *       - Histórico
 */
router.post("/", (req: Request, res: Response) => historicoController.createHistorico(req, res));

/**
 * @swagger
 * /historicos:
 *   get:
 *     summary: Listar todos os históricos
 *     tags:
 *       - Histórico
 */
router.get("/", (req: Request, res: Response) => historicoController.getAllHistoricos(req, res));

/**
 * @swagger
 * /historicos/{id}:
 *   get:
 *     summary: Obter histórico por ID
 *     tags:
 *       - Histórico
 */
router.get("/:id", (req: Request, res: Response) => historicoController.getHistoricoById(req, res));

/**
 * @swagger
 * /historicos/tipo/{tipo}:
 *   get:
 *     summary: Listar histórico por tipo (ENTRADA/SAIDA)
 *     tags:
 *       - Histórico
 */
router.get("/tipo/:tipo", (req: Request, res: Response) =>
  historicoController.getHistoricosByTipo(req, res)
);

/**
 * @swagger
 * /historicos/{id}:
 *   put:
 *     summary: Atualizar histórico
 *     tags:
 *       - Histórico
 */
router.put("/:id", (req: Request, res: Response) => historicoController.updateHistorico(req, res));

/**
 * @swagger
 * /historicos/{id}:
 *   delete:
 *     summary: Deletar histórico
 *     tags:
 *       - Histórico
 */
router.delete("/:id", (req: Request, res: Response) =>
  historicoController.deleteHistorico(req, res)
);

/**
 * @swagger
 * /historicos/total/entradas:
 *   get:
 *     summary: Total de entradas
 *     tags:
 *       - Histórico
 */
router.get("/total/entradas", (req: Request, res: Response) =>
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
router.get("/total/saidas", (req: Request, res: Response) =>
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
router.get("/saldo", (req: Request, res: Response) => historicoController.getSaldoAtual(req, res));

export default router;
