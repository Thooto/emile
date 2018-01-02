var Room = require('./Room');

module.exports = class {
    constructor(io) {
        this.rooms = {};
        this.io = io;
    }

    requestHandler(name, id) {
        // Does the room already exist?
        if (this.rooms[id]) {
            // Yes it does: is the requested player in that room?
            if (this.rooms[id].players[name]) {
                // Yes he is: is he currenty connected? (does he have an active socket?)
                if (this.rooms[id].players[name].socket) {
                    // Yes he is: the player can't join
                    return '/public/views/already-connected.html';
                } else {
                    // No he isn't: the player can resume
                    return '/public/views/play.html';
                }
            } else {
                // No he isn't: is the room full?
                if (this.rooms[id].isFull()) {
                    // Yes it is: player can't join...
                    return '/public/views/room-full.html';
                } else {
                    // No it isn't: player can join
                    return '/public/views/play.html';
                }
            }
        } else {
            // No it doesn't: player can play in a new room
            return '/public/views/play.html';
        }
    }

    connectionHandler(socket) {
        // Get room id and player name informations from url
        var path = socket.handshake.headers.referer.split('/');
        var name = path[7], id = path[5];

        if (this.rooms[id]) {
            if (this.rooms[id].players[name]) {
                if (!this.rooms[id].players[name].socket) {
                    this.rooms[id].resumePlayer(name, socket);
                }
            } else {
                this.rooms[id].addPlayer(name, socket);
            }
        } else {
            this.rooms[id] = new Room(id, this.io);
            console.log('Room created with id', id);
            this.rooms[id].addPlayer(name, socket);
        }
    }
}
