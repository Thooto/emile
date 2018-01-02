/* To install node modules:
        npm init

   If it doesn't work, enter the following lines:
        npm install express --save
        npm install socket.io --save
        npm install cannon --save
        npm install nodemon --save-dev -g

   Start with command: nodemon app */


// Server requirements
var express = require('express');
var socket = require('socket.io');

// Game requirements
var Hub = require('./resources/objects/Hub.js');

// Starting app
var app = express();


// Starting server and socket.io module
var server = app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1', console.log('Currently listening to port 4000!'));
var io = socket(server);


// Folders the server uses
app.use('/styles', express.static('public/resources/styles'));
app.use('/objects', express.static('public/resources/objects'));
app.use('/images', express.static('public/resources/images'));
app.use('/javascript', express.static('public/resources/javascript'));
app.use('/views', express.static('public/views'));


// Starting game manager
var hub = new Hub(io);


// When client asks for /join page
app.get('/join', function(request, response) {
    response.sendFile(__dirname + '/public/views/join.html');
});


// When client asks for /play page (to either directly join a new game or resume one)
app.get('/play/rooms/:id/players/:name', function(request, response) {
    // Store request parameters
    var name = request.params.name, id = request.params.id;

    // Invokes the connection manager and sends its redirection file
    var redirect = hub.requestHandler(name, id);
    response.sendFile(__dirname + redirect);
});


// When the player socket connects (on play page), must be called outside app.get to avoid function duplication
io.on('connection', function(socket) {
    hub.connectionHandler(socket);
});


// End of file
