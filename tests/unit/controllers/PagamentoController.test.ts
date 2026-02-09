import { PagamentoController } from "../../../src/controllers/PagamentoController";
import { Request, Response } from "express";
import { VALID_UUID, makeRes, makeReq, makeAuthenticatedReq, makeAdminReq } from "../test-helpers";

describe("PagamentoController", () => {

  it("deve criar um pagamento e retornar 201", async () => {
    const controller = new PagamentoController();
    const mockService = {
      createPagamento: jest
        .fn()
        .mockResolvedValue({ id: "p1", user_id: "123e4567-e89b-12d3-a456-426614174000", valor: 50, forma_pagamento: "PIX" }),
    } as any;
    (controller as any).pagamentoService = mockService;

    const req = makeAuthenticatedReq({
      body: {
        user_id: VALID_UUID,
        valor: 50,
        data_pagamento: "2024-02-01",
        forma_pagamento: "PIX",
        observacao: "obs",
      },
    });
    const res = makeRes();

    await controller.createPagamento(req, res);

    expect(mockService.createPagamento).toHaveBeenCalledWith(
      VALID_UUID,
      50,
      new Date("2024-02-01"),
      "PIX",
      "obs"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "p1", user_id: "123e4567-e89b-12d3-a456-426614174000", valor: 50, forma_pagamento: "PIX" });
  });

  it("deve retornar 400 quando forma de pagamento é inválida", async () => {
    const controller = new PagamentoController();
    const mockService = {
      getPagamentosByForma: jest.fn().mockRejectedValue(new Error("Forma inválida")),
    } as any;
    (controller as any).pagamentoService = mockService;

    const req = makeReq({ params: { forma_pagamento: "INVALIDA" } });
    const res = makeRes();

    await controller.getPagamentosByForma(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Forma inválida" });
  });

  it("deve listar todos os pagamentos (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getAllPagamentos: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getAllPagamentos(makeAdminReq({ query: {} }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 500 ao listar pagamentos (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { getAllPagamentos: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getAllPagamentos(makeAdminReq({ query: {} }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter pagamentos", error: "falha" });
  });

  it("deve obter pagamento por id (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }) 
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentoById(makeAuthenticatedReq({ params: { id: VALID_UUID } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, user_id: VALID_UUID });
  });

  it("deve retornar 404 quando pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentoById: jest.fn().mockRejectedValue(new Error("Pagamento não encontrado")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentoById(makeAuthenticatedReq({ params: { id: VALID_UUID } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento não encontrado" });
  });

  it("deve listar pagamentos por usuário (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByUserId: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentosByUserId(makeAuthenticatedReq({ params: { user_id: VALID_UUID } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 400 em pagamentos por usuário (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByUserId: jest.fn().mockRejectedValue(new Error("erro user")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentosByUserId(makeAuthenticatedReq({ params: { user_id: VALID_UUID } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro user" });
  });

  it("deve retornar pagamentos por forma (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByForma: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentosByForma(makeReq({ params: { forma_pagamento: "PIX" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar pagamentos por período (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByDateRange: jest.fn().mockResolvedValue([{ id: "p1" }]) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentosByDateRange(makeReq({ query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "p1" }]);
  });

  it("deve retornar 400 em pagamentos por período (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { getPagamentosByDateRange: jest.fn().mockRejectedValue(new Error("erro periodo")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getPagamentosByDateRange(makeReq({ 
      query: { data_inicio: "x", data_fim: "y" } 
    }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Datas inválidas" });
  });

  it("deve atualizar pagamento (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      updatePagamento: jest.fn().mockResolvedValue({ id: VALID_UUID, valor: 60 }) 
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.updatePagamento(makeAuthenticatedReq({ params: { id: VALID_UUID }, body: { valor: 60 } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, valor: 60 });
  });

  it("deve retornar 404 ao atualizar pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      getPagamentoById: jest.fn().mockRejectedValue(new Error("Pagamento não encontrado"))
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.updatePagamento(makeAuthenticatedReq({ params: { id: VALID_UUID }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento não encontrado" });
  });

  it("deve deletar pagamento (204)", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      getPagamentoById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      deletePagamento: jest.fn().mockResolvedValue(true) 
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.deletePagamento(makeAuthenticatedReq({ params: { id: VALID_UUID } }), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar pagamento não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      getPagamentoById: jest.fn().mockRejectedValue(new Error("Pagamento não encontrado"))
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.deletePagamento(makeAuthenticatedReq({ params: { id: VALID_UUID } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento não encontrado" });
  });

  it("deve retornar total de pagamentos (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentos: jest.fn().mockResolvedValue(100) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentos(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 100 });
  });

  it("deve retornar 500 ao calcular total (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentos: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentos(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao calcular total", error: "falha" });
  });

  it("deve retornar total por usuário (200)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentosByUser: jest.fn().mockResolvedValue(40) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosByUser(makeAuthenticatedReq({ params: { user_id: VALID_UUID } }), res);
    expect(res.json).toHaveBeenCalledWith({ total: 40 });
  });

  it("deve retornar 400 em total por usuário (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { getTotalPagamentosByUser: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosByUser(makeAuthenticatedReq({ params: { user_id: VALID_UUID } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve registrar pagamento completo (201)", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      registrarPagamentoCompleto: jest.fn().mockResolvedValue({ 
        pagamento: { id: "p1", valor: 50 }, 
        assinaturaAtivada: true 
      }) 
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.registrarPagamentoCompleto(
      makeAuthenticatedReq({
        body: {
          pagamento_pendente_id: VALID_UUID,
          forma_pagamento: "PIX",
          observacao: "obs",
        },
      }),
      res
    );
    expect(mockService.registrarPagamentoCompleto).toHaveBeenCalledWith(
      VALID_UUID,
      "PIX",
      "obs"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ 
      message: "Pagamento registrado com sucesso", 
      pagamento: { id: "p1", valor: 50 }, 
      assinaturaAtivada: true 
    });
  });

  it("deve retornar 400 em registrar pagamento completo (erro)", async () => {
    const controller = new PagamentoController();
    const mockService = { registrarPagamentoCompleto: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.registrarPagamentoCompleto(makeAuthenticatedReq({ body: { pagamento_pendente_id: VALID_UUID, forma_pagamento: "PIX" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve retornar 404 quando pagamento pendente não encontrado", async () => {
    const controller = new PagamentoController();
    const mockService = { 
      registrarPagamentoCompleto: jest.fn().mockRejectedValue(new Error("Pagamento pendente não encontrado")) 
    } as any;
    (controller as any).pagamentoService = mockService;
    const res = makeRes();
    await controller.registrarPagamentoCompleto(
      makeAuthenticatedReq({ body: { pagamento_pendente_id: VALID_UUID, forma_pagamento: "PIX" } }), 
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento pendente não encontrado" });
  });
});
