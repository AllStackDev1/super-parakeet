/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from 'utils';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { ZodEffects, ZodError, ZodIssue, ZodObject } from 'zod';

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

const errorMessageBuilder = (
  issue: ZodIssue,
): string | Record<string, string | number | (string | number)[]> => {
  const message = issue.message.toLowerCase();

  if (message.includes('one of')) {
    return { message: issue.message, path: issue.path };
  }

  if (message.includes('invalid')) {
    return `${issue.path} contains ${message}`;
  }

  if (message.includes('required')) {
    return `${issue.path} is ${message}`;
  }

  return '';
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
