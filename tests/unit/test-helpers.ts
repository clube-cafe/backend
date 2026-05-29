import { Request, Response } from "express";
import { errorHandler } from "../../src/middlewares/errorHandler";

export const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
export const VALID_UUID_2 = "223e4567-e89b-12d3-a456-426614174000";

/**
 * Simula o dispatch do Express: chama o handler e, se ele lançar,
 * passa o erro para o errorHandler centralizado (que escreve em res).
 * Permite que testes unitários verifiquem o status/json final como antes.
 */
export const dispatch = async (
  handler: (req: Request, res: Response) => unknown,
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await handler(req, res);
  } catch (err) {
    errorHandler(err as Error, req, res, jest.fn());
  }
};

export const makeRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock; send: jest.Mock };
};

export const makeReq = (data: Partial<Request>) => {
  const req = {
    ...data,
    query: data.query || {},
    user: data.user || undefined,
  } as Request;
  return req;
};

export const makeAuthenticatedReq = (data: Partial<Request>, userId: string = VALID_UUID) => {
  return makeReq({
    ...data,
    user: { id: userId, email: "test@test.com", tipo_user: "ASSINANTE" },
  });
};

export const makeAdminReq = (data: Partial<Request>, userId: string = VALID_UUID) => {
  return makeReq({
    ...data,
    user: { id: userId, email: "admin@test.com", tipo_user: "ADMIN" },
  });
};

