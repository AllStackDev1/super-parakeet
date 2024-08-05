import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { ACCEPTED, NO_CONTENT, OK } from 'http-status';

import {
  QuerySchema,
  ParamsWithId,
  UpdateSchema,
  DeleteTypeSchema,
} from 'validators';
import { TYPES } from 'di/types';
import { auth } from 'middlewares';
import { IUserService } from 'services';
import { Route, Controller, Validator } from 'decorators';

@Controller('/users')
@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService)
    private service: IUserService,
  ) {}

  @Route('get', '', auth)
  async getAll(_: Request, res: Response) {
    return res.status(OK).json(await this.service.getAllUsers());
  }

  @Route('get', '/search', auth)
  @Validator({ query: QuerySchema })
  async query(req: Request<[], [], [], QuerySchema>, res: Response) {
    return res.status(OK).json(await this.service.getUsersByQuery(req.query));
  }

  @Route('get', '/:id', auth)
  @Validator({ params: ParamsWithId })
  async getById(req: Request<ParamsWithId>, res: Response) {
    return res.status(OK).json(await this.service.getUserById(req.params.id));
  }

  @Route('patch', '/:id', auth)
  @Validator({ body: UpdateSchema, params: ParamsWithId })
  async update(req: Request<ParamsWithId, [], UpdateSchema>, res: Response) {
    return res.status(OK).json({
      message: 'User details updated successfully',
      data: await this.service.update(req.params.id, req.body),
    });
  }

  @Route('delete', '/:id', auth)
  @Validator({ params: ParamsWithId, body: DeleteTypeSchema })
  async delete(
    req: Request<ParamsWithId, [], DeleteTypeSchema>,
    res: Response,
  ) {
    if (req.body.type === 'soft') {
      await this.service.softDeleteById(req.params.id);
      return res.status(ACCEPTED).json({
        message: 'Account will be parmantly deleted in 30day',
      });
    } else {
      await this.service.forceDeleteById(req.params.id);
      return res.status(NO_CONTENT).json({
        message: 'Account deleted succesfully.',
      });
    }
  }
}
