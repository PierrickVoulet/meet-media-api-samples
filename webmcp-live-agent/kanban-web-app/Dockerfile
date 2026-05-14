# Stage 1: Build Vite production assets
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
COPY webmcp-client ./webmcp-client
COPY meet-addon-loader ./meet-addon-loader
RUN npm install
RUN npm run build --prefix webmcp-client
RUN npm run build --prefix meet-addon-loader

COPY . .
RUN npm run build

# Stage 2: Run Express + WebSocket server
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY webmcp-client ./webmcp-client
COPY meet-addon-loader ./meet-addon-loader
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
