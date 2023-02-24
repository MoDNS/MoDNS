FROM node:19-alpine

# create the reactJS app directory
WORKDIR /react-app

# copy necessary files
COPY package*.json ./
COPY . .

# install npm
RUN npm install

# expose port 3000 for npm
EXPOSE 3000

# start npm, which automatically runs on port 3000
## NOTE: port override may be necessary in the future
CMD [ "npm", "start"]


# CMD [ "npm", "start", "&&", "npm", "read-scripts", "watch"]