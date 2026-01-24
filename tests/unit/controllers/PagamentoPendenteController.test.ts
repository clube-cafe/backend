import { PagamentoPendenteController } from "../../../src/controllers/PagamentoPendenteController";
import { Request, Response } from "express";

describe("PagamentoPendenteController", () => {
  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => data as Request;

  it("deve criar um pagamento pendente e retornar 201", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = {
      createPagamentoPendente: jest
        .fn()
        .mockResolvedValue({ id: "pp1", user_id: "u", valor: 80, status: "PENDENTE" }),
    } as any;
    (controller as any).pagamentoPendenteService = mockService;

    const req = makeReq({
      body: {
        user_id: "u",
        valor: 80,
        data_vencimento: "2024-03-01",
        descricao: "mensalidade",
        status: "PENDENTE",
      },
    });
    const res = makeRes();

    await controller.createPagamentoPendente(req, res);

    expect(mockService.createPagamentoPendente).toHaveBeenCalledWith(
      "u",
      80,
      new Date("2024-03-01"),
      "mensalidade",
      "PENDENTE"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "pp1", user_id: "u", valor: 80, status: "PENDENTE" });
  });

  it("deve retornar 404 quando pagamento pendente não encontrado", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = {
      getPagamentoPendenteById: jest.fn().mockRejectedValue(new Error("Pagamento pendente não encontrado")),
    } as any;
    (controller as any).pagamentoPendenteService = mockService;

    const req = makeReq({ params: { id: "missing" } });
    const res = makeRes();

    await controller.getPagamentoPendenteById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento pendente não encontrado" });
  });

  it("deve listar todos os pagamentos pendentes (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getAllPagamentosPendentes: jest.fn().mockResolvedValue([{ id: "pp1" }]) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getAllPagamentosPendentes(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "pp1" }]);
  });

  it("deve retornar 500 ao listar pendentes (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getAllPagamentosPendentes: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getAllPagamentosPendentes(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter pagamentos pendentes", error: "falha" });
  });

  it("deve obter pendente por id (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentoPendenteById: jest.fn().mockResolvedValue({ id: "pp1" }) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentoPendenteById(makeReq({ params: { id: "pp1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: "pp1" });
  });

  it("deve listar por usuário (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByUserId: jest.fn().mockResolvedValue([{ id: "pp1" }]) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByUserId(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "pp1" }]);
  });

  it("deve retornar 400 em listar por usuário (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByUserId: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByUserId(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve listar por status (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByStatus: jest.fn().mockResolvedValue([{ id: "pp1" }]) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByStatus(makeReq({ params: { status: "PENDENTE" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "pp1" }]);
  });

  it("deve retornar 400 em listar por status (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByStatus: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByStatus(makeReq({ params: { status: "P" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve obter pendentes vencidos (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesVencidos: jest.fn().mockResolvedValue([{ id: "pp1" }]) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesVencidos(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "pp1" }]);
  });

  it("deve retornar 500 em vencidos (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesVencidos: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesVencidos(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter pagamentos vencidos", error: "falha" });
  });

  it("deve listar por período (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByPeriodo: jest.fn().mockResolvedValue([{ id: "pp1" }]) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByPeriodo(makeReq({ query: { data_inicio: "2024-01-01", data_fim: "2024-02-01" } }), res);
    expect(res.json).toHaveBeenCalledWith([{ id: "pp1" }]);
  });

  it("deve retornar 400 em período (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getPagamentosPendentesByPeriodo: jest.fn().mockRejectedValue(new Error("erro periodo")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getPagamentosPendentesByPeriodo(makeReq({ query: { data_inicio: "x", data_fim: "y" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro periodo" });
  });

  it("deve atualizar pagamento pendente (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { updatePagamentoPendente: jest.fn().mockResolvedValue({ id: "pp1", valor: 90 }) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.updatePagamentoPendente(makeReq({ params: { id: "pp1" }, body: { valor: 90 } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: "pp1", valor: 90 });
  });

  it("deve retornar 404 ao atualizar pendente não encontrado", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { updatePagamentoPendente: jest.fn().mockRejectedValue(new Error("Pagamento pendente não encontrado")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.updatePagamentoPendente(makeReq({ params: { id: "missing" }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento pendente não encontrado" });
  });

  it("deve atualizar status (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { updateStatusPagamentoPendente: jest.fn().mockResolvedValue({ id: "pp1", status: "PAGO" }) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.updateStatusPagamentoPendente(makeReq({ params: { id: "pp1" }, body: { status: "PAGO" } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: "pp1", status: "PAGO" });
  });

  it("deve retornar 404 ao atualizar status pendente não encontrado", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { updateStatusPagamentoPendente: jest.fn().mockRejectedValue(new Error("Pagamento pendente não encontrado")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.updateStatusPagamentoPendente(makeReq({ params: { id: "missing" }, body: { status: "PAGO" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento pendente não encontrado" });
  });

  it("deve deletar pagamento pendente (204)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { deletePagamentoPendente: jest.fn().mockResolvedValue(true) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.deletePagamentoPendente(makeReq({ params: { id: "pp1" } }), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar pendente não encontrado", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { deletePagamentoPendente: jest.fn().mockRejectedValue(new Error("Pagamento pendente não encontrado")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.deletePagamentoPendente(makeReq({ params: { id: "missing" } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pagamento pendente não encontrado" });
  });

  it("deve retornar total pendentes (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getTotalPagamentosPendentes: jest.fn().mockResolvedValue(50) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosPendentes(makeReq({}), res);
    expect(res.json).toHaveBeenCalledWith({ total: 50 });
  });

  it("deve retornar 500 em total (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getTotalPagamentosPendentes: jest.fn().mockRejectedValue(new Error("falha")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosPendentes(makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao calcular total", error: "falha" });
  });

  it("deve retornar total por usuário (200)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getTotalPagamentosPendentesByUser: jest.fn().mockResolvedValue(20) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosPendentesByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.json).toHaveBeenCalledWith({ total: 20 });
  });

  it("deve retornar 400 em total por usuário (erro)", async () => {
    const controller = new PagamentoPendenteController();
    const mockService = { getTotalPagamentosPendentesByUser: jest.fn().mockRejectedValue(new Error("erro")) } as any;
    (controller as any).pagamentoPendenteService = mockService;
    const res = makeRes();
    await controller.getTotalPagamentosPendentesByUser(makeReq({ params: { user_id: "u1" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });
});
