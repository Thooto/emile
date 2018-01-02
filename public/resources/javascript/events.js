// Main init events function
function initEvents(){
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    //window.setInterval(askPosition(), 1000);
    //window.setInterval(emitPosition(), 1000);
}

// When window is resized
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// When mouse moves
function onDocumentMouseMove(event) {
    event.preventDefault();

    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = - event.clientY / window.innerHeight * 2 + 1;

    updateIntersected();
}

// When mouse clicked
function onDocumentMouseDown(event) {
    emission = {r: 1, g: .8, b: .8};
    if (intersected) if (intersected.setEmissive) intersected.setEmissive(emission);

    timer = Date.now();
}

// When click released
function onDocumentMouseUp(event) {

    emission = {r: .6, g: .55, b: .7};
    if (intersected) if (intersected.setEmissive) intersected.setEmissive(emission);

    if (Date.now() < timer + 500) {
        //logger('click logged');

        for (var i in dices) {
            if (intersected == dices[i].cube) {
                updateDice(i);
                break;
            }
        }

        for (var i in opponents) {
            if (intersected == opponents[i].tix) {
                handleChoice(opponents[i].nickname);
            }
        }

        if (intersected == ui.roll) rollDices();

        if (intersected == ui.end) handleChoice(player.name);

    } else {
        logger('click timed out');
    }
}

// When key pressed
function onDocumentKeyDown(event) {
    switch (event.keyCode) {
    case 37: diceCam.rotation.x += .1; break; //L
    case 40: diceCam.rotation.y += .1; break; //D
    case 39: diceCam.rotation.z += .1; break; //R
    //case 38: diceCam.rotation.x += .1; break; //U
    case 32: rollDices(); break;
    }
}

$('#back-button').on('click', function(event) {
    window.location = window.location.origin + '/join';
});
