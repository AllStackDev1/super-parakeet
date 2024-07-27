import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from 'di/types';
import { IAuthService } from 'services';
import { Route, Validate, Controller } from 'decorators';
import { createUser } from 'validators';

@Controller('/auth')
@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService)
    private auth: IAuthService,
  ) {}

  @Route('post', '/signup')
  @Validate({ body: createUser })
  async signup(req: Request, res: Response) {
    await this.auth.register(req.body);
    return res.status(201).json({
      status: true,
      message: 'User created successfully',
    });
  }
}
