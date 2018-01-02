// Global variables for the game
var renderer;
var scene, camera, ui;

var raycaster, mouse, timer, intersected, latest;
var emission = {r: .6, g: .55, b: .7};

var light1, light2, ambient, ground;

var socket;
var player;
var opponents = {};
var currentName;

var dices = new Array(5).fill(undefined);
var coordinates = [];
var simStep, simRunning;

// When page loaded: start game
$(window).on('load', function() {
    initGame();
    initEvents();
    initConnection();
    animate();
});

function initGame() {
    simStep = 1;
    simRunning = false;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    renderer = new Renderer();
    scene = new Scene(true);

    camera = new Camera();
    scene.add(camera);

    ui = new UI();
    camera.add(ui);

    light1 = new PointLight(0, 2, -1, 0xffaa88);
    scene.add(light1);

    light2 = new PointLight(0, 2, 1, 0x6688ee);
    scene.add(light2);

    ambient = new THREE.AmbientLight(0x88aaff, .7);
    scene.add(ambient);

    ground = new Ground();
    scene.add(ground);

    for (var i in dices) {
        dices[i] = new Dice(i);
        scene.add(dices[i]);
        scene.add(dices[i].sprite);
    }
}

function animate() {
    requestAnimationFrame(animate);

    camera.update();

    if (simRunning) updateSim();

    for (var i in opponents) opponents[i].update();

    for (var i in dices) dices[i].updateSprite();

    renderer.render(scene, camera);
}
