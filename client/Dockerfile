FROM node:22-alpine

WORKDIR /app

# Kopírování package.json a instalace závislostí
COPY package*.json ./
RUN npm install

# Kopírování zbytku aplikace
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

