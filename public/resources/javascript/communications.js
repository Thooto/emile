function initConnection() {
    socket = io.connect(window.location.origin);

    socket.on('connected', function(data) {
        for (var i in dices) dices[i].updateReserve(data.reserve[i]);
        logger('connected');
        ui.updateScore(data.score);
        addSelf(data.name, data.index, data.score);
        $('title').html('emile.io - '+ data.name);
    });

    socket.on('end turn', function(data) {
        // Opponents scores updating
        for (var i in opponents) {
            opponents[i].updateScore(data.scores[opponents[i].index]);
        }
        // Player score updating
        player.score = data.scores[player.index];
        ui.updateScore(player.score);
        ui.updatePotentialScore(0);
        // Some player got tixed!
        if (data.tixedPlayerName) logger(data.tixedPlayerName == player.name ? 'You got tixed!' : data.tixedPlayerName + ' got tixed!');
        // Next turn
        currentName = data.currentPlayerName;
        $('#current-player').html(data.currentPlayerName);
    });

    socket.on('opponent joined', function(data) {
        logger(data.name + ' joined at position ' + data.index);
        addPlayer(data.name, data.index, data.score);
    });

    socket.on('game can start', function(data) {
        currentName = data.current;
        $('#current-player').html(data.current);
        logger('game can start');
    });

    socket.on('dices rolled', function(data) {
        logger('dices rolled');
        coordinates = data.coordinates;
        Cookies.set('positions', JSON.stringify({positions: coordinates[coordinates.length-1]}));
        Cookies.set('values', JSON.stringify({faces: data.faces}));
        for (var i in dices) {
            dices[i].updateReserve(data.reserve[i]);
            dices[i].value = data.faces[i];
        }
        resetSim();
    });

    socket.on('not allowed', function(data) {
        logger(data.reason);
    });

    socket.on('potential updated', function(data) {
        if (data.timeout) setTimeout(function() { ui.updatePotentialScore(data.potentialScore); }, data.timeout);
        else ui.updatePotentialScore(data.potentialScore);
    });

    socket.on('dice updated', function(data) {
        for (var i in dices) dices[i].updateReserve(data.reserve[i]);
        if (data.tip) logger(data.tip);
    });

    socket.on('cannot play anymore', function(data) {
        setTimeout(function() { logger('You can\'t play anymore'); }, 2000);

        setTimeout(function() { logger('Please affect the points'); }, 4000);
    });

    socket.on('game over', function(data) {
        logger('Game is over!');

        player.score = data.scores[player.index];
        for (var i in opponents) opponents[i].updateScore(data.scores[opponents[i].index]);

        rank = [[player.name, player.score]];
        for (var i in opponents) {
            rank.push([opponents[i].nickname, opponents[i].value]);
        }
        rank.sort(function(a, b) { return b[1] - a[1] });

        for (var i in rank) {
            var pos = parseInt(i) + 1;
            $('#results').append(pos + ' - ' + rank[i][0] + ' - ' + rank[i][1]+'<br>');
        }

        $('#game-end').css({'visibility':'visible', 'animation':'appear 1s'});
    });
}
