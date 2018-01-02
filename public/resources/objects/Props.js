class PointLight extends THREE.PointLight {
    constructor(x, y, z, color, strength) {
        super(color || 0xffffff, strength || .9);
        this.castShadow = true;
        this.shadow.mapSize.width = 512;
        this.shadow.mapSize.height = 512;
        this.position.set(x, y, z);
    }
}

class Ground extends THREE.Mesh {
    constructor() {
        var groundGeo = new THREE.PlaneGeometry(200, 200);
        var groundMat = new THREE.MeshStandardMaterial({color: 0x505050, roughness: 0.8});

        super(groundGeo, groundMat);
        this.receiveShadow = true;
        this.lookAt(new THREE.Vector3(0, 1, 0));
    }
}
