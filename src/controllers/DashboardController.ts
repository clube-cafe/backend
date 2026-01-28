import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";
import { Logger } from "../utils/Logger";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async obterMetricas(req: Request, res: Response) {
    try {
      const metricas = await this.dashboardService.obterMetricas();
      return res.status(200).json({
        message: "Métricas do dashboard obtidas com sucesso",
        data: metricas,
      });
    } catch (error) {
      Logger.error("Erro ao obter métricas", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter métricas" });
    }
  }

  async obterDetalhesAssinaturas(req: Request, res: Response) {
    try {
      const detalhes = await this.dashboardService.obterDetalhesAssinaturas();
      return res.status(200).json({
        message: "Detalhes das assinaturas obtidos com sucesso",
        data: detalhes,
      });
    } catch (error) {
      Logger.error("Erro ao obter detalhes", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter detalhes das assinaturas" });
    }
  }

  async obterPagamentosPendentes(req: Request, res: Response) {
    try {
      const pagamentos = await this.dashboardService.obterPagamentosPendentes();
      return res.status(200).json({
        message: "Pagamentos pendentes obtidos com sucesso",
        data: pagamentos,
      });
    } catch (error) {
      Logger.error("Erro ao obter pagamentos pendentes", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: "Erro ao obter pagamentos pendentes" });
    }
  }
}
