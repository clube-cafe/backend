import { Router, Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     deprecated: true
 *     summary: DESCONTINUADO - Use POST /auth/register. Para criar ADMINs use o script npm run insert-admin
 *     tags:
 *       - Usuários
 */
router.post("/", async (req: Request, res: Response) => {
  return res.status(403).json({
    message:
      "Criação de usuários via API foi descontinuada. Use POST /auth/register ou npm run insert-admin para ADMINs",
  });
});

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
