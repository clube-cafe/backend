import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  async obterMetricas(req: Request, res: Response) {
    const metricas = await this.dashboardService.obterMetricas();
    return res.status(200).json({
      message: "Métricas do dashboard obtidas com sucesso",
      data: metricas,
    });
  }

  async obterDetalhesAssinaturas(req: Request, res: Response) {
    const detalhes = await this.dashboardService.obterDetalhesAssinaturas();
    return res.status(200).json({
      message: "Detalhes das assinaturas obtidos com sucesso",
      data: detalhes,
    });
  }

  async obterPagamentosPendentes(req: Request, res: Response) {
    const pagamentos = await this.dashboardService.obterPagamentosPendentes();
    return res.status(200).json({
      message: "Pagamentos pendentes obtidos com sucesso",
      data: pagamentos,
    });
  }
}
