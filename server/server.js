import Hapi from 'hapi';
import Good from 'good';
import GoodConsole from 'good-console';
import config from './config';

const Path = require('path');
const mysql = require('mysql');

// Connect to DB
var con = mysql.createPool(process.env.CLEARDB_DATABASE_URL);

let server = new Hapi.Server();

server.connection({ port: config.server.port });


// LOGGING
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


// SET UP EJS TEMPLATING ENGINE
server.register(require('vision'), (err) => {
  server.views({
    engines: {
      html : require('ejs')
    },
    relativeTo: __dirname,
    path: 'views'
  });
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply.view('login', {
      header1: 'Welcome to Articuwiki',
      subheader: 'The source for all your answers to all your "what is..." questions',
      message: 'Please sign in:'
    })
  }
})

// ALL LIVE TERMS DB QUERY
server.route({
  method: 'POST',
  path: '/',
  handler: (request, reply) => {

    var username = request.payload.username;
    var password = request.payload.password;

    if (username == 'admin' && password == process.env.APP_PWD){

      var query_asc = 'SELECT * from articulate_terms WHERE status = "live" ORDER BY term';
      var query_desc = query_asc+' DESC';

      con.getConnection(function(err, connection){
        if(err){
          console.log('Error connecting to Db');
          return;
        }
        console.log('Connection established');

        var results = connection.query(query_asc, function(err, rows, fields){
          if (err){
            console.log('error: ', err);
            throw err;
          }

          reply.view('index', {
            header1: fields[1].name.toUpperCase(),
            header2: fields[2].name.toUpperCase(),
            header3: fields[3].name.toUpperCase(),
            header4: fields[4].name.toUpperCase(),
            header5: fields[5].name.toUpperCase(),
            results_array: rows
          });
          connection.release();
        });
      });
    } else {
      reply.view('generic', {
        header1: 'What the Whaaaaat?',
        subheader: 'Sign in failed',
        message: 'Sorry, we don\'t recognize that username/password combination.'
      })
    }
  }
});



// SPECIFIC TERM DB QUERY
server.route({
  method: 'POST',
  path: '/whatis',
  handler: (request, reply) => {

   var word = escape(request.payload.queryText);

   var query = 'SELECT * from articulate_terms WHERE status = "live" AND (tags LIKE "%'+word+'%" OR term = "'+word+'")';
   con.getConnection(function(err, connection){
    if(err){
      console.log('Error connecting to Db');
      return;
    }
    console.log('Connection established');

    var results = connection.query(query, function(err, rows, fields){
      if (err){
        console.log('error: ', err);
        throw err;
      }

        if (rows.length < 1){
          reply.view('notfound', {
            header1: 'Say What?',
            header2: 'Whaaaaaat?',
            not_found: 'Sorry, the term ' + encodeURIComponent(request.params.userQuery) + ' was not found. Try searching for something else:'
          });
        } else {
          reply.view('index', {
            header1: fields[1].name.toUpperCase(),
            header2: fields[2].name.toUpperCase(),
            header3: fields[3].name.toUpperCase(),
            header4: fields[4].name.toUpperCase(),
            header5: fields[5].name.toUpperCase(),
            results_array: rows
          });
        };

        connection.release();
      }); // end results
  });
 }
});

