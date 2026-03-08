import { Express } from "express";

import authRoutes from "../routes/authRoutes";
import assinaturasRouter from "../routes/assinaturas";
import pagamentosRouter from "../routes/pagamentos";
import historicosRouter from "../routes/historicos";
import userRelatedRouter from "../routes/userRelated";
import queriesRouter from "../routes/queries";
import dashboardRouter from "../routes/dashboard";
import delinquenciaRouter from "../routes/delinquencia";
import planosRouter from "../routes/planos";

import { authenticate } from "../middlewares/authMiddleware";

export const setupRoutes = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use("/planos", planosRouter);

  // Queries por período (protegidas)
  app.use("/", authenticate, queriesRouter);

  // Rotas protegidas
  app.use("/users", authenticate, userRelatedRouter);
  app.use("/assinaturas", authenticate, assinaturasRouter);
  app.use("/pagamentos", authenticate, pagamentosRouter);
  app.use("/historicos", authenticate, historicosRouter);
  app.use("/dashboard", authenticate, dashboardRouter);
  app.use("/delinquencia", authenticate, delinquenciaRouter);
};
