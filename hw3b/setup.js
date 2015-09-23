/*
 * src - http://solutiondesign.com/blog/-/blogs/webgl-and-three-js-texture-mappi-1/
 */

var ROW_COUNT = 4;
var CENTRE_COUNT = 14;
var BASE_PARTITIONS = 7;

var TRI_HEIGHT = 1.0 / ROW_COUNT;
var TRI_BASE = 1.0 / BASE_PARTITIONS;


var camera;
var scene;
var renderer;
var mesh;



init();
animate();


function normToScreen(vector2) {

    return new THREE.Vector3((vector2.x - 0.5) * 2.0,
                             (vector2.y - 0.5) * 2.0,
                             0);

}

function randomRemove(set) {

    var idx = Math.floor((Math.random() * set.length));
    var temp = set[idx];
    set[idx] = set[set.length - 1];
    set[set.length - 1] = temp;
    return set.pop();

}

function isEven(number) {

    return number % 2 == 0;

}


function partition(rowID, centreID) {

    var tipX = centreID * (1.0 / CENTRE_COUNT);
    var tipY = rowID * TRI_HEIGHT;
    var baseY = tipY + TRI_HEIGHT;

    if (isEven(rowID) == isEven(centreID)) {
        tipY += TRI_HEIGHT;
        baseY -= TRI_HEIGHT;
    }

    baseX1 = tipX - TRI_BASE * 0.5;
    baseX2 = tipX + TRI_BASE * 0.5;

    var pt1 = new THREE.Vector2(tipX, tipY);
    var pt2 = new THREE.Vector2(baseX1, baseY);
    var pt3 = new THREE.Vector2(baseX2, baseY);

    pt1.clampScalar(0.0, 1.0);
    pt2.clampScalar(0.0, 1.0);
    pt3.clampScalar(0.0, 1.0);

    if (tipY < baseY) {

        return [ pt3, pt2, pt1 ];

    } else {

        return [ pt3, pt1, pt2 ];

    }

}


function init() {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000);

    var vs = document.getElementById("VertexShader").innerHTML;
    var fs = document.getElementById("FragmentShader").innerHTML;
    var tex = THREE.ImageUtils.loadTexture('strokes.png');
    var tex2 = THREE.ImageUtils.loadTexture('heightmap.png');

    var geometry = new THREE.Geometry();

    var idSet = [];
    for (var rowID = 0; rowID < ROW_COUNT; ++rowID) {
        for (var centreID = 0; centreID <= CENTRE_COUNT; ++centreID) {
            idSet.push({ rowID: rowID, centreID: centreID });
        }
    }

    geometry.vertices = [];
    geometry.faces = [];
    geometry.faceVertexUvs[0] = [];
    var vertexCount = 0;
    var faceCount = 0;
    var color = new THREE.Color();
    var colors = new Float32Array(ROW_COUNT * (CENTRE_COUNT+1) * 3 * 3);
    for (var rowID = 0; rowID < ROW_COUNT; ++rowID) {
        for (var centreID = 0; centreID <= CENTRE_COUNT; ++centreID) {

            var pair = randomRemove(idSet);

            var points = partition(rowID, centreID);
            var uvs = partition(pair.rowID, pair.centreID);
            color.setHSL(Math.floor(Math.random() * 50) / 50, 0.09, 0.6);

            for (var idx = 0; idx < points.length; ++idx) {
                geometry.vertices.push(normToScreen(points[idx]));

                colors[vertexCount*3] = color.r;
                colors[vertexCount*3+1] = color.g;
                colors[vertexCount*3+2] = color.b;

                ++vertexCount;
            }

            geometry.faces.push(new THREE.Face3(vertexCount-3,
                                                vertexCount-2,
                                                vertexCount-1));

            ++faceCount;
            geometry.faceVertexUvs[0].push(uvs);

        }
    }


    var bfrGeometry = new THREE.BufferGeometry();
    bfrGeometry.fromGeometry(geometry);
    bfrGeometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );

    var material = new THREE.ShaderMaterial({

        attributes: {

            customColor: { type: "f", value: [] }

        },
        uniforms: {

            u_disp: { type: "t", value: tex },
            u_disp2: { type: "t", value: tex2 }

        },
        vertexShader: vs,
        fragmentShader: fs

    });


    mesh = new THREE.Mesh(bfrGeometry,  material);
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
