class Scene extends THREE.Scene {
    constructor(background) {
        super();
        if (background) {
            this.background = new THREE.Color(0x050505);
            this.fog = new THREE.FogExp2(this.background, .2);
        }
    }
}
