FROM node:5

ENV APP_DIR /app
RUN mkdir $APP_DIR
WORKDIR $APP_DIR

ENV npm_config_loglevel=warn

COPY package.json $APP_DIR/
RUN npm install

COPY . $APP_DIR

EXPOSE 8008 

CMD npm start
