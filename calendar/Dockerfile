FROM node:18-alpine

WORKDIR /app/calendar

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5420

CMD ["node", "index.js"]