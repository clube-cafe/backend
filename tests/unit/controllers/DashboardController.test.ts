import { DashboardController } from "../../../src/controllers/DashboardController";
import { Request, Response } from "express";
import { dispatch } from "../test-helpers";

const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
};

const makeReq = (data: Partial<Request>) => data as Request;

describe("DashboardController", () => {
  it("deve retornar métricas com status 200", async () => {
    const controller = new DashboardController();
    const mockService = {
      obterMetricas: jest.fn().mockResolvedValue({ totalAssinaturas: 5 }),
    } as any;
    (controller as any).dashboardService = mockService;

    const res = makeRes();
    await dispatch(controller.obterMetricas.bind(controller), makeReq({}), res);

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
    await dispatch(controller.obterPagamentosPendentes.bind(controller), makeReq({}), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
