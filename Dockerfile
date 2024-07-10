FROM node:22-alpine3.19

WORKDIR /container1

COPY . .

RUN npm install

EXPOSE 6000

CMD ["node", "index.js"]
