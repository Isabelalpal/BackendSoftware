FROM node:23.11-slim
WORKDIR /app
COPY package*.json ./
RUN npm install -g @nestjs/cli && npm install
COPY . .
EXPOSE 3000
WORKDIR /app
COPY package*.json ./
ARG APP_DIR
WORKDIR /app/$APP_DIR
CMD ["npm", "run", "start"]
