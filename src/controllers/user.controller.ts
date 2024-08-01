import { OK } from 'http-status';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';

import { TYPES } from 'di/types';
import { IUserService } from 'services';
import { Route, Controller, Validator } from 'decorators';
import { miscSchema, UpdateSchema, QuerySchema } from 'validators';

@Controller('/users')
@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService)
    private service: IUserService,
  ) {}

  @Route('get')
  async getAll(_: Request, res: Response) {
    return res.status(OK).json(await this.service.getAllUsers());
  }

  @Route('get', '/:id')
  @Validator({ params: miscSchema('id') })
  async getById(req: Request, res: Response) {
    return res.status(OK).json(await this.service.getUserById(req.params.id));
  }

  @Route('get', '/search')
  @Validator({ query: QuerySchema })
  async query(req: Request, res: Response) {
    return res
      .status(OK)
      .json(await this.service.getUsersBasedOnQuery(req.query));
  }

  @Route('patch')
  @Validator({ body: UpdateSchema, params: miscSchema('id') })
  async update(req: Request, res: Response) {
    return res.status(OK).json({
      message: 'User details updated successfully',
      data: await this.service.updateUser(req.params.id, req.body),
    });
  }

  @Route('delete', '/:id')
  @Validator({ params: miscSchema('id') })
  async delete(req: Request, res: Response) {
    await this.service.softDeleteUserById(req.params.id);
    return res.status(OK).json({
      message:
        'Account deleted succesfully. Account will be parmantly deleted in 30day',
    });
  }
}
