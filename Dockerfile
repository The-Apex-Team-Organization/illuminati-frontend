FROM node:20-alpine

WORKDIR /app

COPY illuminati_frontend/package*.json ./

RUN npm install

COPY illuminati_frontend ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
