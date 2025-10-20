# Koristi Node 22
FROM node:22-alpine

# Postavi radni direktorijum unutar containera
WORKDIR /to-do-app

# Kopiraj package fajlove (radi boljeg cachiranja)
COPY package*.json ./

# Instaliraj zavisnosti
RUN npm install --legacy-peer-deps

# Kopiraj ostatak projekta u /to-do-app
COPY . .

# Ekspozuj port koji koristi Vite
EXPOSE 5173

# Pokreni dev server i omogući pristup spolja (--host)
CMD ["npm", "run", "dev", "--", "--host"]
