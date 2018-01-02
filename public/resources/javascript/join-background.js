class Dice extends THREE.Mesh {
    constructor(vel) {

        function setGeo(h, b) {
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

        function setMat() {
            var labels = ['1', '3', '5', '6', '4', '2', undefined];
            var labelColor = '#aaaaaa';
            var diceColor = '#202020';

            function createTextTexture(ind, text, color, backColor) {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                canvas.width = 256;
                canvas.height = 256;

                if (text == undefined) {
                    context.fillStyle = context.createPattern(images[ind], "no-repeat");
                    context.fillRect(0, 0, canvas.width, canvas.height);
                } else {
                    context.font = 120 + 'pt Arial';
                    context.fillStyle = context.createPattern(images[ind], "no-repeat");
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

            for (var i = 0; i < labels.length; i++)
                materials.push(new THREE.MeshStandardMaterial({map: createTextTexture(i, labels[i], labelColor, diceColor)}));

            return materials;
        }

        var cubeGeo = setGeo(.6, .06);

        var cubeMat = setMat();

        super(cubeGeo, cubeMat);

        this.vel = vel;
    }
}

var renderer, scene, camera;

var dices;

var light, ambient, light2;

var d;
var a = Math.sin(30 * Math.PI / 180);
var number = 20;

var images = new Array(7);
for (var i = 0; i<7; i++){
    images[i] = new Image();
    images[i].src = `/../images/marble${i}.jpg`;
}


$(window).on('load', function() {
    initialize();
    animate();
});

function initialize() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(Cookies.get('high quality') == 'yes' ? 1 : .25);
    renderer.setSize(window.innerWidth, window.innerHeight);
    $('#dices').append(renderer.domElement);
    renderer.setClearColor(0x050505, 1);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, 10, 80);

    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(30, aspect, .01, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(scene.position);

    light = new THREE.PointLight(0xffaa88, 1);
    light.position.set(5, 10, 5);
    scene.add(light);

    light2 = new THREE.PointLight(0x88aaff, 1);
    light2.position.set(-3, -6, 0);
    scene.add(light2);

    ambient = new THREE.AmbientLight(0xffffff, 0.65);
    ambient.position.set(0, 10, 0);
    scene.add(ambient);

    dices = new Array(number);

    for (var i = 0; i < number; i++) {
        d = Math.random()*60;
        dices[i] = new Dice(Math.random()*.5+.5);
        dices[i].position.set(Math.random() * 70,
                              (Math.random()-.5)*d/2+Math.random()*5-2.5,
                              -d);
        dices[i].rotation.set(d,d,d);
        scene.add(dices[i]);
    }

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);

    for (var i = 0; i<number; i++) {
        dices[i].position.x -= dices[i].vel*.04;
        if (dices[i].position.x < (dices[i].position.z-20) * a) {
            dices[i].position.x = (-dices[i].position.z +20) * a+ Math.random() * 10;
            dices[i].position.y = (Math.random()-.5)*dices[i].position.z+Math.random()*5-2.5;
        }
        dices[i].rotation.x += dices[i].vel > .75 ? 0.01 : -.01;
        dices[i].rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
