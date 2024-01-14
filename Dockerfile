FROM nginx:1.22-alpine

WORKDIR /app

COPY ./nginx/default.conf /etc/nginx/conf.d/

COPY . .

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]

