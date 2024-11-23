FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy .env file first
COPY .env ./

# Copy rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 5000

# Start the server
CMD ["yarn", "start"] 