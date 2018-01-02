module.exports = class {
    constructor(name, socket, index, room) {
        this.name = name;
        this.index = index;
        this.socket = socket;
        this.socket.player = this;
        this.setSocketFunctions();
        this.room = room;
    }

    refreshSocket(socket) {
        this.socket = socket;
        this.socket.player = this;
        this.socket.join(this.room.id);
        this.setSocketFunctions();
    }

    setSocketFunctions() {
        this.socket.on('roll dices', function() {
            this.player.rollDices();
        });

        this.socket.on('end turn', function(data) {
            this.player.endTurn(data.name);
        });

        this.socket.on('update dice', function(data) {
            this.player.updateDice(data.index);
        });

        this.socket.on('disconnect', function() {
            this.player.disconnect();
        });
    }

    endTurn(name) {
        var action = this.room.emile.updateScore(this, name);
        if (action.can) {
            if (action.gameOver) this.room.io.to(this.room.id).emit('game over', {winner: name, scores: this.room.emile.scores});
            this.room.emile.nextPlayer(this);
            this.room.io.to(this.room.id).emit('dice updated', {reserve: this.room.emile.reserve});
            this.room.io.to(this.room.id).emit('end turn', {currentPlayerName: this.room.emile.currentPlayer ? this.room.emile.currentPlayer.name : '', scores: this.room.emile.scores, tixedPlayerName: action.tixedPlayerName});
        } else {
            this.socket.emit('not allowed', {reason: action.reason});
        }
    }

    rollDices() {
        var action = this.room.emile.rollDices(this);
        if (action.can) {
            this.room.io.to(this.room.id).emit('dices rolled', {coordinates: action.coordinates, faces: action.faces, reserve: action.reserve});
            var data = this.room.emile.checkEnd(this)
            if (data.stuck) {
                this.socket.emit('cannot play anymore');
                this.socket.emit('potential updated', {potentialScore: data.deltaScore, timeout: 4000});
            }
        } else {
            this.socket.emit('not allowed', {reason: action.reason});
        }
    }

    updateDice(index) {
        var action = this.room.emile.updateDice(this, index);
        if (action.can) {
            this.socket.emit('potential updated', {potentialScore: action.potentialScore});
            this.room.io.to(this.room.id).emit('dice updated', {reserve: action.reserve, tip: action.tip});
        } else {
            this.socket.emit('not allowed', {reason: action.reason});
        }
    }

    disconnect() {
        console.log('lost connection with', this.name);
        delete this.socket;
        /*
        Does the socket room still exist? If it's empty then delete the room from the server
        * if (!this.io.sockets.adapter.rooms[id]) {
        *    delete this;
        * }
        */
    }
}
