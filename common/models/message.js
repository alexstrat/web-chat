'use strict';

module.exports = (Message) => {
  Message.sendMessage = (message, next) => {
    Message.create(message, (error, message) => {
      Message.findById(message.id, {include: {relation: 'user'}}, (error, foundMessage) => {
        // send the message to the corresponding room channel
        Message.app.io.to(foundMessage.roomId).emit('message', foundMessage);
        next();
      });
    });
  }

  Message.remoteMethod('sendMessage', {
    accepts: [{arg: 'message', type: 'object', http: { source: 'body' }}],
    returns: {arg: 'success', type: 'boolean'},
    http: {path:'/send-message', verb: 'post'}
  });
};
