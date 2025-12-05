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
 * /assinaturas/{id}:
 *   delete:
 *     summary: Deletar assinatura
 *     tags:
 *       - Assinaturas
 */
router.delete("/:id", (req: Request, res: Response) =>
  assinaturaController.deleteAssinatura(req, res)
);

export default router;
