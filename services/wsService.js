const WebSocket = require('ws');

let wss;

exports.init = (server) => {
  wss = new WebSocket.Server({ noServer: true });
  return wss;
};

exports.broadcast = (message) => {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};