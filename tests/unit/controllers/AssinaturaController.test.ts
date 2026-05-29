import { AssinaturaController } from "../../../src/controllers/AssinaturaController";
import { Request, Response } from "express";
import { dispatch, VALID_UUID, VALID_UUID_2 } from "../test-helpers";
import { NotFoundError, ValidationError } from "../../../src/utils/Errors";

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

describe("AssinaturaController", () => {
  it("deve criar uma assinatura com pagamento e retornar 201", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      createAssinatura: jest.fn().mockResolvedValue({
        assinatura: { id: "1", user_id: VALID_UUID, plano_id: VALID_UUID_2, status: "PENDENTE" },
        pagamento: {
          id: "pp1",
          valor: 50,
          data_vencimento: "2024-03-01",
          descricao: "Ativação de assinatura - Plano Teste",
          status: "PENDENTE",
        },
      }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      body: { user_id: VALID_UUID, plano_id: VALID_UUID_2 },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.createAssinatura.bind(controller), req, res);

    expect(mockService.createAssinatura).toHaveBeenCalledWith(VALID_UUID, VALID_UUID_2);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 404 quando assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new NotFoundError("Assinatura")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.getAssinaturaById.bind(controller), req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: "Assinatura não encontrado(a)" })
    );
  });

  it("deve listar todas as assinaturas (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAllAssinaturas: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ query: {} });
    const res = makeRes();

    await dispatch(controller.getAllAssinaturas.bind(controller), req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: "a1" }]);
  });

  it("deve retornar 500 ao listar assinaturas (erro inesperado)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAllAssinaturas: jest.fn().mockRejectedValue(new Error("falha")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({ query: {} });
    const res = makeRes();

    await dispatch(controller.getAllAssinaturas.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("deve obter assinatura por id (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockResolvedValue({ id: VALID_UUID, user_id: VALID_UUID }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.getAssinaturaById.bind(controller), req, res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, user_id: VALID_UUID });
  });

  it("deve retornar 400 em getById com ValidationError do serviço", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new ValidationError("erro genérico")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.getAssinaturaById.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: "erro genérico" })
    );
  });

  it("deve listar assinaturas por usuário (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturasByUserId: jest.fn().mockResolvedValue([{ id: "a1" }]),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { userId: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.getAssinaturasByUserId.bind(controller), req, res);
    expect(res.json).toHaveBeenCalledWith([{ id: "a1" }]);
  });

  it("deve retornar 400 em assinaturas por usuário com ValidationError", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturasByUserId: jest.fn().mockRejectedValue(new ValidationError("erro user")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { userId: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.getAssinaturasByUserId.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(400);
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
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.updateAssinatura.bind(controller), req, res);
    expect(res.json).toHaveBeenCalledWith({ id: VALID_UUID, plano_id: VALID_UUID_2 });
  });

  it("deve retornar 404 ao atualizar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new NotFoundError("Assinatura")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { id: VALID_UUID },
      body: {},
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.updateAssinatura.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(404);
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
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.deleteAssinatura.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 404 ao deletar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      getAssinaturaById: jest.fn().mockRejectedValue(new NotFoundError("Assinatura")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { id: VALID_UUID },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.deleteAssinatura.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deve cancelar assinatura (200)", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      cancelarAssinatura: jest.fn().mockResolvedValue({ cancelada: true }),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { assinatura_id: VALID_UUID },
      body: { motivo: "teste" },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.cancelarAssinatura.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ cancelada: true });
  });

  it("deve retornar 404 ao cancelar assinatura não encontrada", async () => {
    const controller = new AssinaturaController();
    const mockService = {
      cancelarAssinatura: jest.fn().mockRejectedValue(new NotFoundError("Assinatura")),
    } as any;
    (controller as any).assinaturaService = mockService;

    const req = makeReq({
      params: { assinatura_id: VALID_UUID },
      body: { motivo: "teste" },
      user: { id: VALID_UUID, email: "test@test.com" },
    });
    const res = makeRes();

    await dispatch(controller.cancelarAssinatura.bind(controller), req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
