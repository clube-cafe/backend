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
 */
router.get("/status/:status", (req: Request, res: Response) =>
  pagamentoPendenteController.getPagamentosPendentesByStatus(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/vencidos:
 *   get:
 *     summary: Listar pagamentos vencidos
 *     tags:
 *       - Pagamentos Pendentes
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
 */
router.delete("/:id", (req: Request, res: Response) =>
  pagamentoPendenteController.deletePagamentoPendente(req, res)
);

/**
 * @swagger
 * /pagamentos-pendentes/total/geral:
 *   get:
 *     summary: Total de pagamentos pendentes
 *     tags:
 *       - Pagamentos Pendentes
 */
router.get("/total/geral", (req: Request, res: Response) =>
  pagamentoPendenteController.getTotalPagamentosPendentes(req, res)
);

export default router;
