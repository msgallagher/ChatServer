// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var clients = [];

// Start a TCP Server
net.createServer(function(socket) {

  // Identify this client
  var address = socket.remoteAddress === '::1' ? "localhost" : socket.remoteAddress;
  socket.name = address + ":" + socket.remotePort

  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  socket.write("Welcome " + socket.name + "\n\r");
  broadcast("\n\r" + socket.name + " joined the chat" + "\n\r", socket);

  var message = '';
  // Handle incoming messages from clients.
  socket.on('data', function(data) {
    // copy incoming data to message
    message += data
    var n = message.indexOf('\n')
    // if we have a \n? in message then emit one or more 'line' events
    while (~n) {
      socket.emit('line', message.substring(0, n))
      message = message.substring(n + 1)
      n = message.indexOf('\n')
    }
  });

  // Broadcast on end of line
  socket.on('line', function() {
    broadcast(socket.name + "> " + message, socket);
    message = '';
  })

  // Remove the client from the list when it leaves
  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast("\n\r" + socket.name + " left the chat." + "\n\r");
  });

  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function(client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(5000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 5000\n");
