// Simulation function(s)

/* TODO
Replace {pi:, qi:, ...} with {p: {p1:, p2:, ...}, q: {q1:, q2:, ...}}
And for (var i = 0 ...) with for (var i in ...)
*/

// Require physics module
var CANNON = require('cannon');

// Creating global materials for objects
var diceMat = new CANNON.Material();
var groundMat = new CANNON.Material();
var barrierMat = new CANNON.Material();

// Main function, runs simulation for desired dices
function simulate(reserve) {

    var coordinates = new Array(); // Step-by-step coordinates of thrown dices
    var timeStep = 1.0 / 60.0; // Timestep for simulation

    // Init the simulation world and its parameters
    var world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    world.addContactMaterial(new CANNON.ContactMaterial(groundMat, diceMat, {friction: .1, restitution: .5}));
    world.addContactMaterial(new CANNON.ContactMaterial(barrierMat, diceMat, {friction: 0, restitution: .5}));
    world.addContactMaterial(new CANNON.ContactMaterial(diceMat, diceMat, {friction: .01, restitution: .5}));

    // Defining borders for dices to bounce on so they don't go offscreen
    var barrier1 = new CANNON.Body({
        mass: 0,
        material: barrierMat,
        position: new CANNON.Vec3(1.5, 0, 0),
        quaternion: new CANNON.Quaternion().setFromEuler(0, -Math.PI/2, 0),
        shape: new CANNON.Plane(),
    });
    world.add(barrier1);

    var barrier2 = new CANNON.Body({
        mass: 0,
        material: barrierMat,
        position: new CANNON.Vec3(-1.5, 0, 0),
        quaternion: new CANNON.Quaternion().setFromEuler(0, Math.PI/2, 0),
        shape: new CANNON.Plane(),
    });
    world.add(barrier2);

    var barrier3 = new CANNON.Body({
        mass: 0,
        material: barrierMat,
        position: new CANNON.Vec3(0, 0, -1.5),
        quaternion: new CANNON.Quaternion().setFromEuler(0, 0, 0),
        shape: new CANNON.Plane(),
    });
    world.add(barrier3);

    var ground = new CANNON.Body({
        mass: 0,
        material: groundMat,
        position: new CANNON.Vec3(0, 0, 0),
        quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI/2, 0, 0),
        shape: new CANNON.Plane()
    });
    world.add(ground);

    // Defining dices
    var dices = [];
    for (var i in reserve) {
        if (!reserve[i]) {
            dices[i] = initDice();
        }
    }

    for (var i in dices) world.add(dices[i]);

    // Main simulation loop, stops when dices don't move anymore
    while (!hasEnded(coordinates[coordinates.length-2], coordinates[coordinates.length-1])) {
        world.step(timeStep);

        var sequence = {};

        for (var i in dices) {
            sequence[i] = {p: new CANNON.Vec3().copy(dices[i].position),
                       q: new CANNON.Quaternion().copy(dices[i].quaternion)};
        }

        coordinates.push(sequence);
    }

    // Get which faces are up
    var faces = getFaces(coordinates[coordinates.length-1]);
    for (var i in faces) {
        if (faces[i] == undefined) return simulate(reserve); // If some can't be calculated, restarts simulation
    }

    // Returns coordinates and faces
    return {coordinates: coordinates, faces: faces};
}

// Function to init dices
function initDice() {
    var dice = new CANNON.Body({
        mass: 1,
        material: diceMat,
        position: new CANNON.Vec3(Math.random()*.5+.8, Math.random()*.25+.5, 2.5),
        quaternion: new CANNON.Quaternion().setFromEuler(Math.random(), Math.random(), Math.random()),
        velocity: new CANNON.Vec3(-2+Math.random(), Math.random(), -4-Math.random()*2),
        angularVelocity: new CANNON.Vec3(Math.random(), Math.random(), Math.random()).mult(8),
        shape: new CANNON.Box(new CANNON.Vec3(.1, .1, .1))
    });

    return dice;
}

// Determine if dices are immobile, cp means coordinates previous, cn coordinates next
function hasEnded(cp, cn) {
    var l = .0001;
    if (cp) {
        for (var i in cn) {
            if (cp[i].p.distanceTo(cn[i].p) > l) {
                return false;
            }
        }
        return true;
    } else return false;
}

// Get faces looking up
function getFaces(c) {
    var faces = [];

    for (var i in c) {
        var a = new CANNON.Vec3();
        c[i].q.toEuler(a);
        faces[i] = getFace(a);
    }

    return faces;
}

// Number-to-face mapping
function getFace(a) {
    var l = .01;

    if (a.distanceTo(new CANNON.Vec3(0, a.y,  Math.PI/2)) < l) return 1; //+X
    if (a.distanceTo(new CANNON.Vec3(0, a.y, -Math.PI/2)) < l) return 6; //-X
    if (a.distanceTo(new CANNON.Vec3(0, a.y,          0)) < l) return 3; //+Y
    if (a.distanceTo(new CANNON.Vec3(Math.PI, a.y,    0)) < l) return 4; //-Y
    if (a.distanceTo(new CANNON.Vec3(-Math.PI/2, a.y, 0)) < l) return 5; //+Z
    if (a.distanceTo(new CANNON.Vec3(Math.PI/2,  a.y, 0)) < l) return 2; //-Z

    return undefined;
}

// Exports
module.exports.simulate = simulate;
