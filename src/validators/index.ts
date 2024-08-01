import z from 'zod';

export * from './user.zod.schema';

export const miscSchema = (name: string) => {
  return z.object({ [name]: z.string() });
};
