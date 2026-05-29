import { DelinquenciaController } from "../../../src/controllers/DelinquenciaController";
import { Request, Response } from "express";
import { dispatch } from "../test-helpers";
import { NotFoundError } from "../../../src/utils/Errors";

const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
};

const makeReq = (data: Partial<Request>) => data as Request;

describe("DelinquenciaController", () => {
  it("deve retornar relatório geral com status 200", async () => {
    const controller = new DelinquenciaController();
    const mockService = {
      obterAssinaturasEmAtraso: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).delinquenciaService = mockService;

    const res = makeRes();
    await dispatch(controller.obterAssinaturasEmAtraso.bind(controller), makeReq({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Relatório de inadimplência obtido com sucesso",
      data: [{ id: "a1" }],
    });
  });

  it("deve retornar 404 quando relatório do usuário não encontrado", async () => {
    const controller = new DelinquenciaController();
    const mockService = {
      obterRelatorioPorUser: jest.fn().mockRejectedValue(new NotFoundError("Usuário")),
    } as any;
    (controller as any).delinquenciaService = mockService;

    const req = makeReq({ params: { user_id: "missing" } });
    const res = makeRes();
    await dispatch(controller.obterRelatorioPorUser.bind(controller), req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
