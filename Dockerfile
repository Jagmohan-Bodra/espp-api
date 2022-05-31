FROM node:12

RUN mkdir -p /var/www/application
COPY ./ /var/www/application
WORKDIR /var/www/application
RUN if [ -d "node_modules" ]; then rm -r "node_modules"; fi
RUN npm install

COPY ./docker/bin /usr/local/bin/app
RUN chmod +x /usr/local/bin/app/*

RUN npm run build

CMD /usr/local/bin/app/run.sh
