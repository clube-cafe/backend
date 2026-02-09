import { AssinaturaController } from "../../../src/controllers/AssinaturaController";
import { Request, Response } from "express";
import { createAppError } from "../test-helpers";

describe("AssinaturaController", () => {
  const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
  const VALID_UUID_2 = "223e4567-e89b-12d3-a456-426614174000";

  const makeRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  };

  const makeReq = (data: Partial<Request>) => {
    const req = {
      ...data,
      query: data.query || {},
      user: data.user || undefined,
    } as Request;
    return req;
  };

  it("deve criar uma assinatura com pagamento pendente e retornar 201", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      createAssinatura: jest.fn().mockResolvedValue({
        assinatura: {
          id: "1",
          user_id: VALID_UUID,
          plano_id: VALID_UUID_2,
          status: "PENDENTE",
        },
        pagamentoPendente: {
          id: "pp1",
          valor: 50,
          descricao: "Ativação de assinatura - Plano Teste",
        },
      }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      body: {
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        plano_id: VALID_UUID_2,
      },
      user: { id: "123e4567-e89b-12d3-a456-426614174000", username: "test" },
    });
    const res = makeRes();

    await controller.createAssinatura(req, res);

    expect(mockService.createAssinatura).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      VALID_UUID_2
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      assinatura: {
        id: "1",
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        plano_id: VALID_UUID_2,
        status: "PENDENTE",
      },
      pagamentoPendente: {
        id: "pp1",
        valor: 50,
        descricao: "Ativação de assinatura - Plano Teste",
      },
    });
  });

  it("deve retornar 404 quando assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: "123e4567-e89b-12d3-a456-426614174000" },
      user: { id: "123e4567-e89b-12d3-a456-426614174000", username: "test" },
    });
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

    const req = makeReq({ query: {} });
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

    const req = makeReq({ query: {} });
    const res = makeRes();

    await controller.getAllAssinaturas(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Erro ao obter assinaturas", error: "falha" });
  });

  it("deve obter assinatura por id (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.getAssinaturaById(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, user_id: VALID_UUID });
  });

  it("deve retornar 400 quando erro genérico em getById", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("erro genérico")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
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

    const req = makeReq({ 
      params: { user_id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
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

    const req = makeReq({ 
      params: { user_id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.getAssinaturasByUserId(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "erro user" });
  });

  it("deve atualizar assinatura (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      updateAssinatura: jest.fn().mockResolvedValue({ id: VALID_UUID, plano_id: VALID_UUID_2 }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID }, 
      body: { plano_id: VALID_UUID_2 },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.updateAssinatura(req, res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, plano_id: VALID_UUID_2 });
  });

  it("deve retornar 404 ao atualizar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID }, 
      body: {},
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.updateAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });

  it("deve deletar assinatura (204)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      deleteAssinatura: jest.fn().mockResolvedValue(true),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.deleteAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new Error("Assinatura não encontrada")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.deleteAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrada" });
  });

  it("deve cancelar assinatura (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
      cancelarAssinatura: jest.fn().mockResolvedValue({ cancelada: true }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { assinatura_id: VALID_UUID }, 
      body: { motivo: "teste" },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.cancelarAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ cancelada: true });
  });

  it("deve retornar 404 ao cancelar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      cancelarAssinatura: jest.fn().mockRejectedValue(createAppError(404, "Assinatura não encontrado(a)")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ 
      params: { assinatura_id: VALID_UUID }, 
      body: { motivo: "teste" },
      user: { id: VALID_UUID, username: "test" },
    });
    const res = makeRes();

    await controller.cancelarAssinatura(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Assinatura não encontrado(a)" });
  });
});
