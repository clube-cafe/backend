import { DashboardController } from "../../../src/controllers/DashboardController";
import { Request, Response } from "express";

describe("DashboardController", () => {
  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => data as Request;

  it("deve retornar métricas com status 200", async () => {
    const controller = new DashboardController();
    const mockService = {
      obterMetricas: jest.fn().mockResolvedValue({ totalAssinaturas: 5 }),
    } as any;
    (controller as any).dashboardService = mockService;

    const res = makeRes();

    await controller.obterMetricas(makeReq({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Métricas do dashboard obtidas com sucesso",
      data: { totalAssinaturas: 5 },
    });
  });

  it("deve retornar 500 quando serviço falhar em obter pagamentos pendentes", async () => {
    const controller = new DashboardController();
    const mockService = {
      obterPagamentosPendentes: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).dashboardService = mockService;

    const res = makeRes();

    await controller.obterPagamentosPendentes(makeReq({}), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter pagamentos pendentes" });
  });
});
