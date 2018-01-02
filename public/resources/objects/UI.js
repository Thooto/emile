class Player {
    constructor(name, index, score) {
        this.name = name;
        this.index = index;
        this.score = score;
    }
}

class UI extends THREE.Group {
    constructor() {
        super();
        this.score = 'game not started';

        this.inReserve = new Array(5).fill(false);

        var reserveMat = new THREE.MeshBasicMaterial({color: 0x060606, transparent: true, opacity: 0.75});
        var reserveGeo = new THREE.PlaneGeometry(.5, .1);
        this.reserve = new THREE.Mesh(reserveGeo, reserveMat);
        this.reserve.position.set(0, -.28, -.5);
        this.reserve.noSelect = true;
        this.add(this.reserve);

        var rollGeo = new THREE.PlaneGeometry(.1, .1);
        var rollMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('/images/roll-01.png'), transparent: true, opacity: 0.7});

        this.roll = new THREE.Mesh(rollGeo, rollMat);
        this.roll.position.set(.32, -.28, -.5);

        this.roll.setEmissive = function(emission) {
            this.material.opacity = emission.r + emission.g + emission.b == 0 ? .7 : 1;
        }

        this.add(this.roll);

        var endGeo = new THREE.PlaneGeometry(.1, .1);
        var endMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('/images/end-01.png'), transparent: true, opacity: 0.7});

        this.end = new THREE.Mesh(endGeo, endMat);
        this.end.position.set(-.32, -.28, -.5);

        this.end.setEmissive = function(emission) {
            this.material.opacity = emission.r + emission.g + emission.b == 0 ? .7 : 1;
        }

        this.add(this.end);

        this.scoreTex = new THREE.Texture(this.setCanvas(this.score));
        this.scoreTex.needsUpdate = true;
        var scoreGeo = new THREE.PlaneGeometry(.28, .07);
        var scoreMat = new THREE.MeshBasicMaterial({map: this.scoreTex, transparent: true, opacity: 1});

        this.scoreMesh = new THREE.Mesh(scoreGeo, scoreMat);
        this.scoreMesh.position.set(0, -.165, -.45);
        this.scoreMesh.noSelect = true;
        this.add(this.scoreMesh);

        this.potentialTex = new THREE.Texture(this.setCanvas(0));
        this.potentialTex.needsUpdate = true;
        var potentialGeo = new THREE.PlaneGeometry(.16, .04);
        var potentialMat = new THREE.MeshBasicMaterial({map: this.potentialTex, transparent: true, opacity: 1});

        this.potentialMesh = new THREE.Mesh(potentialGeo, potentialMat);
        this.potentialMesh.position.set(0, -.195, -.45);
        this.potentialMesh.noSelect = true;
        this.add(this.potentialMesh);
    }

    updateScore(score) {
        this.score = score;
        this.scoreMesh.material.map = new THREE.Texture(this.setCanvas(score));
        this.scoreMesh.material.map.needsUpdate = true;
    }

    updatePotentialScore(score) {
        this.potentialMesh.material.map = new THREE.Texture(this.setCanvas(score));
        this.potentialMesh.material.map.needsUpdate = true;
    }

    setCanvas(text) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = 512;
        canvas.height = 128;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        var textSize = context.measureText(text).width;
        var fontSize = 72;
        context.font = fontSize + 'px gill';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        return canvas;
    }
}
