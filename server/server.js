'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const app = module.exports = loopback();

app.start = () => {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    let rooms = {};
    app.io = require('socket.io')(app.start());
    app.io.on('connection', (socket) => {
      console.log('user connected');

      socket.on('disconnect', () => {
        for(let roomId in rooms) {
          if (rooms[roomId][socket.nickname]) {
            delete rooms[roomId][socket.nickname];
            app.io.to(roomId).emit('user-deleted', socket.nickname);
          }
        }
      });

      socket.on('joinRoom', (data) => {
        socket.nickname = data.nickname;
        socket.join(data.roomId);
        if (!rooms[data.roomId])
          rooms[data.roomId] = {};
        rooms[data.roomId][data.nickname] = true;
        app.io.to(data.roomId).emit('user', data.nickname);
      })

      socket.on('roomUsersList', (data) => {
        if (data) {
          const clients = rooms[data.roomId];
          for (let client in clients) {
            if (client !== socket.nickname) {
              socket.emit('user', client);
            }
          }
        }
      });

      socket.on('list', (data) => {
        if (data) {
          app.models.Message.find({where: {roomId: data.roomId}, include: {relation: 'user'}})
          .then((messages) => {
            messages.forEach((message) => { socket.emit('message', message)});
          });
        }
      });
    });
  }
});
