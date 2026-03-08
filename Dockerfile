FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências primeiro (melhor cache)
COPY package.json package-lock.json* ./

RUN npm ci

# Copiar código fonte
COPY tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compilar TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
