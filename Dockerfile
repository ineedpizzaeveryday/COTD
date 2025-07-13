FROM node:18-slim  # Użyj lżejszego obrazu
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-optional --prefer-offline  # Szybsza instalacja, mniej pamięci
COPY . .
CMD ["npm", "start"]