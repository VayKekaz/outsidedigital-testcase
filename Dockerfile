
FROM node:alpine3.15 
WORKDIR /app 
COPY package.json .
COPY yarn.lock .
COPY nest-cli.json .
COPY tsconfig*.json .
COPY prisma .
# --production=true not working because some devDependencies required on build stage
RUN yarn install
COPY . .
RUN yarn run prisma:generate
RUN yarn run build
EXPOSE 3000
ENTRYPOINT [ "yarn", "run", "start:prod" ]
