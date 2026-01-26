import { Express } from "express";

import authRoutes from "../routes/authRoutes";
import assinaturasRouter from "../routes/assinaturas";
import pagamentosRouter from "../routes/pagamentos";
import pagamentosPendentesRouter from "../routes/pagamentosPendentes";
import historicosRouter from "../routes/historicos";
import userRelatedRouter from "../routes/userRelated";
import queriesRouter from "../routes/queries";
import dashboardRouter from "../routes/dashboard";
import delinquenciaRouter from "../routes/delinquencia";

import { authenticate } from "../middlewares/authMiddleware";

export const setupRoutes = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use("/", queriesRouter);

  // Rotas protegidas
  app.use("/users", authenticate, userRelatedRouter);
  app.use("/assinaturas", authenticate, assinaturasRouter);
  app.use("/pagamentos", authenticate, pagamentosRouter);
  app.use("/pagamentos-pendentes", authenticate, pagamentosPendentesRouter);
  app.use("/historicos", authenticate, historicosRouter);
  app.use("/dashboard", authenticate, dashboardRouter);
  app.use("/delinquencia", authenticate, delinquenciaRouter);
};
