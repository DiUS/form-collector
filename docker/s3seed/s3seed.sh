s3host=http://${S3_PORT_4569_TCP_ADDR}:${S3_PORT_4569_TCP_PORT}

for file in ./files/*; do
  curl -i -X PUT -T "$file" "$s3host/forms/${file##*/}"
done
