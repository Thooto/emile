class Sprite extends THREE.Sprite {
    constructor() {
        var spriteMat = new THREE.SpriteMaterial();
        super(spriteMat);
        this.noSelect = true;

        this.cv = document.createElement('canvas');
        this.cv.width = 128;
        this.cv.height = 128;
        this.ctx = this.cv.getContext('2d');

        this.material.map = new THREE.Texture(this.cv);
    }

}

class Dice extends THREE.Group {
    constructor(index) {
        super();
        this.index = index;

        var cookie, content;

        cookie = Cookies.get('positions');
        if (cookie) content = JSON.parse(cookie);

        if (content.positions) {
            if (content.positions[index]) {
                this.position.copy(content.positions[index].p);
                this.quaternion.copy(content.positions[index].q);
            }
        } else {
            this.position.set(0,-1,0);
        }
        this.positionInReserve = undefined;

        cookie = Cookies.get('values');
        if (cookie) content = JSON.parse(cookie);
        this.value = content.faces ? content.faces[index] : undefined;
        this.reserve = false;

        var cubeGeo = this.setGeo(.1, .005);

        var cubeMat = this.setMat();

        this.cube = new THREE.Mesh(cubeGeo, cubeMat);

        this.cube.setEmissive = function(emission) {
            for (var i in this.material) {
                this.material[i].emissive = emission;
            }
        }
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;
        this.add(this.cube);

        this.sprite = new Sprite();
    }

    setGeo(h, b) {
        var g = new THREE.Geometry();

        var v = [[h,h-b,h-b], [h,h-b,b-h], [h,b-h,b-h], [h,b-h,h-b],
            [h-b,h,h-b], [h-b,h,b-h], [b-h,h,b-h], [b-h,h,h-b],
            [h-b,h-b,h], [h-b,b-h,h], [b-h,b-h,h], [b-h,h-b,h],
            [-h,h-b,h-b],[-h,h-b,b-h],[-h,b-h,b-h],[-h,b-h,h-b],
            [h-b,-h,h-b],[h-b,-h,b-h],[b-h,-h,b-h],[b-h,-h,h-b],
            [h-b,h-b,-h],[h-b,b-h,-h],[b-h,b-h,-h],[b-h,h-b,-h]];

        var f = [[0,2,1],   [0,3,2],   [4,5,6],   [4,6,7],
            [8,10,9],  [8,11,10], [12,13,14],[12,14,15],
            [16,18,17],[16,19,18],[20,21,22],[20,22,23],

            [0,4,8], [1,20,5], [6,23,13], [7,12,11],
            [3,9,16], [2,17,21], [14,22,18], [10,15,19],

            [4,7,8], [7,11,8], [0,1,5], [0,5,4],
            [5,20,23], [5,23,6], [6,12,7], [6,13,12],

            [0,8,3], [3,8,9], [10,11,15], [11,12,15],
            [13,23,22], [13,22,14], [1,2,20], [2,21,20],

            [9,10,16], [10,19,16], [2,3,17], [3,16,17],
            [14,18,15], [15,18,19], [17,22,21], [17,18,22]];

        for (var i = 0; i < v.length; i++) {
            g.vertices.push(new THREE.Vector3(v[i][0], v[i][1], v[i][2]));
        }

        for (var i = 0; i < f.length; ++i) {
            g.faces.push(new THREE.Face3(f[i][0], f[i][1], f[i][2]));
            g.faces[g.faces.length -1].materialIndex = i < 12 ? Math.floor(i/2) : 6;
        }

        for (var i = 0; i < 20; i++) {
            g.faceVertexUvs[0].push([new THREE.Vector2(0,1), new THREE.Vector2(1,0), new THREE.Vector2(1,1)]);
            g.faceVertexUvs[0].push([new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,0)]);

            g.faceVertexUvs[0].push([new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,0)]);
            g.faceVertexUvs[0].push([new THREE.Vector2(0,1), new THREE.Vector2(1,0), new THREE.Vector2(1,1)]);
        }

        g.computeBoundingBox();
        g.computeFaceNormals();

        return g;
    }

    setMat() {
        var labels = ['1', '3', '5', '6', '4', '2', undefined];
        var labelColor = '#aaaaaa';
        var diceColor = '#202020';

        function createTextTexture(text, color, backColor) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.width = 256;
            canvas.height = 256;

            if (text == undefined) {
                context.fillStyle = backColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                context.font = 96 + 'pt Arial';
                context.fillStyle = backColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillStyle = color;
                context.fillText(text, canvas.width / 2, canvas.height / 2);
            }

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            return texture;
        }

        var materials = new Array();

        for (var i = 0; i < labels.length + 1; i++)
            materials.push(new THREE.MeshStandardMaterial({map: createTextTexture(labels[i], labelColor, diceColor)}));

        return materials;
    }

    updateSprite() {
        if (!camera.down || simRunning || this.reserve) {
            this.sprite.ctx.clearRect(0, 0, this.sprite.cv.width, this.sprite.cv.height);
        } else {
            this.sprite.ctx.font = 24 + 'pt gill';
            this.sprite.ctx.clearRect(0, 0, this.sprite.cv.width, this.sprite.cv.height);
            this.sprite.ctx.textAlign = 'center';
            this.sprite.ctx.textBaseline = 'middle';
            this.sprite.ctx.fillStyle = '#ffffff';
            this.sprite.ctx.fillText(this.value, this.sprite.cv.width / 2, this.sprite.cv.height / 2);
        }
        this.sprite.material.map.needsUpdate = true;

        this.sprite.position.copy(this.position).add(new THREE.Vector3(0, camera.down ? .2 : -1, 0));
    }

    updateReserve(reserve) {

        if (reserve != this.reserve) {
            this.reserve = reserve;
            if (player) {
                if (player.name == currentName) var destination = camera;
                else var destination = opponents[currentName];
            } else var destination = camera;

            if (reserve) {

                for (var i in ui.inReserve) {
                    if (!ui.inReserve[i]) {
                        ui.inReserve[i] = this.reserve;
                        this.positionInReserve = i;

                        THREE.SceneUtils.detach(this.cube, this, scene);
                        THREE.SceneUtils.attach(this.cube, scene, destination);

                        if (destination == camera) {
                            this.cube.position.set(-.2+.1*i, -.28, -.5);
                            this.cube.scale.set(.4, .4, .4);
                        } else {
                            this.cube.position.set((-.2+.1*i)*1.5, -.025, .1);
                            this.cube.scale.set(.6, .6, .6);
                        }
                        this.showFace();

                        break;
                    }
                }
            } else {
                ui.inReserve[this.positionInReserve] = this.reserve;

                THREE.SceneUtils.detach(this.cube, destination, scene);
                THREE.SceneUtils.attach(this.cube, scene, this);

                this.cube.position.set(0, 0, 0);
                this.cube.rotation.set(0, 0, 0);
                this.cube.scale.set(1, 1, 1);
            }
        }
    }

    showFace() {
        switch (this.value) {
        case 1: this.cube.rotation.set(0, -Math.PI/2, 0); break;
        case 2: this.cube.rotation.set(Math.PI, 0, Math.PI); break;
        case 3: this.cube.rotation.set(Math.PI/2, Math.PI, 0); break;
        case 4: this.cube.rotation.set(-Math.PI/2, -Math.PI/2, 0); break;
        case 5: this.cube.rotation.set(0, 0, Math.PI/2); break;
        case 6: this.cube.rotation.set(Math.PI/2, Math.PI, -Math.PI/2); break;
        }
    }
}
