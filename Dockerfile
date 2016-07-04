FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Bundle app source
COPY . /usr/src/app


EXPOSE 3000
CMD npm start -- --db:url:host db --s3:endpoint ${S3_PORT_4569_TCP_ADDR} --s3:port ${S3_PORT_4569_TCP_PORT} --s3:bucket forms