// STATIC PAGES
server.register(require('inert'), (err) => {
 if (err) {
  throw err;
}
server.route({
  method: 'GET',
  path: '/styles.css',
  handler: function (request, reply) {
    reply.file(__dirname+'/views/public/styles.css');
  }
});
server.route({
  method: 'GET',
  path: '/favicon.ico',
  handler: function (request, reply) {
    reply.file(__dirname+'/views/public/favicon.ico');
  }
});

server.route({
  method: 'GET',
  path: '/add',
  handler: function (request, reply){
    reply.view('add', {
      header1: 'Add a Term'
    });
  }
});

server.route({
  method: 'POST',
  path: '/edit',
  handler: function (request, reply){
    var action = escape(request.payload.action);
    var term_id = escape(request.payload.id);
    var new_term = escape(request.payload.term);
    var new_definition = escape(request.payload.definition);
    var new_status = escape(request.payload.status);
    var new_website = escape(request.payload.website);
    var new_tutorial = escape(request.payload.tutorial);
    var new_info = escape(request.payload.info);
    var new_tags = escape(request.payload.tags);
    var new_last_updated = new Date().toLocaleString();


    if (action == 'approveall'){

      var query_updateall = 'UPDATE articulate_terms SET status="live"';
      con.getConnection(function(err, connection){
        if(err){
          console.log('Error connecting to database to delete');
          return;
        }
        console.log('Connection established');

            var results = connection.query(query_updateall, function(err, rows, fields){
              if (err){
                console.log('Error deleting term: ', err);
                throw err;
              }
            });

          });

    } else if (action == 'deleteall'){
      var query_deleteall = 'DELETE FROM articulate_terms WHERE status="pending"';
      con.getConnection(function(err, connection){
        if(err){
          console.log('Error connecting to database to delete');
          return;
        }
        console.log('Connection established');

            var results = connection.query(query_deleteall, function(err, rows, fields){
              if (err){
                console.log('Error deleting term: ', err);
                throw err;
              }
            });

          });

    } else if (new_status=='delete'){
      var query_delete = 'DELETE FROM articulate_terms WHERE id = '+term_id;
      con.getConnection(function(err, connection){
        if(err){
          console.log('Error connecting to database to delete');
          return;
        }
        console.log('Connection established');

            var results = connection.query(query_delete, function(err, rows, fields){
              if (err){
                console.log('Error deleting term: ', err);
                throw err;
              }
            });

          });
    } else {

     var query_update = 'UPDATE articulate_terms SET term="'+new_term+'", definition="'+new_definition+'", status="'+new_status+'", website="'+new_website+'", tutorial="'+new_tutorial+'", tags="'+new_tags+'", last_updated="'+new_last_updated+'", info="'+new_info+'" WHERE id="'+term_id+'"';
     con.getConnection(function(err, connection){
      if(err){
        console.log('Error connecting to update database');
        return;
      }

      var results = connection.query(query_update, function(err, rows, fields){
        if (err){
          console.log('Error updating database: ', err);
          throw err;
        }
      });

    });
        }

        var query_asc = 'SELECT * from articulate_terms ORDER BY term';
        con.getConnection(function(err, connection){
          if(err){
            console.log('Error connecting to Db');
            return;
          }
          console.log('Connection established');

          var results = connection.query(query_asc, function(err, rows, fields){
            if (err){
              console.log('error: ', err);
              throw err;
            }

            reply.view('edit', {
              header1: fields[1].name.toUpperCase(),
              header2: fields[2].name.toUpperCase(),
              header3: fields[3].name.toUpperCase(),
              header4: fields[4].name.toUpperCase(),
              header5: fields[5].name.toUpperCase(),
              results_array: rows
            });
            connection.release();
          });
        });
      }
    })

server.route({
  method: 'POST',
  path: '/submit',
  handler: function (request, reply){

    var term = escape(request.payload.termText);
    var definition = escape(request.payload.definition);
    var tags = escape(request.payload.tags);
    var website = escape(request.payload.website);
    var tut = escape(request.payload.tutorial);
    var info = escape(request.payload.info);
    var status = "pending";
    var date = new Date().toLocaleString();
    var insert_query = "INSERT INTO articulate_terms (term,definition,website,tutorial,info,status,tags,last_updated) VALUES ('"+term+"','"+definition+"','"+website+"','"+tut+"','"+info+"','"+status+"','"+tags+"','"+date+"')";


    if (term){
      con.getConnection(function(err, connection){
        if(err){
          console.log('Error connecting to Db 213');
          return;
        };
            //console.log('Connection established');
            con.getConnection(function(err, connection){
              var add_term = connection.query(insert_query, function(err, rows, fields){
                if (err){
                  console.log('insert error:', err);
                  throw err;
                } else {

                  reply.view('generic', {
                    header1: 'WOOT!',
                    subheader: 'Thanks for contributing to Articuwiki',
                    message: 'You have added ' + unescape(term) + ' to the Articuwiki database.  Your submission will be reviewed and approved soon.'
                  });
                }
              }); // end insert query
              connection.release();
            });// end connection
          });
    } else {
      reply.view('generic', {
        header1: 'WOMP WOMP',
        subheader: 'What exactly were you trying to do?',
        message: 'Sorry, we do not allow that.'
      });
    };
  }
});


server.route({
  method: 'GET',
  path: '/edit',
  handler: function (request, reply){
    var query_asc = 'SELECT * from articulate_terms ORDER BY term';
    var query_desc = query_asc+' DESC';

    con.getConnection(function(err, connection){
      if(err){
        console.log('Error connecting to Db');
        return;
      }
          //console.log('Connection established');

          var results = connection.query(query_asc, function(err, rows, fields){
            if (err){
              console.log('error: ', err);
              throw err;
            }
            // console.log(fields.length);
            // console.log(rows[0]);


            reply.view('edit', {
              header1: fields[1].name.toUpperCase(),
              header2: fields[2].name.toUpperCase(),
              header3: fields[3].name.toUpperCase(),
              header4: fields[4].name.toUpperCase(),
              header5: fields[5].name.toUpperCase(),
              results_array: rows
            });
            connection.release();
          });
        });
  }
})
});



server.start(() => {
  server.log('info', 'Server at: ' + server.info.uri);
});

exports.server = server;

