import { UserRepository } from 'repositories';
import { TestContext } from 'tests/test.context';

import { UserModel } from 'db/models';
import { mockModel } from 'tests/test.model';

import { TEST_MODEL } from 'configs/env.config';

describe.only('User Repository Test', () => {
  let userModelMock: typeof UserModel;
  let userRepositoryMock: UserRepository;
  const user = {
    lastName: 'Doe',
    password: 'ABC',
    firstName: 'John',
    email: 'john@gmail.com',
  } as const;

  beforeAll(() => {
    const testContext = new TestContext();
    userModelMock = testContext.mock<typeof UserModel>(
      () => (TEST_MODEL === 'mock' ? mockModel() : UserModel),
      typeof UserModel,
    );

    userRepositoryMock = testContext.mock<UserRepository>(
      () => new UserRepository(userModelMock),
      UserRepository,
    );
  });

  it('shows that an instance of user model exist', async () => {
    expect(userRepositoryMock).toBeDefined();
  });

  it('shows that create method works as expected', async () => {
    expect(userRepositoryMock.create).toBeDefined();
    expect((await userRepositoryMock.create(user)).email).toEqual(user.email);
  });

  it('shows that getAll method works as expected', async () => {
    expect(userRepositoryMock.getAll).toBeDefined();
    const users = await userRepositoryMock.getAll();
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(user.email);
  });

  it('shows that getOne method works as expected', async () => {
    expect(userRepositoryMock.getOne).toBeDefined();
    expect(
      (await userRepositoryMock.getOne({ email: user.email }))?.email,
    ).toEqual(user.email);
    expect(
      await userRepositoryMock.getOne({ email: 'email@notfound.com' }),
    ).toBeNull();
  });

  it('shows that getById method works as expected', async () => {
    expect(userRepositoryMock.getById).toBeDefined();
    const dbUser = await userRepositoryMock.getOne({ email: user.email });
    if (dbUser?.id) {
      expect((await userRepositoryMock.getById(dbUser?.id))?.email).toEqual(
        user.email,
      );
    }
    expect(
      await userRepositoryMock.getById('fed6d510-5421-4a9a-80e0-ef1da43741b4'),
    ).toBeNull();
  });

  it('shows that updateById method works as expected', async () => {
    expect(userRepositoryMock.updateById).toBeDefined();
    expect(
      await userRepositoryMock.updateById(
        'fed6d510-5421-4a9a-80e0-ef1da43741b4',
        { firstName: 'James' },
      ),
    ).toEqual([0]);
    const dbUser = await userRepositoryMock.getOne({ email: user.email });
    if (dbUser?.id) {
      expect(
        await userRepositoryMock.updateById(dbUser.id, {
          firstName: 'James',
        }),
      ).toEqual([1]);
    }
    expect(
      (await userRepositoryMock.getOne({ email: user.email }))?.firstName,
    ).toEqual('James');
  });

  it('shows that deleteById method works as expected', async () => {
    expect(userRepositoryMock.deleteById).toBeDefined();
    const dbUser = await userRepositoryMock.getOne({ email: user.email });
    if (dbUser?.id) {
      expect(await userRepositoryMock.deleteById(dbUser.id, true)).toEqual(1);
    }
    expect(await userRepositoryMock.getOne({ email: user.email })).toBeNull();
  });
});
