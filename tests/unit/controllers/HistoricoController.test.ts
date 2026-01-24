import { HistoricoController } from "../../../src/controllers/HistoricoController";
import { Request, Response } from "express";

describe("HistoricoController", () => {
  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => data as Request;

  it("deve retornar saldo atual com sucesso", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getSaldoAtual: jest.fn().mockResolvedValue(150),
    } as any;
    (controller as any).historicoService = mockService;

    const req = makeReq({});
    const res = makeRes();

    await controller.getSaldoAtual(req, res);

    expect(mockService.getSaldoAtual).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ saldo: 150 });
  });

  it("deve retornar 404 quando histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockRejectedValue(new Error("Histórico não encontrado")),
    } as any;
    (controller as any).historicoService = mockService;

    const req = makeReq({ params: { id: "missing" } });
    const res = makeRes();

    await controller.getHistoricoById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Histórico não encontrado" });
  });

  it("deve criar histórico (201)", async () => {
    const controller = new HistoricoController();
    const mockService = { createHistorico: jest.fn().mockResolvedValue({ id: "h1" }) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.createHistorico(
      makeReq({ body: { user_id: "u", tipo: "ENTRADA", valor: 10, data: "2024-01-01", descricao: "ok" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "h1" });
  });

  it("deve retornar 400 ao criar histórico (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { createHistorico: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.createHistorico(makeReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve listar históricos (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getAllHistoricos: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getAllHistoricos(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 500 ao listar históricos (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getAllHistoricos: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getAllHistoricos(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter históricos", error: "falha" });
  });

  it("deve obter histórico por id (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricoById: jest.fn().mockResolvedValue({ id: "h1" }) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricoById(makeReq({ params: { id: "h1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: "h1" });
  });

  it("deve retornar 400 em getById (erro genérico)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricoById: jest.fn().mockRejectedValue(new Error("erro genérico")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricoById(makeReq({ params: { id: "h1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro genérico" });
  });

  it("deve listar por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByUserId: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByUserId(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por usuário (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByUserId: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByUserId(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve listar por tipo (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByTipo: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByTipo(makeReq({ params: { tipo: "ENTRADA" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por tipo (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByTipo: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByTipo(makeReq({ params: { tipo: "X" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve listar por período (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByPeriodo: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByPeriodo(makeReq({ query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por período (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByPeriodo: jest.fn().mockRejectedValue(new Error("erro periodo")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByPeriodo(makeReq({ query: { data_inicio: "x", data_fim: "y" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro periodo" });
  });

  it("deve listar por usuário e período (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByUserIdAndPeriodo: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByUserIdAndPeriodo(makeReq({ params: { user_id: "u1" }, query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por usuário e período (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByUserIdAndPeriodo: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getHistoricosByUserIdAndPeriodo(makeReq({ params: { user_id: "u1" }, query: { data_inicio: "x", data_fim: "y" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve atualizar histórico (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { updateHistorico: jest.fn().mockResolvedValue({ id: "h1", valor: 20 }) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.updateHistorico(makeReq({ params: { id: "h1" }, body: { valor: 20 } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: "h1", valor: 20 });
  });

  it("deve retornar 404 ao atualizar histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = { updateHistorico: jest.fn().mockRejectedValue(new Error("Histórico não encontrado")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.updateHistorico(makeReq({ params: { id: "missing" }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Histórico não encontrado" });
  });

  it("deve deletar histórico (204)", async () => {
    const controller = new HistoricoController();
    const mockService = { deleteHistorico: jest.fn().mockResolvedValue(true) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.deleteHistorico(makeReq({ params: { id: "h1" } }), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = { deleteHistorico: jest.fn().mockRejectedValue(new Error("Histórico não encontrado")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.deleteHistorico(makeReq({ params: { id: "missing" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Histórico não encontrado" });
  });

  it("deve retornar total entradas (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradas: jest.fn().mockResolvedValue(10) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalEntradas(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 10 });
  });

  it("deve retornar 500 em total entradas (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradas: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalEntradas(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao calcular total", error: "falha" });
  });

  it("deve retornar total saídas (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidas: jest.fn().mockResolvedValue(5) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalSaidas(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 5 });
  });

  it("deve retornar 500 em total saídas (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidas: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalSaidas(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao calcular total", error: "falha" });
  });

  it("deve retornar total por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradasByUser: jest.fn().mockResolvedValue(7) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalEntradasByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ total: 7 });
  });

  it("deve retornar 400 em total entradas por usuário (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradasByUser: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalEntradasByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve retornar total saídas por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidasByUser: jest.fn().mockResolvedValue(4) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalSaidasByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ total: 4 });
  });

  it("deve retornar 400 em total saídas por usuário (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidasByUser: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getTotalSaidasByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve retornar saldo por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getSaldoAtualByUser: jest.fn().mockResolvedValue(3) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getSaldoAtualByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ saldo: 3 });
  });

  it("deve retornar 400 em saldo por usuário (erro)", async () => {
    const controller = new HistoricoController();
    const mockService = { getSaldoAtualByUser: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await controller.getSaldoAtualByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });
});
