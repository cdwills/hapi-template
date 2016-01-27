function strict(){
  "use strict";
}

import Hapi from 'hapi';
import Good from 'good';
import GoodConsole from 'good-console';
import config from './config';

let server = new Hapi.Server();
server.connection({ port: config.server.port });


server.register([
  {
    register: Good,
    options: {
      reporters: [
        {
          reporter: GoodConsole,
          events: {
            response: '*',
            log: '*'
          }
        }
      ]
    }
  }
], (err) => {
  if (err) {
    throw err;
  }
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('Hello!');
  }
});

server.start(() => {
  server.log('info', 'Server at: ' + server.info.uri);
});

exports.server = server;
