FROM node:18-alpine

WORKDIR /app

# Copy package files from root
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all TypeScript config files
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./

# Copy the src directory and other necessary files
COPY src/ ./src/
COPY index.html ./
COPY vite.config.ts ./
COPY eslint.config.js ./

# Build the application
RUN yarn build

# Expose port
EXPOSE 3000

# Start the client - note the --host flag
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"] 