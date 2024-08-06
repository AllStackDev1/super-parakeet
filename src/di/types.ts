export const TYPES = {
  // Models
  UserModel: Symbol.for('UserModel'),

  // Respositories
  UserRepository: Symbol.for('UserRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),

  // Thirdparty
  RedisClient: Symbol.for('RedisClient'),
  SessionHandler: Symbol.for('SessionHandler'),
  RateLimitHandler: Symbol.for('RateLimitHandler'),
};
