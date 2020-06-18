import * as THREE from "three";
import { THREEGLTFLoader, THREEDracoLoader } from "three-loaders";
import { OrbitControls } from "three-orbitcontrols";

init();

function init() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');
    var camera = new THREE.PerspectiveCamera( 60, 2, 0.1, 1000 );
    camera.position.set(0,10,-100);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    controls = new OrbitControls( camera, renderer.domElement );
    const loader = THREEGLTFLoader();
    loader.setDRACOLoader(new THREEDRACOLoader("http://myServer.com/draco"));

    loader.setDRACOLoader(dracoLoader);

    function load3DObject(scene, loader, url) {
        const onLoad = (gltf) => {
            model = gltf.scene.children[0];
            scene.add(model);
            model.material.transparent = true;
            model.material.opacity = 0.5;
        };
        const onProgress = () => { };
        const onError = (errorMessage) => {
            console.log(errorMessage);
        };

        loader.load(url, gltf => onLoad(gltf), onProgress, onError);
    }

    url = "./Lantern.glb";
    load3DObject(scene, loader, url);

    loader.load('./ferrari.glb', function (gltf) {

            var carModel = gltf.scene.children[0];

            carModel.getObjectByName( 'body' ).material = bodyMaterial;

            carModel.getObjectByName( 'rim_fl' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_fr' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_rr' ).material = detailsMaterial;
            carModel.getObjectByName( 'rim_rl' ).material = detailsMaterial;
            carModel.getObjectByName( 'trim' ).material = detailsMaterial;

            carModel.getObjectByName( 'glass' ).material = glassMaterial;

            wheels.push(
                carModel.getObjectByName( 'wheel_fl' ),
                carModel.getObjectByName( 'wheel_fr' ),
                carModel.getObjectByName( 'wheel_rl' ),
                carModel.getObjectByName( 'wheel_rr' )
            );

            scene.add( carModel );

        } );


    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }
    animate();
}