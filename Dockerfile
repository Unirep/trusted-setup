FROM node:16-buster

COPY . /src

WORKDIR /src

RUN yarn && rm -rf packages/frontend

FROM node:16-buster

COPY --from=0 /src /src
WORKDIR /src/packages/backend

CMD ["npm", "start"]
