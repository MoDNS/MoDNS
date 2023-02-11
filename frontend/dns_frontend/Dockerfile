FROM node:19-alpine

WORKDIR /react-app
COPY package*.json ./



COPY . .
RUN npm install

EXPOSE 3000

CMD [ "npm", "start"]
# CMD [ "npm", "start", "&&", "npm", "read-scripts", "watch"]