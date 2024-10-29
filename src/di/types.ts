export const TYPES = {
  // Server
  Server: Symbol.for('Server'),
  Express: Symbol.for('Express'),

  // Models
  UserModel: Symbol.for('UserModel'),

  // Respositories
  UserRepository: Symbol.for('UserRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  RedisService: Symbol.for('RedisService'),
  SocketService: Symbol.for('SocketService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),

  // Middleware
  AuthHandler: Symbol.for('AuthHandler'),
  SessionHandler: Symbol.for('SessionHandler'),
  RateLimitHandler: Symbol.for('RateLimitHandler'),
};
