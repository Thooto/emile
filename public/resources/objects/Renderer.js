class Renderer extends THREE.WebGLRenderer {
    constructor() {
        super({antialias: true});
        this.setPixelRatio(Cookies.get('high quality') == 'yes' ? 1 : .5);
        this.setSize(window.innerWidth, window.innerHeight);

        this.shadowMap.enabled = true;
        this.shadowMap.type = THREE.PCFSoftShadowMap;

        $('#game-three').append(this.domElement);
    }
}
