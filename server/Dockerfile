FROM node:19.8.1 as builder

RUN apt-get update -y && \
    apt-get upgrade -y && \
    npm i -g npm --upgrade

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN npm i -g npm --upgrade && \
    npm i && \
    npm update && \
    npm run prebuild && \
    npm run generate && \
    npm run build

FROM node:19.8.1

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
