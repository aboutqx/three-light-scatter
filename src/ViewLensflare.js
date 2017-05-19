function addLensflare(h, s, l, x, y, z) {
    let textureLoader = new THREE.TextureLoader();
    let textureFlare0 = textureLoader.load("textures/lensflare/lensflare0.png");
    let textureFlare2 = textureLoader.load("textures/lensflare/lensflare2.png");
    let textureFlare3 = textureLoader.load("textures/lensflare/lensflare3.png");

    let light = new THREE.PointLight(0xffffff, 1.5, 2000);
    light.color.setHSL(h, s, l);
    light.position.set(x, y, z);
    this.scene.add(light);

    let flareColor = new THREE.Color(0xffffff);
    flareColor.setHSL(h, s, l + 0.5);
    let lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);
    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
    lensFlare.customUpdateCallback = lensFlareUpdateCallback;
    lensFlare.position.copy(light.position);
    this.scene.add(lensFlare);

    this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;

    let dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    dirLight.position.set( 0, 150, 0 ).normalize();
    this.scene.add( dirLight );
    dirLight.color.setHSL( 0.1, 0.7, 0.5 );
}

function lensFlareUpdateCallback(object) {
    var f, fl = object.lensFlares.length;
    var flare;
    var vecX = -object.positionScreen.x * 2;
    var vecY = -object.positionScreen.y * 2;
    for (f = 0; f < fl; f++) {
        flare = object.lensFlares[f];
        flare.x = object.positionScreen.x + vecX * flare.distance;
        flare.y = object.positionScreen.y + vecY * flare.distance;
        flare.rotation = 0;
    }
    object.lensFlares[2].y += 0.025;
    object.lensFlares[3].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);
}
export default addLensflare
