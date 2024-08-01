import z from 'zod';

import { isEmpty } from 'utils/helper';

export const SignupSchema = z.object({
  lastName: z.string(),
  firstName: z.string(),
  email: z.string().email(),
  userType: z.enum(['0', '1', '2']),
  password: z
    .string()
    .min(6)
    .regex(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      ),
    ),
});

export type SignupSchema = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  lastName: z.string(),
  firstName: z.string(),
  email: z.string().email(),
  userType: z.enum(['0', '1', '2']),
  password: z
    .string()
    .min(6)
    .regex(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      ),
    ),
});

export type LoginSchema = z.infer<typeof LoginSchema>;

export const EmailSchema = z.object({
  email: z.string().email(),
});

export type EmailSchema = z.infer<typeof EmailSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(6)
    .regex(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      ),
    ),
});

export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;

export const QuerySchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  email: z.string().email().optional(),
  userType: z.enum(['0', '1', '2']).optional(),
});

export type QuerySchema = z.infer<typeof QuerySchema>;

export const UpdateSchema = z
  .object({
    lastName: z.string().optional(),
    firstName: z.string().optional(),
    userType: z.enum(['0', '1', '2']).optional(),
    dateOfBirth: z.date().optional(),
  })
  .partial()
  .refine((data) => isEmpty(data), {
    message: 'One of the fields must be defined',
  });

export type UpdateSchema = z.infer<typeof UpdateSchema>;
