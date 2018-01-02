var PHYSICS = require('./../javascript/physics');


module.exports = class {
    constructor(room) {
        this.room = room;
        this.scores = new Array(4).fill(-2500);
        this.dices = new Array(5).fill(0);
        this.reserve = new Array(5).fill(false);
        this.inBrelan = new Array(5).fill(false);
        this.currentPlayer;
        this.potentialScore = 0;
        this.previousPotentialScore = undefined;
        this.deubeul = false;
        this.stuck = false;
        this.brelanOnes = 0;
        this.brelanFives = 0;
        this.brelanType = 0;
        this.inStraight = false;
        this.gameOver = false;
    }

    updateScore(player, name) {
        if (player == this.currentPlayer) {
            if (this.previousPotentialScore < this.potentialScore || this.stuck) {

                var reserveLength = 0;
                for (var i in this.reserve) if (this.reserve[i]) reserveLength++;
                if (reserveLength != 5) {

                    var tempScore = this.scores[this.room.players[name].index];

                    if (this.stuck) {
                        if (reserveLength == 0) {
                            tempScore += this.currentPlayer.name == name ? -1000 : 500;
                        } else {
                            tempScore += this.currentPlayer.name == name ? -100 : 100;
                        }
                    } else tempScore += this.currentPlayer.name == name ? this.potentialScore : -this.potentialScore / 2;

                    if (tempScore < -2500) tempScore = -2500 - (2500 + tempScore);
                    if (tempScore > 2500) tempScore = 2500 - (tempScore - 2500);

                    this.scores[this.room.players[name].index] = tempScore;

                    var tixedPlayerName = undefined;
                    for (var n in this.room.players) {
                        if (this.scores[this.room.players[name].index] == this.scores[this.room.players[n].index] && n != name) {
                            this.scores[this.room.players[n].index] = 0;
                            tixedPlayerName = this.room.players[n].name;
                        }
                    }

                    if (tempScore == 2500) {
                        this.gameOver = true;
                        return {can: true, gameOver: true};
                    } else return {can: true, gameOver: false, tixedPlayerName: tixedPlayerName};
                } else return {can: false, reason: 'reserve full, roll again'};
            } else return {can: false, reason: 'score must be > than before'};
        } else {
            if (this.room.isFull()) {
                return {can: false, reason: 'not your turn'};
            } else {
                return {can: false, reason: 'room not full'};
            }
        }
    }

    // Called once a 2, 3, 4 or 6 is clicked
    brelan(index) {

        // Add the clicked dices to a temp reserve named positions
        var count = 0, positions = [];
        positions[index] = true;
        for (var i in this.dices) {
            if (this.dices[i] == this.dices[index] && !this.reserve[i] && i != index) {
                positions[i] = true;
                count++;
            }
            if (count == 2) break;
        }

        // If there are the same 3 dices in the temp reserve, we tell there's a brelan
        if (count == 2) return {in: true, pos: positions};
        return {in: false};
    }

    straight() {
        // We check if the dices array contains 1, 2, 3, 4, 5 or 2, 3, 4, 5, 6
        for (var i in this.reserve) if (this.reserve[i]) return {in: false};

        return {in: (this.dices.includes(1) && this.dices.includes(2) && this.dices.includes(3) && this.dices.includes(4) && this.dices.includes(5)) ||
                    (this.dices.includes(6) && this.dices.includes(2) && this.dices.includes(3) && this.dices.includes(4) && this.dices.includes(5))};
    }

    getScore(value, add) {
        var total;
        switch (value) {
            case 5:
                if (add) this.brelanFives++;
                total = this.brelanFives == 3 ? 400 : 50;
                break;
            case 1:
                if (add) this.brelanOnes++;
                total = this.brelanOnes == 3 ? 500 : 100;
                break;
            case 2: total = 200; break;
            case 3: total = 300; break;
            case 4: total = 400; break;
            case 6: total = 600; break;
            case 'straight': total = 1000; break;
        }
        return total;
    }

    //Check if the player can go on playing or not
    checkEnd(player) {
        for (var i in this.dices) {
            if (!this.reserve[i]) {
                if (this.dices[i] == 1 || this.dices[i] == 5 || this.brelan(i).in) {
                    this.stuck = false;
                    return this.stuck;
                }
            }
        }
        this.stuck = true;

        //For reserve score updating if stuck
        var reserveLength = 0;
        for (var i in this.reserve) if (this.reserve[i]) reserveLength++;

        if (reserveLength == 0) return {stuck: this.stuck, deltaScore: -1000};
        else return {stuck: this.stuck, deltaScore: -100};
    }

    nextPlayer(player) {
        //Finds and defines the new current player, resets turn
        var newIndex = (this.currentPlayer.index + 1) % 4;

        this.potentialScore = 0;
        this.previousPotentialScore = undefined; //To make it work at the first round
        this.stuck = false;
        this.brelanOnes = 0;
        this.brelanFives = 0;
        this.brelanType = 0;
        this.deubeul = false;

        if (!this.gameOver) { //Look for the next player {
            for (var i in this.room.players) {
                if (this.room.players[i].index == newIndex) {
                    this.currentPlayer = this.room.players[i];
                    break;
                }
            }
        } else this.currentPlayer = undefined; //else the game is stopped

        this.dices.fill(0);
        this.inBrelan.fill(false);
        this.reserve.fill(false);
    }

    rollDices(player) {
        /* TODO With this implementation we cannot choose to remove the dice we want, we can only remove the last dice of the reserve */

        if (player == this.currentPlayer) {
            /* At first, prevPotScore = undefined. Javascript comparison btw undefined and integers returns false in all cases. Exploiting this javascript loophole to only let the player roll dices the first time */
            if (!(this.previousPotentialScore >= this.potentialScore)) {
                if (!this.stuck) {

                    //Deubeul
                    var reserveLength = 0;
                    for (var i in this.reserve) if (this.reserve[i]) reserveLength++;

                    this.previousPotentialScore = this.potentialScore;

                    if (reserveLength == 5) {
                        this.reserve.fill(false);
                        this.inBrelan.fill(false);
                        this.brelanOnes = 0;
                        this.brelanFives = 0;
                        this.brelanType = 0;
                        this.deubeul = false;
                        reserveLength = 0;
                    }

                    if (reserveLength == 4) {
                        this.deubeul = true;
                    } else {
                        this.deubeul = false;
                    }

                    //These two loops tell if the dices are part of a brelan or not
                    if (this.brelanFives >= 3) {
                        var j = 0;
                        for (var i in this.dices) {
                            if (this.reserve[i] && this.dices[i] == 5) {
                                this.inBrelan[i] = true;
                                j++;
                            }
                            if (j >= 3) break;
                        }
                    }

                    if (this.brelanOnes >= 3) {
                        var j = 0;
                        for (var i in this.dices) {
                            if (this.reserve[i] && this.dices[i] == 1) {
                                this.inBrelan[i] = true;
                                j++;
                            }
                            if (j >= 3) break;
                        }
                    }

                    if (this.brelanType) {
                        var j = 0;
                        for (var i in this.dices) {
                            if (this.reserve[i] && this.dices[i] == this.brelanType) {
                                this.inBrelan[i] = true;
                                j++;
                            }
                            if (j >= 3) break;
                        }
                    }

                    this.brelanFives = 0, this.brelanOnes = 0, this.brelanType = 0;

                    var roll = PHYSICS.simulate(this.reserve);

                    for (var i in this.reserve) {
                        if (!this.reserve[i]) {
                            this.dices[i] = roll.faces[i];
                        }
                    }

                    return {can: true, coordinates: roll.coordinates, faces: this.dices, reserve: this.reserve};

                } else return {can: false, reason: 'you\'re stuck :('};
            } else return {can: false, reason: 'score must be > than before'};
        } else {
            if (this.room.isFull()) {
                return {can: false, reason: 'not your turn'};
            } else {
                return {can: false, reason: 'room not full'};
            }
        }
    }

    updateDice(player, index) {
        var response = {};

        if (player == this.currentPlayer) {
            if (!this.stuck) {
                if (this.dices[index]) {
                    //If the clicked dice is already in reserve, reset the reserve and put it out
                    if (this.reserve[index]) {
                        if (this.inStraight) {
                            this.potentialScore -= this.getScore('straight', false);
                            this.inStraight = false;
                            this.reserve.fill(false);
                            response = {can: true, reserve: this.reserve, potentialScore: this.potentialScore};
                        } else if (!this.inBrelan[index]) {
                            this.reserve[index] = false;

                            if (this.deubeul) this.potentialScore /= 2;
                            this.potentialScore -= this.getScore(this.dices[index], false);

                            if (this.dices[index] == 5) this.brelanFives--;
                            if (this.dices[index] == 1) this.brelanOnes--;
                            if (this.dices[index] == this.brelanType) {
                                for (var i in this.dices) {
                                    if (this.reserve[i] && this.dices[i] == this.brelanType) this.reserve[i] = false;
                                }
                                this.brelanType = 0;
                            }

                            response = {can: true, reserve: this.reserve, potentialScore: this.potentialScore};
                        } else {
                            response = {can: false, reason: 'dice part of a brelan'};
                        }
                        //else it means you want to put it in the reserve
                    } else {
                        var br = this.brelan(index);
                        var st = this.straight();

                        // To change priority of combinations, juste change the order in the following if else if
                        if (this.dices[index] == 5 || this.dices[index] == 1) {

                            this.reserve[index] = true;

                            this.potentialScore += this.getScore(this.dices[index], true);
                            if (this.deubeul) this.potentialScore *= 2;

                            if (br.in) response.tip = 'brelan available, 1 & 5 priority';
                            if (st.in) response.tip = 'straight available, 1 & 5 priority';
                            if (this.deubeul) response.tip = 'deubeul successful! roll again';

                            response = {can: true, reserve: this.reserve, potentialScore: this.potentialScore};

                        } else if (br.in) {
                            this.brelanType = this.dices[index];

                            for (var i in br.pos) this.reserve[i] = br.pos[i];

                            this.potentialScore += this.getScore(this.dices[index], false);

                            response = {can: true, reserve: this.reserve, potentialScore: this.potentialScore};
                        } else if (st.in) {
                            this.reserve.fill(true);
                            this.inStraight = true;
                            this.potentialScore += this.getScore('straight');
                            response = {can: true, reserve: this.reserve, potentialScore: this.potentialScore};
                        } else {
                            if (this.deubeul) {
                                this.potentialScore = 0;
                                this.deubeul = false;
                            }

                            response = {can: false, reason: 'not a marking dice'};
                        }
                    }
                } else {
                    response = {can: false, reason: 'dices not rolled yet'};
                }
            } else response = {can: false, reason: 'you are stuck'};
        } else {
            response = {can: false, reason: 'not your turn'};
        }

        if (response.can) response.potentialScore = this.potentialScore;

        return response;
    }
}
