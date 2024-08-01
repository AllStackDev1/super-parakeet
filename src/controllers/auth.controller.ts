import { CREATED, OK } from 'http-status';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from 'di/types';
import { IAuthService } from 'services';
import {
  LoginSchema,
  EmailSchema,
  SignupSchema,
  ResetPasswordSchema,
} from 'validators';
import { Route, Validator, Controller } from 'decorators';

@Controller('/auth')
@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private service: IAuthService,
  ) {}

  @Route('post', '/signup')
  @Validator({ body: SignupSchema })
  async signup(req: Request, res: Response) {
    return res.status(CREATED).json({
      user: await this.service.register(req.body),
      message: 'User created successfully',
    });
  }

  @Route('post', '/login')
  @Validator({ body: LoginSchema })
  async login(req: Request, res: Response) {
    return res.status(OK).json(await this.service.authenticate(req.body));
  }

  @Route('post', '/request-password-reset')
  @Validator({ body: EmailSchema })
  async requestPasswordReset(req: Request, res: Response) {
    return res
      .status(OK)
      .json(await this.service.sendPasswordResetEmail(req.body));
  }

  @Route('post', '/password-reset')
  @Validator({ body: ResetPasswordSchema })
  async passwordReset(req: Request, res: Response) {
    return res.status(OK).json(await this.service.resetPassword(req.body));
  }
}
