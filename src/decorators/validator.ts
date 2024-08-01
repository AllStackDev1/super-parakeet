/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodEffects, ZodError, ZodIssue, ZodObject } from 'zod';
import httpStatus from 'http-status';
import { AppError } from 'utils';

type ZodSchema = ZodObject<any> | ZodEffects<ZodObject<any>>;

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

const errorMessageBuilder = (issue: ZodIssue) => {
  let str = '';
  if (issue.message.toLowerCase().includes('invalid')) {
    str = `${issue.path.join('.')} contains ${issue.message?.toLowerCase()}`;
  }

  if (issue.message.toLowerCase().includes('required')) {
    str = `${issue.path.join('.')} is ${issue.message?.toLowerCase()}`;
  }

  return str;
};

export function Validator({ body, query, params }: SchemaPayload) {
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
          const errorMessages = error.errors.map(errorMessageBuilder);
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
