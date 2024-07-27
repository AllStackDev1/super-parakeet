/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';
import httpStatus from 'http-status';
import { AppError } from 'utils';

type ZodSchema = ZodObject<any>;

interface BaseSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}
interface BodyOk extends BaseSchema {
  body: ZodSchema;
}

interface QueryOk extends BaseSchema {
  query: ZodSchema;
}

interface ParamsOk extends BaseSchema {
  params: ZodSchema;
}

type SchemaPayload = BodyOk | QueryOk | ParamsOk;

export function Validate({ body, query, params }: SchemaPayload) {
  return function (_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        if (body) {
          body.parse(req.body);
        }
        if (query) {
          query.parse(req.query);
        }
        if (params) {
          params.parse(req.params);
        }
        return originalMethod.call(this, req, res, next);
      } catch (error: any) {
        if (error instanceof ZodError) {
          const errorMessages = error.errors.map(
            (issue: any) =>
              `${issue.path.join('.')} is ${issue.message?.toLowerCase()}`,
          );
          throw new AppError(
            'Invalid payload',
            httpStatus.BAD_REQUEST,
            errorMessages,
          );
        } else {
          throw new AppError(
            'Internal Server Error',
            httpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    };

    return descriptor;
  };
}
