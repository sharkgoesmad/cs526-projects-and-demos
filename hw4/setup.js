/*
 * src - http://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
 */
Timer = function() {

	this.Stamp = window.performance.now();

}



Timer.prototype = {

	constructor: Timer,

	Reset: function() {

		this.Stamp = window.performance.now();

	},

	Elapsed: function() {

		return window.performance.now() - this.Stamp;

	}
}

var camera;
var scene;
var sceneScreen;
var renderer;
var mesh;
var timer;
var goal;
var initial;
var diff;
var accumRect;
var screenRect;
var splineObject;
var sceneTex;

var rtDuration = 8000;
var renderTargetParams = {
	minFilter: THREE.LinearFilter,
	stencilBuffer: false,
	depthBuffer: false,
	format: THREE.RGBAFormat,
	type: THREE.FloatType
};


init();
animate();


function matProp(material) {
	//material.blending = THREE.SubtractiveBlending;
	material.blendEquation = THREE.MinEquation;
	material.blendDst = THREE.DstAlphaFactor;
	material.blendSrc = THREE.OneMinusDstColorFactor;
	material.transparent = true;
}


function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0.0, -2.0, -30.0);
	camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));



	// Create a sine-like wave
	var curve = new THREE.SplineCurve( [
		new THREE.Vector2( -5, 0 ),
		new THREE.Vector2( -2, 2 ),
		new THREE.Vector2( 0, 0 )
		//new THREE.Vector2( 5, -5 ),
		//new THREE.Vector2( 10, 0 )
	] );

	var path = new THREE.Path( curve.getPoints( 50 ) );

	var geometry = path.createPointsGeometry( 50 );
	geometry.colors = [];
	for (var idx = 0; idx < geometry.vertices.length; ++idx)
	{
		var t = idx * 0.9 / geometry.vertices.length;
		t = t*t*t;
		geometry.colors.push(new THREE.Color(t, t, t));
	}
	var material = new THREE.LineBasicMaterial( { linewidth: 1, color : 0x0099ff } );
	material.opacity = 0.1;
	material.transparent = true;
	//material.blendEquation = THREE.ReverseSubtractEquation;
	material.vertexColors = THREE.VertexColors;

	// Create the final Object3d to add to the scene
	splineObject = new THREE.Line( geometry, material );
	scene.add(splineObject);



	sceneTex = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParams );
	accumTex = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParams );

	// sceneScreen
	sceneScreen = new THREE.Scene();

	var screenGeom = new THREE.Geometry();
	screenGeom.vertices = [
		new THREE.Vector3( -1, -1, 0 ),
		new THREE.Vector3( 1, -1, 0 ),
		new THREE.Vector3( 1, 1, 0 ),
		new THREE.Vector3( -1, 1, 0 )
	];
	screenGeom.faces = [
		new THREE.Face3(0, 1, 2),
		new THREE.Face3(0, 2, 3)
	];

	screenGeom.faceVertexUvs[0] = []
	screenGeom.faceVertexUvs[0][0] = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( 1, 0 ),
		new THREE.Vector2( 1, 1 )
	];
	screenGeom.faceVertexUvs[0][1] = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( 1, 1 ),
		new THREE.Vector2( 0, 1 )
	];

	var vs = document.getElementById("vs-screen").innerHTML;
	var fs = document.getElementById("fs-screen").innerHTML;
	var fsAccum = document.getElementById("fs-accum").innerHTML;

	var accumMat = new THREE.ShaderMaterial({

		uniforms: {
			tex: { type: "t", value: sceneTex }
		},
		vertexShader: vs,
		fragmentShader: fsAccum

	});
	matProp(accumMat);

	var screenMat = new THREE.ShaderMaterial({

		uniforms: {
			tex: { type: "t", value: accumTex }
		},
		vertexShader: vs,
		fragmentShader: fs

	});
	matProp(screenMat);

	accumRect = new THREE.Mesh(screenGeom, accumMat);
	sceneScreen.add(accumRect);
	screenRect = new THREE.Mesh(screenGeom, screenMat);
	sceneScreen.add(screenRect);






	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: false,
		alpha: true
	});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;
	renderer.autoClearColor = false;
	document.body.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = false;

	goal = chooseDest();
	initial = new THREE.Vector3();
	timer = new Timer();
	diff = new THREE.Vector3();

	render();

}

function chooseDest() {
	var x = Math.random() * 40 - 20;
	var y = Math.random() * 40 - 20;
	var z = Math.random() * 40 - 20;

	return new THREE.Vector3(x, y, z);
}

function animate() {

	var diffS;
	var t = timer.Elapsed();
	if (t > rtDuration)
	{
		goal = chooseDest();
		initial.copy(splineObject.position);
		timer.Reset();
	}

	diffS = t / rtDuration;
	splineObject.position.lerpVectors(initial, goal, diffS);

	splineObject.rotation.x += .01;
	splineObject.rotation.y += .05;

	render();
	requestAnimationFrame( animate );

}



function render() {
	renderer.render( scene, camera, sceneTex );

	accumRect.visible = true;
	screenRect.visible = false;
	renderer.render( sceneScreen, camera, accumTex );

	accumRect.visible = false;
	screenRect.visible = true;
	renderer.render( sceneScreen, camera);

}



function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	sceneTex.setSize( window.innerWidth, window.innerHeight );
	render();

}

