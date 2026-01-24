import { Request, Response } from "express";
import { DelinquenciaService } from "../services/DelinquenciaService";

export class DelinquenciaController {
  private delinquenciaService: DelinquenciaService;

  constructor() {
    this.delinquenciaService = new DelinquenciaService();
  }

  async obterAssinaturasEmAtraso(req: Request, res: Response) {
    try {
      const atrasos = await this.delinquenciaService.obterAssinaturasEmAtraso();
      return res.status(200).json({
        message: "Relatório de inadimplência obtido com sucesso",
        data: atrasos,
      });
    } catch (error: any) {
      console.error("Erro ao obter atrasos:", error);
      return res.status(500).json({ message: "Erro ao obter relatório de inadimplência" });
    }
  }

  async obterRelatorioPorUser(req: Request, res: Response) {
    try {
      const { user_id } = req.params;
      const relatorio = await this.delinquenciaService.obterRelatorioPorUser(user_id);
      return res.status(200).json({
        message: "Relatório de inadimplência do usuário obtido com sucesso",
        data: relatorio,
      });
    } catch (error: any) {
      console.error("Erro ao obter relatório:", error);
      const statusCode = error.message.includes("não encontrado") ? 404 : 500;
      return res.status(statusCode).json({ message: error.message });
    }
  }
}
