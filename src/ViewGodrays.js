import Config from 'Config'
import  Utils from 'libs/Utils'
import 'libs/ShaderExtras.js'
import 'libs/EffectComposer/CopyShader.js'
import 'libs/EffectComposer/EffectComposer.js'
import 'libs/EffectComposer/ShaderPass.js'
import 'libs/EffectComposer/RenderPass.js'

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

class  ViewGodrays{
	constructor(scene,camera,renderer){
		this.scene = scene,this.camera = camera,this.renderer = renderer
		this.t =0
		this._init()
		this._loadObject()
		this._addPass()
		Config.debug&&this._addGui()
	}

	//  PRIVATE MATHODS
	_init(){

		var COLOR1 = 0x77bbff;
		var COLOR2 = 0x8ec5e5;
		var COLOR3 = 0x97a8ba;

		let oclscene = new THREE.Scene();
		oclscene.add( new THREE.AmbientLight( 0xffffff ) );
		let oclcamera = this.camera.clone()

		this.vlight = new THREE.Mesh( 
			new THREE.IcosahedronGeometry(50, 3),
			new THREE.MeshBasicMaterial({
				color: COLOR1
			})
		);
		this.vlight.position.y = 0;
		oclscene.add( this.vlight );

		this.pointLight = new THREE.PointLight( COLOR3 );
		this.pointLight.position.set( 0, 100, 0 );
		this.scene.add( this.pointLight );
		let cameraLight = new THREE.PointLight( 0x666666,.01);
		this.camera.add(cameraLight);

		this.oclscene = oclscene
		this.oclcamera = oclcamera
	}

	_loadObject(){
		let loader = new THREE.JSONLoader()
		loader.load( 'models/trondisk.js', (geometry,materials) => { this._createScene( geometry, materials,0, 0, 0, 0 ) } );
	}
	//添加object，occlusion buffer
	_createScene(geometry,materials, x, y, z, b ){

		materials = new THREE.MeshPhongMaterial({color:0x595353})//materials[0]
		let zmesh = new THREE.Mesh( geometry, materials  ),
		oclscene = this.oclscene,scene = this.scene

		zmesh.position.set( x, y, z );
		zmesh.scale.set( 3, 3, 3 );
		scene.add( zmesh );

		var gmat = new THREE.MeshBasicMaterial( { color: 0x000000, map: null } );
		var geometryClone =geometry.clone();
		var gmesh = new THREE.Mesh(geometryClone, gmat);
		gmesh.position.set( 0,0,0);
		gmesh.rotation.copy(zmesh.rotation);
		gmesh.scale.copy(zmesh.scale);
		oclscene.add(gmesh);
		
		// extra fancy
		var m = new THREE.Mesh(geometry, materials );
		m.position.set(0, 100, 0);
		m.scale.copy( zmesh.scale);
		m.rotation.copy( zmesh.rotation);
		scene.add(m);

		m = new THREE.Mesh(geometry, materials );
		m.position.set(0, -100, 0);
		m.scale.copy(zmesh.scale);
		m.rotation.copy(zmesh.rotation);
		scene.add(m);

		m = new THREE.Mesh(geometryClone, gmat);
		m.position.set(0, 100, 0);
		m.scale.copy(zmesh.scale);
		m.rotation.copy(zmesh.rotation);
		oclscene.add(m);

		m = new THREE.Mesh(geometryClone, gmat);
		m.position.set(0, -100, 0);
		m.scale.copy(zmesh.scale);
		m.rotation.copy(zmesh.rotation);
		oclscene.add(m);
	}

	_addPass(){
		var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false,depthBuffer:false },
		renderTargetOcl = new THREE.WebGLRenderTarget( SCREEN_WIDTH/4, SCREEN_HEIGHT/4, renderTargetParameters );
		
		var effectFXAA = new THREE.ShaderPass( THREE.ShaderExtras[ "fxaa" ] );
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );

		let hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
		let vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );

		var bluriness = 2;

		hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH*2;
		vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT*2;

		var renderModel = new THREE.RenderPass( this.scene, this.camera );
		var renderModelOcl = new THREE.RenderPass( this.oclscene, this.oclcamera );

		let grPass = new THREE.ShaderPass( THREE.ShaderExtras['Godrays'] );
		grPass.needsSwap = false
		grPass.renderToScreen = false;

		var finalPass = new THREE.ShaderPass( THREE.ShaderExtras['Additive'] );
		finalPass.renderToScreen = true;

		let oclcomposer = new THREE.EffectComposer( this.renderer, renderTargetOcl );

		oclcomposer.addPass( renderModelOcl );
		oclcomposer.addPass( hblur );
		oclcomposer.addPass( vblur );
		oclcomposer.addPass( hblur );
		oclcomposer.addPass( vblur );
		oclcomposer.addPass( grPass );

		

		let renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

		let finalcomposer = new THREE.EffectComposer( this.renderer, renderTarget );

		finalcomposer.addPass( renderModel );
		finalcomposer.addPass( effectFXAA );
		finalcomposer.addPass( finalPass );

		finalPass.uniforms[ 'tAdd' ].value = oclcomposer.renderTarget1.texture;

		this.oclcomposer =oclcomposer
		this.finalcomposer = finalcomposer
		this.grPass = grPass

	}

	_addGui(){
		gui.add(this.grPass.uniforms.fExposure, 'value',0.0,1.0).step(0.01).name("Exposure");
		gui.add(this.grPass.uniforms.fDecay, 'value',0.6,1.0).step(0.01).name("Decay");
		gui.add(this.grPass.uniforms.fDensity, 'value',0.0,1.0).step(0.01).name("Density");
		gui.add(this.grPass.uniforms.fWeight, 'value',0.0,1.0).step(0.01).name("Weight");
		gui.add(this.grPass.uniforms.fClamp, 'value',0.0,1.0).step(0.01).name("Clamp");
	}

	//	PUBLIC METHODS
	render(){
		this.t += .01;

		this.oclcamera.position.copy(this.camera.position);
		this.oclcamera.lookAt( this.scene.position );
		this.camera.lookAt(this.scene.position)

		this.pointLight.position.set( 0, Math.cos(this.t)*200, 0 );
		this.vlight.position.copy(this.pointLight.position)
		
		var lPos = Utils.projectOnScreen(this.vlight.position, this.camera);

		this.grPass.uniforms["fX"].value = lPos.x;
		this.grPass.uniforms["fY"].value = lPos.y;

		this.oclcomposer.render( 0.1 );
		this.finalcomposer.render( 0.1 );
	}
		

}
export default ViewGodrays;
