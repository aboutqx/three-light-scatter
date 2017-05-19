class  Cloud extends THREE.Object3D{
	constructor(){
		super();
		this._init()
	}

	//  PRIVATE MATHODS
	_init(){
		let texture = new THREE.CanvasTexture(getAssets('cloud'))
		this.material = new THREE.SpriteMaterial( { color:0xffffff, map: texture, side: THREE.DoubleSide ,transparent:true,depthWrite:true} );
		this.mesh = []
	}
		


	//	PUBLIC METHODS
	generateClouds(){
		for(let i =0;i<10;i++){
			let mesh = new THREE.Sprite(this.material)

			mesh.position.x = (Math.random()-.5)*2*299
			mesh.position.y = Math.random()*399
			mesh.position.z = Math.random()*199
			mesh.scale.x = mesh.scale.y = 200

			this.mesh.push(mesh)
		}
		return this.mesh
	}

}
export default Cloud;