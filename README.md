# Node.js + Express.js + TypeScript + Sequelize ORM + Redis + PostgreSQL

An express server boilerplate built using the latest version of Node.js and integrates various modern technologies and practices to ensure a robust, scalable, and maintainable application, with out-of-the-box authentication and user creation logic implemented. Below are the key features and setup instructions for this boilerplate.

## Features
- **Express.js**: Web framework for Node.js.
- **Node.js Version 21.7.1**: Utilizes the latest features and improvements of Node.js.
- **Node Events**: Integrated with `node:event` for handling custom events.
- **Inversion of Control**: Implemented using Inversify for better dependency management.
- **Classes**: Written in TypeScript using classes for better structure and readability.
- **Sequelize ORM**: For interacting with PostgreSQL databases.
- **PostgreSQL**: Database system.
- **Decorators**: Implemented using `reflect-metadata` for advanced object-oriented programming.
- **Global Logger**: Centralized logging mechanism.
- **Error Handling**: Custom `AppError` handler and `catchAsync` function for error handling across routes.
- **Rate Limiter**: To control the rate of requests to the server.
- **Express Session**: For managing user sessions.
- **Redis**: Used for rate limit store, tempory session store and caching store.
- **@Type-Cacheable**: Decorator for caching data using redis as store.
- **Zod**: Schema validation library.
- **Architecture**: Follows the Model -> Repository -> Service -> Controller approach.
- **Testing**: Jest and Supertest.

## Setup Instructions

### Prerequisites
- Node.js (latest version)
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
      git clone https://github.com/AllStackDev1/super-parakeet.git
      cd super-parakeet
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your environment variables:
   ```env
    PORT=
    HOSTNAME=

    DB_PORT=
    DB_NAME=nodejs-
    DB_HOST=
    DB_USERNAME=
    DB_PASSWORD=

    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_USER=default
    REDIS_PASSWORD=

    SESSION_SECRET=

    JWT_SECRET_KEY=
    JWT_EXPIRES_IN=1h

    COOKIES_SECRET_KEY=
    COOKIES_MAX_AGE=3600000

    HASHING_SALT=12
   ```

4. **Build the project**
   ```bash
   pnpm run build
   ```

5. **Run the database migrations**
   ```bash
   pnpm run db:create
   pnpm run db:migrate:up
   pnpm run db:seed:all
   ```

6. **Start the development server**
   ```bash
   pnpm run dev
   ```
   The server will start at `http://localhost:8000`.

## Scripts

- **Development**: 
  ```bash
  pnpm run dev
  ```
  Starts the server in development mode with `nodemon`.

- **Production**:
  ```bash
  pnpm run start
  ```
  Starts the server in production mode.

- **Build**:
  ```bash
  pnpm run build
  ```
  Compiles TypeScript to JavaScript.

- **Database**:
  - Create database:
    ```bash
    pnpm run db:create
    ```
  - Migrate up:
    ```bash
    pnpm run db:migrate:up
    ```
  - Migrate undo:
    ```bash
    pnpm run db:migrate:undo
    ```

- **Testing**:
  ```bash
  pnpm run test
  ```
  Runs unit tests using Jest.

- **Linting**:
  ```bash
  pnpm run lint
  ```
  Runs ESLint to check for code quality issues.

## Project Structure

```
├── src/
│   ├── configs/
│   │    ├── env.config.ts
│   │    └── logger.config.ts
│   │    └── redis.config.ts
│   ├── controllers/
│   ├── db
│   │    ├── migrations/
│   │    ├── models/
│   │    │     └── connection.ts
│   │    ├── seeders/
│   │    └── config.js
│   ├── decorators/
│   │    ├── controller.ts
│   │    ├── route.ts
│   │    └── validate.ts
│   ├── di/
│   │    ├── modules/
│   │    ├── container.ts
│   │    └── types.ts
│   ├── events/
│   ├── middlewares/
│   │    ├── authHandler.ts
│   │    ├── corsHandler.ts
│   │    ├── defineRoutes.ts
│   │    ├── globalErrorHandler.ts
│   │    └── loggerHandler.ts
│   ├── repositories/
│   ├── services/
│   ├── test/
│   │   └── controllers/
│   │   └── models/
│   │   └── repositories/
│   │   └── services/
│   │   └── test.container.ts
│   │   └── test.context.ts
│   │   └── test.model.ts
│   ├── utils/
│   │    ├── appError.ts
│   │    ├── helper.ts
│   │    └── catchAsync.ts
│   └── validators/
│   └── app.ts
│   └── server.ts
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .sequelizerc
├── env.d.ts
├── eslint.config.mjs
├── jest.config.js
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

- **configs/**: Contains app configurations.
- **controllers/**: Contains route controllers.
- **db/**: Contains our database setup, connection instance and models.
- **decorators/**: Contains our custom decorators functions.
- **di/**: Contains our inversify container which handles our DI and IoC .
- **middlewares/**: Contains custom middleware functions.
- **repositories/**: Contains database interaction logic.
- **services/**: Contains business logic.
- **utils/**: Contains utility functions.
- **validators/**: Contains validation logic using Zod.
- **tests/**: Contains e2e test cases using jest as a runner.
- **server.ts**: Entry point of the application.
- **app.ts**: Main app configuration.

## Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.