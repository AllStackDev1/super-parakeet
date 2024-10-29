export class AppError extends Error {
  public status: string;
  public IsOperational: boolean;
  constructor(
    public message: string,
    public statusCode: number,
    public errors?:
      | (string | Record<string, string | number | (string | number)[]>)[]
      | null,
    public code?: number | string,
  ) {
    super(message);
    this.code = code;
    this.errors = errors;
    this.statusCode = statusCode;
    this.status = ('' + statusCode).startsWith('4') ? 'failed' : 'error';
    this.IsOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
