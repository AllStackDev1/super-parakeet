export class AppError extends Error {
  public status: string;
  public IsOperational: boolean;
  constructor(
    public message: string,
    public statusCode: number,
    public errors?: string[],
    public code?: number,
  ) {
    super(message);
    this.code = code;
    this.errors = errors;
    this.statusCode = statusCode;
    this.status = ('' + statusCode).startsWith('4') ? 'fail' : 'error';
    this.IsOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
