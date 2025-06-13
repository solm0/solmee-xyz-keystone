FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build (optional: only if you use TypeScript or any build steps)
# RUN npm run build

# Set environment variable
ENV NODE_ENV=production

# Expose the port Keystone serves on
EXPOSE 3000

# Run in production mode
CMD ["node", "node_modules/.bin/keystone", "start"]