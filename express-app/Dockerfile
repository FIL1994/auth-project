FROM node:lts-jessie-slim

# Create app directory
WORKDIR /usr/local/express

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci

# Bundle app source
COPY . .

EXPOSE 3000
CMD npm run start
