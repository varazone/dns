FROM node:18

MAINTAINER GEAR

ENV NODE_ENV=production

RUN npm install -g @nestjs/cli
RUN npm i -g typescript@5.1.3
RUN npm i -g nest

WORKDIR app
COPY ["package.json", "package-lock.json", "./"]
RUN npm i

COPY ["tsconfig.json", "tsconfig.build.json", "./"]
COPY ./src ./src/
RUN npm run build

CMD [ "node", "dist/main.js" ]
