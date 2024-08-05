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
import { cookiesConfig, isProd } from 'configs/env.config';

@Controller('/auth')
@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private service: IAuthService,
  ) {}

  @Route('post', '/signup')
  @Validator({ body: SignupSchema })
  async signup(req: Request<[], [], SignupSchema>, res: Response) {
    return res.status(CREATED).json({
      user: await this.service.register(req.body),
      message: 'User created successfully',
    });
  }

  @Route('post', '/login')
  @Validator({ body: LoginSchema })
  async login(req: Request<[], [], LoginSchema>, res: Response) {
    const result = await this.service.authenticate(req.body);
    if (result) {
      // set session
      req.session.user = result.user;
      req.session.authorized = true;
      return res
        .cookie('auth_token', result.token, {
          httpOnly: true,
          maxAge: +cookiesConfig.maxAge,
          secure: isProd,
        })
        .status(OK)
        .json({ ...result.user, token: result.token });
    }
  }

  @Route('post', '/logout')
  async logout(req: Request, res: Response) {
    return req.session.destroy(function () {
      // Clear the session cookie
      return res
        .clearCookie('auth_token')
        .status(OK)
        .json({ message: 'Successfully logged out 😏 🍀' });
    });
  }

  @Route('post', '/request-password-reset')
  @Validator({ body: EmailSchema })
  async requestPasswordReset(req: Request<[], [], EmailSchema>, res: Response) {
    return res
      .status(OK)
      .json(await this.service.sendPasswordResetEmail(req.body));
  }

  @Route('post', '/password-reset')
  @Validator({ body: ResetPasswordSchema })
  async passwordReset(
    req: Request<[], [], ResetPasswordSchema>,
    res: Response,
  ) {
    return res.status(OK).json(await this.service.resetPassword(req.body));
  }
}
