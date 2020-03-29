# build environment
FROM node:12.16-alpine as build
WORKDIR /app
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --frozen-lockfile
COPY .sequelizerc /app/.sequelizerc
COPY backend /app/backend
COPY common /app/common
COPY frontend /app/frontend
RUN yarn build

FROM node:12.16-alpine
ENV NODE_ENV=prod
WORKDIR /root
COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/.sequelizerc .
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
RUN yarn install --production

EXPOSE 5000
CMD ["yarn", "start_prod"]