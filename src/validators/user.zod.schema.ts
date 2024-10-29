import z from 'zod';

import { isEmpty } from 'utils/helper';

export const SignupSchema = z.object({
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  email: z.string().email(),
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
  email: z.string().email(),
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

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenSchema = z.infer<typeof RefreshTokenSchema>;

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

export const UserQuerySchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  email: z.string().email().optional(),
});

export type UserQuerySchema = z.infer<typeof UserQuerySchema>;

export const UserUpdateSchema = z
  .object({
    lastName: z.string().optional(),
    firstName: z.string().optional(),
    dateOfBirth: z.date().optional(),
  })
  .partial()
  .refine((data) => !isEmpty(data), {
    message: 'One of the fields must be defined',
    path: ['firstName', 'lastName', 'dateOfBirth'],
  });

export type UserUpdateSchema = z.infer<typeof UserUpdateSchema>;
