FROM golang:latest
WORKDIR /app

COPY . .

RUN adduser -D api
USER api

EXPOSE 8080
CMD [ "go", "run", "main.go" ]