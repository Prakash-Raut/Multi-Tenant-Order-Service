ARG NODE_VERSION=21.7.1 

# --- Builder Stage ---
FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /home/node/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./

# Use cache for node_modules
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# --- Runner Stage ---
FROM node:${NODE_VERSION}-alpine as runner

USER node

RUN mkdir -p /home/node/app

# Create working directory
WORKDIR /home/node/app

# Set environment variable
ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files from the builder stage
COPY --from=builder --chown=node:node /home/node/app/dist ./dist

EXPOSE 5500

CMD ["node", "dist/src/index.js"]
