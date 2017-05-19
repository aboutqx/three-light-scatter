let projectOnScreen = function(position, camera)
{	
	let t = new THREE.Vector3()
	t.copy( position ).project( camera );

	t.x = ( t.x + 1 ) / 2;
	t.y = ( t.y + 1 ) / 2;

	return t
}

export default {
	projectOnScreen
}