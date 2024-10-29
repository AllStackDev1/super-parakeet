import { TestContext } from 'tests/test.context';

import { UserModel } from 'db/models';
import { mockModel } from 'tests/test.model';

import { TEST_MODEL } from 'configs/env.config';

describe('User Model Test', () => {
  let userModelMock: typeof UserModel;
  const user = {
    lastName: 'Doe',
    password: 'ABC',
    firstName: 'John',
    email: 'john@gmail.com',
  } as const;

  beforeAll(() => {
    const testContext = new TestContext();
    userModelMock = testContext.mock<typeof UserModel>(
      () =>
        TEST_MODEL === 'mock'
          ? mockModel({
              getFullname: jest.fn(function (this) {
                return this.firstName + ' ' + this.lastName;
              }),
              getAge: jest.fn(function (this) {
                if (!this.dateOfBirth) {
                  return 0;
                }
                const birthYear = new Date(this.dateOfBirth).getFullYear();
                const currentYear = new Date().getFullYear();
                return currentYear - birthYear;
              }),
              isPasswordMatch: jest.fn(function (this, password) {
                return Promise.resolve(this.password === password);
              }),
            })
          : UserModel,
      typeof UserModel,
    );
  });

  it('shows that sequelized user model function exist', () => {
    expect(userModelMock).toBeDefined();
  });

  it('should resolve create function', async () => {
    expect(userModelMock.create).toBeDefined();
    const dbUser = await userModelMock.create(user);
    expect(dbUser.email).toEqual(user.email);
    expect(dbUser.isPasswordMatch(user.password)).toBeTruthy();
  });

  it('should resolve findAll function', async () => {
    expect(userModelMock.findAll).toBeDefined();
    const users = await userModelMock.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(user.email);
  });

  it('should resolve findOne function', async () => {
    expect(userModelMock.findOne).toBeDefined();
    expect(
      (await userModelMock.findOne({ where: { email: user.email } }))?.email,
    ).toEqual(user.email);
    expect(
      await userModelMock.findOne({
        where: { email: 'email@notfound.com' },
      }),
    ).toBeNull();
  });

  it('should resolve findByPk function', async () => {
    expect(userModelMock.findByPk).toBeDefined();
    const dbUser = await userModelMock.findOne({
      where: { email: user.email },
    });
    expect((await userModelMock.findByPk(dbUser?.id))?.email).toEqual(
      user.email,
    );
    expect(
      await userModelMock.findByPk('fed6d510-5421-4a9a-80e0-ef1da43741b4'),
    ).toBeNull();
  });

  it('should resolve update function', async () => {
    expect(userModelMock.update).toBeDefined();
    expect(
      await userModelMock.update(
        { firstName: 'James' },
        { where: { id: 'fed6d510-5421-4a9a-80e0-ef1da43741b4' } },
      ),
    ).toEqual([0]);
    const dbUser = await userModelMock.findOne({
      where: { email: user.email },
    });
    expect(
      await userModelMock.update(
        { firstName: 'James', dateOfBirth: new Date('1993-06-06') },
        { where: { id: dbUser?.id } },
      ),
    ).toEqual([1]);
    expect(
      (
        await userModelMock.findOne({
          where: { email: user.email },
        })
      )?.firstName,
    ).toEqual('James');
  });

  it('should resolve static function', async () => {
    const dbUser = await userModelMock.findOne({
      where: { email: user.email },
    });

    expect(dbUser?.getFullname()).toEqual(
      dbUser?.firstName + ' ' + dbUser?.lastName,
    );

    expect(dbUser?.getAge()).toBeGreaterThan(30);
  });

  it('should resolve destroy function', async () => {
    expect(userModelMock.destroy).toBeDefined();
    const dbUser = await userModelMock.findOne({
      where: { email: user.email },
    });
    expect(
      await userModelMock.destroy({ where: { id: dbUser?.id }, force: true }),
    ).toEqual(1);
    expect(
      await userModelMock.findOne({
        where: { email: user.email },
      }),
    ).toBeNull();
  });
});
