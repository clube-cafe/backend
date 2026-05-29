import { Request, Response } from "express";
import { DelinquenciaService } from "../services/DelinquenciaService";

export class DelinquenciaController {
  private delinquenciaService: DelinquenciaService;

  constructor() {
    this.delinquenciaService = new DelinquenciaService();
  }

  async obterAssinaturasEmAtraso(req: Request, res: Response) {
    const atrasos = await this.delinquenciaService.obterAssinaturasEmAtraso();
    return res.status(200).json({
      message: "Relatório de inadimplência obtido com sucesso",
      data: atrasos,
    });
  }

  async obterRelatorioPorUser(req: Request, res: Response) {
    const { user_id } = req.params;
    const relatorio = await this.delinquenciaService.obterRelatorioPorUser(user_id);
    return res.status(200).json({
      message: "Relatório de inadimplência do usuário obtido com sucesso",
      data: relatorio,
    });
  }
}
