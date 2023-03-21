FROM node:18-alpine

WORKDIR /app

RUN npm install pm2 -g

COPY package*.json /app/
RUN npm ci

COPY ./ /app

EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s CMD curl -f http://127.0.0.1:8080/api/health || exit 1
CMD ["sh", "./server-up.sh"]