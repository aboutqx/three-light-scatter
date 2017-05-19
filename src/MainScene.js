import Scene from './scene';
import addLensflare from './ViewLensflare'
import Cloud from './ViewCloud'
import Sky from './ViewSky'
import Godrays from './ViewGodrays'

class MainScene extends Scene {
    constructor(dom) {
        super(dom); //call _init,_addLight
        this.update= ::this._update
        this._resize= ::this._resize
        this.init();
    }

    init() {
        this.camera.position.set(0, 0, 250);
        this.renderer.shadowMap.enabled = true;

        this.scene.fog = new THREE.Fog(0x000000, 3500, 15000);
        this.scene.fog.color.setHSL(0.51, 0.4, 0.01);
		this.renderer.setClearColor( 0x000000);


        // this::addLensflare( 0.55, 0.9, 0.5, 5000, 10, -5000 );

		let sky = new Sky()
        this.scene.add(sky)

        let cloud = new Cloud()
        cloud.generateClouds().forEach((v) => {
            this.scene.add(v)
        })
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;
        this._godrays = new Godrays(this.scene,this.camera,this.renderer)
        

    }

    _addLight(){
        // this.scene.add(new THREE.AmbientLight(0x404040,15.))
    }

    _resize() {
        this::Scene.prototype.resize( window.innerWidth, window.innerHeight)
    }
    _update() {
        requestAnimationFrame(this.update)
        
        this._godrays.render()
        this.render(false)
    }
    _addListeners() {
        window.addEventListener('resize', this._resize)
    }

    load(callback) {
        callback()
    }
    play() {
        this.update()
        this._addListeners()
    }

}
export default MainScene;
