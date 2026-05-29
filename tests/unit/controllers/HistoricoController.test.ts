import { HistoricoController } from "../../../src/controllers/HistoricoController";
import {
  VALID_UUID,
  makeRes,
  makeReq,
  makeAuthenticatedReq,
  makeAdminReq,
  dispatch,
} from "../test-helpers";
import { NotFoundError, ValidationError } from "../../../src/utils/Errors";

describe("HistoricoController", () => {
  it("deve retornar saldo atual com sucesso", async () => {
    const controller = new HistoricoController();
    const mockService = { getSaldoAtual: jest.fn().mockResolvedValue(150) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getSaldoAtual.bind(controller), makeReq({}), res);
    expect(mockService.getSaldoAtual).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ saldo: 150 });
  });

  it("deve retornar 404 quando histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockRejectedValue(new NotFoundError("Histórico")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricoById.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve criar histórico (201)", async () => {
    const controller = new HistoricoController();
    const mockService = { createHistorico: jest.fn().mockResolvedValue({ id: "h1" }) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.createHistorico.bind(controller),
      makeAuthenticatedReq({
        body: {
          user_id: VALID_UUID,
          tipo: "ENTRADA",
          valor: 10,
          data: "2024-01-01",
          descricao: "ok",
        },
      }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "h1" });
  });

  it("deve retornar 400 ao criar histórico (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      createHistorico: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.createHistorico.bind(controller),
      makeAuthenticatedReq({ body: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar históricos (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getAllHistoricos: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getAllHistoricos.bind(controller), makeAdminReq({}), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 500 ao listar históricos (erro inesperado)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getAllHistoricos: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getAllHistoricos.bind(controller), makeAdminReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve obter histórico por id (200)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricoById.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, user_id: VALID_UUID });
  });

  it("deve retornar 400 em getById (ValidationError do serviço)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockRejectedValue(new ValidationError("erro genérico")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricoById.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricosByUserId: jest.fn().mockResolvedValue([{ id: "h1" }]),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByUserId.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por usuário (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricosByUserId: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByUserId.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar por tipo (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getHistoricosByTipo: jest.fn().mockResolvedValue([{ id: "h1" }]) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByTipo.bind(controller),
      makeAdminReq({ params: { tipo: "ENTRADA" } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por tipo (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricosByTipo: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByTipo.bind(controller),
      makeAdminReq({ params: { tipo: "X" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar por período (200)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricosByPeriodo: jest.fn().mockResolvedValue([{ id: "h1" }]),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByPeriodo.bind(controller),
      makeAdminReq({ query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por período (datas inválidas)", async () => {
    const controller = new HistoricoController();
    (controller as any).historicoService = { getHistoricosByPeriodo: jest.fn() };
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByPeriodo.bind(controller),
      makeAdminReq({ query: { data_inicio: "x", data_fim: "y" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar por usuário e período (200)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricosByUserIdAndPeriodo: jest.fn().mockResolvedValue([{ id: "h1" }]),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByUserIdAndPeriodo.bind(controller),
      makeAuthenticatedReq({
        params: { user_id: VALID_UUID },
        query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" },
      }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "h1" }]);
  });

  it("deve retornar 400 por usuário e período (datas inválidas)", async () => {
    const controller = new HistoricoController();
    (controller as any).historicoService = { getHistoricosByUserIdAndPeriodo: jest.fn() };
    const res = makeRes();
    await dispatch(
      controller.getHistoricosByUserIdAndPeriodo.bind(controller),
      makeAuthenticatedReq({
        params: { user_id: VALID_UUID },
        query: { data_inicio: "x", data_fim: "y" },
      }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve atualizar histórico (200)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      updateHistorico: jest.fn().mockResolvedValue({ id: VALID_UUID, valor: 20 }),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.updateHistorico.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID }, body: { valor: 20 } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, valor: 20 });
  });

  it("deve retornar 404 ao atualizar histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockRejectedValue(new NotFoundError("Histórico")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.updateHistorico.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID }, body: {} }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve deletar histórico (204)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      deleteHistorico: jest.fn().mockResolvedValue(true),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.deleteHistorico.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar histórico não encontrado", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getHistoricoById: jest.fn().mockRejectedValue(new NotFoundError("Histórico")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.deleteHistorico.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve retornar total entradas (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradas: jest.fn().mockResolvedValue(10) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalEntradas.bind(controller), makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 10 });
  });

  it("deve retornar 500 em total entradas (erro inesperado)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getTotalEntradas: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalEntradas.bind(controller), makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve retornar total saídas (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidas: jest.fn().mockResolvedValue(5) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalSaidas.bind(controller), makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 5 });
  });

  it("deve retornar 500 em total saídas (erro inesperado)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getTotalSaidas: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalSaidas.bind(controller), makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve retornar total por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalEntradasByUser: jest.fn().mockResolvedValue(7) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalEntradasByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ total: 7 });
  });

  it("deve retornar 400 em total entradas por usuário (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getTotalEntradasByUser: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalEntradasByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar total saídas por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getTotalSaidasByUser: jest.fn().mockResolvedValue(4) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalSaidasByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ total: 4 });
  });

  it("deve retornar 400 em total saídas por usuário (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getTotalSaidasByUser: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalSaidasByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar saldo por usuário (200)", async () => {
    const controller = new HistoricoController();
    const mockService = { getSaldoAtualByUser: jest.fn().mockResolvedValue(3) } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getSaldoAtualByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ saldo: 3 });
  });

  it("deve retornar 400 em saldo por usuário (ValidationError)", async () => {
    const controller = new HistoricoController();
    const mockService = {
      getSaldoAtualByUser: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).historicoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getSaldoAtualByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
