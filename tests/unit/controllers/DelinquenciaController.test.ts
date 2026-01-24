import { DelinquenciaController } from "../../../src/controllers/DelinquenciaController";
import { Request, Response } from "express";

describe("DelinquenciaController", () => {
  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => data as Request;

  it("deve retornar relatório geral com status 200", async () => {
    const controller = new DelinquenciaController();
    const mockService = {
      obterAssinaturasEmAtraso: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).delinquenciaService = mockService;

    const res = makeRes();

    await controller.obterAssinaturasEmAtraso(makeReq({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Relatório de inadimplência obtido com sucesso",
      data: [{ id: "a1" }],
    });
  });

  it("deve retornar 404 quando relatório do usuário não encontrado", async () => {
    const controller = new DelinquenciaController();
    const mockService = {
      obterRelatorioPorUser: jest.fn().mockRejectedValue(new Error("usuário não encontrado")),
    } as any;
    (controller as any).delinquenciaService = mockService;

    const req = makeReq({ params: { user_id: "missing" } });
    const res = makeRes();

    await controller.obterRelatorioPorUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "usuário não encontrado" });
  });
});
