import { Express } from "express";
import usersRouter from "../routes/users";
import assinaturasRouter from "../routes/assinaturas";
import pagamentosRouter from "../routes/pagamentos";
import pagamentosPendentesRouter from "../routes/pagamentosPendentes";
import historicosRouter from "../routes/historicos";
import userRelatedRouter from "../routes/userRelated";
import queriesRouter from "../routes/queries";
import dashboardRouter from "../routes/dashboard";
import delinquenciaRouter from "../routes/delinquencia";

export const setupRoutes = (app: Express) => {
  app.use("/users", usersRouter);
  app.use("/assinaturas", assinaturasRouter);
  app.use("/pagamentos", pagamentosRouter);
  app.use("/pagamentos-pendentes", pagamentosPendentesRouter);
  app.use("/historicos", historicosRouter);
  app.use("/users", userRelatedRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/delinquencia", delinquenciaRouter);
  app.use("/", queriesRouter);
};
