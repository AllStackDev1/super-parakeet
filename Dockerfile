FROM node:21.7.1-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and pnpm-lock.yaml first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm with frozen lockfile
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest of your application code (to avoid cache invalidation on deps step)
COPY . .

# Expose the port the app will run on
EXPOSE 8000

CMD ["pnpm", "start"]
