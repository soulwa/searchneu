# build environment
FROM node:11-alpine as build
WORKDIR /app
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfiles
COPY .sequelizerc /app/.sequelizerc
COPY backend /app/backend
COPY common /app/common
COPY frontend /app/frontend
RUN yarn build

EXPOSE 5000