###############
# STAGE 1 - BUILD
###############
FROM node:20-alpine AS builder

# Otimiza builds paralelos e reduz tamanho do cache
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copia apenas os arquivos necessários para instalar as dependências
COPY package.json ./

# Copia o restante dos arquivos para o container
COPY . .

CMD ["npm", "run", "dev"]
