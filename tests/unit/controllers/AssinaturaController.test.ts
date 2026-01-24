import { AssinaturaController } from "../../../src/controllers/AssinaturaController";
import { Request, Response } from "express";

describe("AssinaturaController", () => {
  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => data as Request;

  it("deve criar uma assinatura e retornar 201", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      createAssinatura: jest.fn().mockResolvedValue({ id: "1", user_id: "u", valor: 10 }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      body: { user_id: "u", valor: 10, periodicidade: "MENSAL", data_inicio: "2024-01-01" },
    });
    const res = makeRes();

    await controller.createAssinatura(req, res);

    expect(mockService.createAssinatura).toHaveBeenCalledWith(
      "u",
      10,
      "MENSAL",
      new Date("2024-01-01")
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1", user_id: "u", valor: 10 });
  });

  it("deve retornar 404 quando assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "missing" } });
    const res = makeRes();

    await controller.getAssinaturaById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });

  it("deve listar todas as assinaturas (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAllAssinaturas: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({});
    const res = makeRes();

    await controller.getAllAssinaturas(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: "a1" }]);
  });

  it("deve retornar 500 ao listar assinaturas (erro)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAllAssinaturas: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({});
    const res = makeRes();

    await controller.getAllAssinaturas(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter assinaturas", error: "falha" });
  });

  it("deve obter assinatura por id (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: "a1" }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "a1" } });
    const res = makeRes();

    await controller.getAssinaturaById(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: "a1" });
  });

  it("deve retornar 400 quando erro genérico em getById", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("erro genérico")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "a1" } });
    const res = makeRes();

    await controller.getAssinaturaById(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro genérico" });
  });

  it("deve listar assinaturas por usuário (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturasByUserId: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { user_id: "u1" } });
    const res = makeRes();

    await controller.getAssinaturasByUserId(req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: "a1" }]);
  });

  it("deve retornar 400 em assinaturas por usuário (erro)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturasByUserId: jest.fn().mockRejectedValue(new Error("erro user")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { user_id: "u1" } });
    const res = makeRes();

    await controller.getAssinaturasByUserId(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro user" });
  });

  it("deve atualizar assinatura (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      updateAssinatura: jest.fn().mockResolvedValue({ id: "a1", valor: 20 }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "a1" }, body: { valor: 20, periodicidade: "MENSAL" } });
    const res = makeRes();

    await controller.updateAssinatura(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: "a1", valor: 20 });
  });

  it("deve retornar 404 ao atualizar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      updateAssinatura: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "missing" }, body: {} });
    const res = makeRes();

    await controller.updateAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });

  it("deve deletar assinatura (204)", async () => {
    const controller = new AssinaturaController();
    const mockService = { deleteAssinatura: jest.fn().mockResolvedValue(true) } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "a1" } });
    const res = makeRes();

    await controller.deleteAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      deleteAssinatura: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { id: "missing" } });
    const res = makeRes();

    await controller.deleteAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });

  it("deve criar assinatura com pendências (201)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      createAssinaturaComPendencias: jest.fn().mockResolvedValue({ assinatura_id: "a1" }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      body: {
        user_id: "u",
        valor: 10,
        periodicidade: "MENSAL",
        data_inicio: "2024-01-01",
        dia_vencimento: 10,
      },
    });
    const res = makeRes();

    await controller.createAssinaturaComPendencias(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Assinatura criada com sucesso!",
      assinatura_id: "a1",
    });
  });

  it("deve retornar 400 em criação com pendências (erro)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      createAssinaturaComPendencias: jest.fn().mockRejectedValue(new Error("erro")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ body: {} });
    const res = makeRes();

    await controller.createAssinaturaComPendencias(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro" });
  });

  it("deve cancelar assinatura (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      cancelarAssinatura: jest.fn().mockResolvedValue({ cancelada: true }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { assinatura_id: "a1" }, body: { motivo: "teste" } });
    const res = makeRes();

    await controller.cancelarAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ cancelada: true });
  });

  it("deve retornar 404 ao cancelar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      cancelarAssinatura: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ params: { assinatura_id: "missing" }, body: { motivo: "teste" } });
    const res = makeRes();

    await controller.cancelarAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });
});
