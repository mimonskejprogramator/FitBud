FROM node:22-alpine

WORKDIR /app

# Kopírování package.json a instalace závislostí
COPY package*.json ./
RUN npm install

# Kopírování zbytku aplikace
COPY . .

# Vytvoření složky pro databázi
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"]

