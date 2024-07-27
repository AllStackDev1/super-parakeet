import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';

import { Route, Controller } from 'decorators';
import { UserRepository } from 'repositories';
import { TYPES } from 'di/types';

@Controller('/users')
@injectable()
export class UserController {
  private _repo: UserRepository;
  constructor(@inject(TYPES.UserRepository) repo: UserRepository) {
    this._repo = repo;
  }

  @Route('get', '')
  public async getAll(_: Request, res: Response) {
    // const user = await this._repo.getAll();
    console.log(this);
    return res.status(200).json({});
  }

  @Route('get', '/:id')
  getById(req: Request, res: Response) {
    return res.status(200).json({ hello: 'world!' });
  }

  @Route('get', '/query')
  query(req: Request, res: Response) {
    return res.status(200).json({ hello: 'world!' });
  }

  @Route('patch', '')
  update(req: Request, res: Response) {
    return res.status(200).json({ hello: 'world!' });
  }

  @Route('delete', '/:id')
  delete(req: Request, res: Response) {
    return res.status(200).json({ hello: 'world!' });
  }
}
