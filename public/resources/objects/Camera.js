class Camera extends THREE.PerspectiveCamera {
    constructor() {
        super(70, window.innerWidth / window.innerHeight, .01, 100);
        this.look = new THREE.Vector3();
        this.down = true;
        this.y = 1.5;
        this.z = 2;
        this.position.set(0, 1.5, 2);
        this.lookAt(new THREE.Vector3(0, 1, 0).add(scene.position));
    }

    update() {
        if (mouse.y > .75) this.y = 1.5, this.z = 2, this.down = true;
        if (mouse.y < -.5) this.y = 2.5, this.z = .5, this.down = false;

        this.position.x += (mouse.x * (2.5 - this.position.y) * .25 - this.position.x) / 5;
        this.position.y += (this.y - this.position.y) / 15;
        this.position.z += (this.z - this.position.z) / 15;

        this.look.x += (mouse.x * (2.5 - this.position.y) - this.look.x) / 3;
        this.look.y += (mouse.y * (2.5 - this.position.y) - this.look.y) / 3;

        this.lookAt(this.look);
    }
}
