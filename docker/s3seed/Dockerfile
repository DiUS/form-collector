FROM alpine

RUN mkdir -p /usr/src/s3seed
WORKDIR /usr/src/s3seed

RUN apk add --no-cache curl

COPY . /usr/src/s3seed
CMD ./s3seed.sh
