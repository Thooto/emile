$(function(){
    // Make connection
    var socket = io.connect(window.location.origin);


    //Query DOM
    var resultsWindow = document.getElementById('results'),
        $doc = $(document);

    //Player variables
    var gameId;
    var playerName;


    socket.on('connected', function(data){
        console.log('You are connected!');
        //Set a 5-minute cookie to tell if the player is connected
        var inFiveMinutes = new Date(new Date().getTime() + 5 * 60 * 1000);
        Cookies.set('connected', '1', {expires: inFiveMinutes});
        gameId = data.gameId;
        playerName = data.playerName;
    });

    //When the player's request has been processed by the server, a message is sent to the client console
    socket.on('playerJoinedRoom', function(data){
        console.log(data.playerName + ' joined the room');
    });

    //When the room has 2 players in it, the game interface is displayed
    socket.on('roomIsFull', function(data){
        //Cookies.set('playerData', data);
        console.log('Room is full!');
    });

    socket.on('playerResume', function(){
        console.log('I resumed!');
    });

    //When the roll button is clicked, a 'playerRoll' event is sent to the server
    $doc.on('click', '#btnRoll', function(){
        console.log('I clicked roll!');
        var data = {gameId: gameId, playerName: playerName};
        console.log(data);
        socket.emit('playerRoll', data);
    });

    //When the resume button is clicked, a 'playerResume' event is sent to the server
    $doc.on('click', '#btnResume', function(){
        console.log('I clicked resume!');
        var data = {gameId: $('#inputGameId').val(), playerName: $('#inputPlayerName').val()};
        if (data.gameId === ''){
            alert('Please type a room name!');
        }
        else if(data.playerName === ''){
            alert('Please type a player name!');
        }
        else{
            gameId = data.gameId;
            playerName = data.playerName;
            socket.emit('playerResume', data);
        }
    });

    //When the get results button is clicked, a 'playerWantsResults' event is sent to the server
    $doc.on('click', '#btnGetResults', function(){
        console.log('I want results!');
        var data = {gameId: gameId, playerName: playerName};
        console.log(data);
        socket.emit('playerWantsResults', data);
    });

    //When the dice has been rolled by the server, it sends back its value which can be displayed on the client's screen
    socket.on('playerRolled', function (data){
        _diceValue = data.value; // Needed to display the dice value in three js
        resultsWindow.innerHTML += '<p> Player ' + data.playerName + ' got a <strong>' + data.value + '</strong>!</p>';
        resultsWindow.scrollTop = resultsWindow.scrollHeight;
    });

    //When the duel has been processed by the server, it sends back the name of the winner which can be displayed on the client's screen
    socket.on('showResults', function(data){
        if (data.draw) {
            resultsWindow.innerHTML += '<p>It\'s a draw!</p>';
        }
        else {
            resultsWindow.innerHTML += '<p> Player ' + data.winnerName + ' won!</p>';
        }
        resultsWindow.scrollTop = resultsWindow.scrollHeight;
    });

    socket.on('alreadyInTheRoom', function(data){
        alert('Player ' + data.playerName + ' is already in the room ' + data.gameId + '. You cannot resume a game you are still playing in.');
    });
});
