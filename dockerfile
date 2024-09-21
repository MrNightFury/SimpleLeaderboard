FROM node:lts-slim

WORKDIR /server

COPY package.json /server/
RUN npm install
COPY . .

ADD ./src /server/src
# ADD ./config.json /server/
ADD ./tsconfig.json /server/

RUN npx tsc
EXPOSE 80
CMD [ "node", "dist/main.js" ]