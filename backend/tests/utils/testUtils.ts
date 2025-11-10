import { Request, Response } from "express";
import { RolUsuario } from "@prisma/client";

export type MockRequestParams = {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: {
    id: number;
    email: string;
    rol: RolUsuario;
  };
};

export type MockResponseParams = {
  statusCode?: number;
  json?: any;
};

export const createMockRequest = ({
  body = {},
  params = {},
  query = {},
  headers = {},
  user = undefined,
}: MockRequestParams = {}): Request => {
  const req = {
    body,
    params,
    query,
    headers,
    user,
    get: jest.fn(),
    header: jest.fn(),
  } as unknown as Request;

  return req;
};

export const createMockResponse = (): Response & {
  statusCode?: number;
  jsonData?: any;
} => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockImplementation((data) => {
    res.jsonData = data;
    return res;
  });

  return res;
};
