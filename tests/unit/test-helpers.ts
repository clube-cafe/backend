import { Request, Response } from "express";

export const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
export const VALID_UUID_2 = "223e4567-e89b-12d3-a456-426614174000";

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
    user: { id: userId, username: "test" },
  });
};
