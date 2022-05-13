FROM node:16.14.0

WORKDIR /usr/src/smart-brain-api

COPY ./ ./

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]