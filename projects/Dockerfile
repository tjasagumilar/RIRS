FROM node:18-alpine

WORKDIR /app/projects

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5069

CMD ["node", "index.js"]
