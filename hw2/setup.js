/*
 * src - http://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
 */

var camera;
var scene;
var renderer;
var mesh;



init();
animate();



function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);

    var vs = document.getElementById("VertexShader").innerHTML;
    var fs = document.getElementById("FragmentShader").innerHTML;
    var tex = THREE.ImageUtils.loadTexture('brushstrokes1024.png');
    var tex2 = THREE.ImageUtils.loadTexture('heightmap.png');

    var geometry = new THREE.Geometry();

    geometry.vertices = [
        new THREE.Vector3( -1, -1, 0 ),
        new THREE.Vector3( 1, -1, 0 ),
        new THREE.Vector3( 1, 1, 0 ),
        new THREE.Vector3( -1, 1, 0 )
    ];

    geometry.faces = [
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3)
    ];


    geometry.faceVertexUvs[0] = []
    geometry.faceVertexUvs[0][0] = [
        new THREE.Vector2( 0, 0 ),
        new THREE.Vector2( 1, 0 ),
        new THREE.Vector2( 1, 1 )
    ];
    geometry.faceVertexUvs[0][1] = [
        new THREE.Vector2( 0, 0 ),
        new THREE.Vector2( 1, 1 ),
        new THREE.Vector2( 0, 1 )
    ];

    var material = new THREE.ShaderMaterial({

        uniforms: {

            u_disp: { type: "t", value: tex },
            u_disp2: { type: "t", value: tex2 }

        },
        vertexShader: vs,
        fragmentShader: fs

    });



    mesh = new THREE.Mesh(geometry,  material);
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    render();

}



function animate() {

    mesh.rotation.x += .01;
    mesh.rotation.y += .01;

    render();
    requestAnimationFrame( animate );

}



function render() {

    renderer.render( scene, camera );

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();

}
