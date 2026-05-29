import { PagamentoController } from "../../../src/controllers/PagamentoController";
import {
  VALID_UUID,
  makeRes,
  makeReq,
  makeAuthenticatedReq,
  makeAdminReq,
  dispatch,
} from "../test-helpers";
import { NotFoundError, ValidationError } from "../../../src/utils/Errors";

describe("PagamentoController", () => {
  it("deve criar um pagamento e retornar 201", async () => {
    const controller = new PagamentoController();
    const mockService = {
      createPagamento: jest
        .fn()
        .mockResolvedValue({ id: "p1", user_id: VALID_UUID, valor: 50, status: "PENDENTE" }),
    } as any;
    (controller as any).pagamentoService = mockService;

    const req = makeAuthenticatedReq({
      body: {
        user_id: VALID_UUID,
        valor: 50,
        data_vencimento: "2024-02-01",
        descricao: "Mensalidade",
        status: "PENDENTE",
      },
    });
    const res = makeRes();

    await dispatch(controller.createPagamento.bind(controller), req, res);

    expect(mockService.createPagamento).toHaveBeenCalledWith(
      VALID_UUID,
      50,
      new Date("2024-02-01"),
      "Mensalidade",
      "PENDENTE"
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 400 quando forma de pagamento é inválida", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentosByForma: jest.fn().mockRejectedValue(new ValidationError("Forma inválida")),
    } as any;
    (controller as any).pagamentoService = mockService;

    const req = makeReq({ params: { forma_pagamento: "INVALIDA" } });
    const res = makeRes();

    await dispatch(controller.getPagamentosByForma.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve listar todos os pagamentos (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getAllPagamentos: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getAllPagamentos.bind(controller),
      makeAdminReq({ query: {} }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 500 ao listar pagamentos (erro inesperado)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getAllPagamentos: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getAllPagamentos.bind(controller),
      makeAdminReq({ query: {} }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve obter pagamento por id (200)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentoById.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, user_id: VALID_UUID });
  });

  it("deve retornar 404 quando pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockRejectedValue(new NotFoundError("Pagamento")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentoById.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve listar pagamentos por usuário (200)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentosByUserId: jest.fn().mockResolvedValue([{ id: "p1" }]),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentosByUserId.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 400 em pagamentos por usuário (ValidationError)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentosByUserId: jest.fn().mockRejectedValue(new ValidationError("erro user")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentosByUserId.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar pagamentos por forma (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByForma: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentosByForma.bind(controller),
      makeReq({ params: { forma_pagamento: "PIX" } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar pagamentos por período (200)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentosByDateRange: jest.fn().mockResolvedValue([{ id: "p1" }]),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getPagamentosByDateRange.bind(controller),
      makeReq({ query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 400 em pagamentos por período (datas inválidas)", async () => {
    const controller = new PagamentoController();
    (controller as any).pagamentoService = { getPagamentosByDateRange: jest.fn() };
    const res = makeRes();
    await dispatch(
      controller.getPagamentosByDateRange.bind(controller),
      makeReq({ query: { data_inicio: "x", data_fim: "y" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve atualizar pagamento (200)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      updatePagamento: jest.fn().mockResolvedValue({ id: VALID_UUID, valor: 60 }),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.updatePagamento.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID }, body: { valor: 60 } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, valor: 60 });
  });

  it("deve retornar 404 ao atualizar pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockRejectedValue(new NotFoundError("Pagamento")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.updatePagamento.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID }, body: {} }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve deletar pagamento (204)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      deletePagamento: jest.fn().mockResolvedValue(true),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.deletePagamento.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentoById: jest.fn().mockRejectedValue(new NotFoundError("Pagamento")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.deletePagamento.bind(controller),
      makeAuthenticatedReq({ params: { id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve retornar total de pagamentos (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentos: jest.fn().mockResolvedValue(100) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalPagamentos.bind(controller), makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 100 });
  });

  it("deve retornar 500 ao calcular total (erro inesperado)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getTotalPagamentos: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(controller.getTotalPagamentos.bind(controller), makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve retornar total por usuário (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentosByUser: jest.fn().mockResolvedValue(40) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalPagamentosByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.json).toHaveBeenCalledWith({ total: 40 });
  });

  it("deve retornar 400 em total por usuário (ValidationError)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getTotalPagamentosByUser: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.getTotalPagamentosByUser.bind(controller),
      makeAuthenticatedReq({ params: { user_id: VALID_UUID } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve registrar pagamento completo (201)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      registrarPagamentoCompleto: jest
        .fn()
        .mockResolvedValue({ pagamento: { id: "p1", valor: 50 }, assinaturaAtivada: true }),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.registrarPagamentoCompleto.bind(controller),
      makeAuthenticatedReq({
        body: { pagamento_id: VALID_UUID, forma_pagamento: "PIX", observacao: "obs" },
      }),
      res
    );
    expect(mockService.registrarPagamentoCompleto).toHaveBeenCalledWith(VALID_UUID, "PIX", "obs");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 400 em registrar pagamento completo (ValidationError)", async () => {
    const controller = new PagamentoController();
    const mockService = {
      registrarPagamentoCompleto: jest.fn().mockRejectedValue(new ValidationError("erro")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.registrarPagamentoCompleto.bind(controller),
      makeAuthenticatedReq({ body: { pagamento_id: VALID_UUID, forma_pagamento: "PIX" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 404 quando pagamento não encontrado ao registrar", async () => {
    const controller = new PagamentoController();
    const mockService = {
      registrarPagamentoCompleto: jest.fn().mockRejectedValue(new NotFoundError("Pagamento")),
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await dispatch(
      controller.registrarPagamentoCompleto.bind(controller),
      makeAuthenticatedReq({ body: { pagamento_id: VALID_UUID, forma_pagamento: "PIX" } }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
