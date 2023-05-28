FROM node:20.1.0 as builder

ENV HOST 0.0.0.0

RUN apt-get update -y && apt-get upgrade -y && npm i -g pnpm

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .

RUN pnpm i && \
    pnpm run codegen-schema && \
    pnpm run build && \
    rm -rf $(ls -A | grep -v .output)


FROM node:20.1.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.output ./.output

ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
