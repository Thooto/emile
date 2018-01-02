var Player = require('./Player');
var Emile = require('./Emile');

module.exports = class {
    constructor(id, io) {
        this.id = id;
        this.io = io;
        this.players = {};
        this.number = 0;
        this.emile = new Emile(this);
    }

    isFull() {
        return this.number >= 4;
    }

    addPlayer(name, socket) {
        console.log('Player added to room', this.id, 'with name', name);
        this.players[name] = new Player(name, socket, this.number, this);
        this.players[name].socket.join(this.id);
        this.players[name].socket.emit('connected', {name: name, id: this.id, index: this.number, score: this.emile.scores[this.number], reserve: this.emile.reserve});
        this.number++;

        this.players[name].socket.broadcast.to(this.id).emit('opponent joined', {index: this.players[name].index, name: name, score: this.emile.scores[this.players[name].index]});

        // Send player information for each opponent
        for (var i in this.players) {
            if (this.players[i].name != name) {
                this.players[name].socket.emit('opponent joined', {index: this.players[i].index,
                                                                   name: this.players[i].name,
                                                                   score: this.emile.scores[this.players[i].index]});
            }
        }

        // If room full, start game
        if (this.number == 4) {
            for (var i in this.players) {
                if (this.players[i].index == 0) {
                    this.emile.currentPlayer = this.players[i];
                    break;
                }
            }

            this.io.to(this.id).emit('game can start', {current: this.emile.currentPlayer.name});
        }
    }

    resumePlayer(name, socket) {
        console.log('Player', name, 'resumed in room', this.id);
        this.players[name].refreshSocket(socket);
        this.players[name].socket.join(this.id);
        this.players[name].socket.emit('connected', {name: name,
                                                     id: this.id,
                                                     index: this.players[name].index,
                                                     score: this.emile.scores[this.players[name].index],
                                                     reserve: this.emile.reserve});

        for (var i in this.players) {
            if (this.players[i].name != name) {
                this.players[name].socket.emit('opponent joined', {index: this.players[i].index, name: this.players[i].name, score: this.emile.scores[this.players[i].index]});
            }
        }

        if (this.number == 4) {
            if (this.emile.currentPlayer) this.players[name].socket.emit('game can start', {current: this.emile.currentPlayer.name});
        }

    }
}
