import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Queue } from './Queue';

var scene, camera, renderer, controls, grid;
var lights = new Array(8);
var kind_model;
var structure = [];

export function init() {
    // create the gray scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');

    // create the camera
    camera = new THREE.PerspectiveCamera( 60, 2, 0.1, 1000 );
    camera.position.set(0.5, 0.5, 0.5);
    
    for (let i = 0; i < 8; i++){
        lights[i] = new THREE.DirectionalLight(0xffffff, 0.55);
    }
    lights[0].position.set(100, 100, 100);
    lights[1].position.set(-100, 100, -100);
    lights[2].position.set(-100, -100, -100);
    lights[3].position.set(100, -100, 100);
    lights[4].position.set(100, 0, 0);
    lights[5].position.set(-100, 0, 0);
    lights[6].position.set(0, 0, 100);
    lights[7].position.set(0, 0, -100);
    for (let i = 0; i < 8; i++){
        scene.add(lights[i]);
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth*0.7, window.innerHeight*0.85);
    document.body.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);

    grid = new THREE.GridHelper( 100, 40, 0x000000, 0x000000 );
    grid.material.opacity = 0.1;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
    scene.add(grid);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export function display_kind(data) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    
    const gltfloader = new GLTFLoader();
    gltfloader.setDRACOLoader(dracoLoader);

    gltfloader.load(data, function (gltf) {
        kind_model = gltf.scene.children[0];
        scene.add(kind_model);
        structure = bfs(kind_model);
        addToList(structure);
    });
}

function addToList(list){
    var menu = document.getElementById('selection-list');
    list.forEach(l => {
        if (l.obj.type == 'Mesh') {
            let option = document.createElement('option');
            option.text = l.obj.name + ' (' + l.obj.type + ')';
            option.text = l.obj.name;
            menu.add(option);
        }
    });
}

export function change_color(mesh_name, color) {
    kind_model.getObjectByName(mesh_name).material.color.set(color);
}

export function change_transparency(mesh_name, value) {
    kind_model.getObjectByName(mesh_name).material.alphaTest = value;
    // console.log(kind_model.getObjectByName(mesh_name).material.opacity);
    // kind_model.getObjectByName(mesh_name).material.transparency = true;
    // kind_model.getObjectByName(mesh_name).material.opacity = value;
    // console.log("----", kind_model.getObjectByName(mesh_name).material.opacity);
}

function bfs(model) {
    let list = [];

    let queue = new Queue();
    queue.enqueue(new Node(model, null));
    list.push(new Node(model, null));
    
    while (queue.isEmpty() == false) {
        let c = queue.dequeue();
        if (c.obj.children.length > 0) {
            c.obj.children.forEach(child => {
                queue.enqueue(new Node(child, c.obj));
                list.push(new Node(child, c.obj));
            });
        }
    }
    return list;
}

class Node {
    constructor(obj, parent){
        this.obj = obj;
        this.parent = parent;
    }
}

function display_ferrari(data) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' );
    dracoLoader.setDecoderConfig({ type: 'js' });
    
    const gltfloader = new GLTFLoader();
    gltfloader.setDRACOLoader(dracoLoader);

    // materials 
    var bodyMaterial = new THREE.MeshPhysicalMaterial( {
        color: 0x000333, metalness: 1.0, roughness: 0.5, clearcoat: 0.02, clearcoatRoughness: 0.01
    } );    

    var detailsMaterial = new THREE.MeshStandardMaterial( {
        color: 0xffffff, metalness: 1.0, roughness: 0.5
    } );

    var glassMaterial = new THREE.MeshPhysicalMaterial( {
        color: 0xffffff, metalness: 0, roughness: 0, transparency: 0.8, transparent: true
    } );

    var wheels = [];

    gltfloader.load(data, function (gltf) {
            var car_model = gltf.scene.children[0];

            // car_model.getObjectByName( 'body' ).material = bodyMaterial;

            // car_model.getObjectByName( 'rim_fl' ).material = detailsMaterial;
            // car_model.getObjectByName( 'rim_fr' ).material = detailsMaterial;
            // car_model.getObjectByName( 'rim_rr' ).material = detailsMaterial;
            // car_model.getObjectByName( 'rim_rl' ).material = detailsMaterial;
            // car_model.getObjectByName( 'trim' ).material = detailsMaterial;

            // car_model.getObjectByName( 'glass' ).material = glassMaterial;

            // wheels.push(
            //     car_model.getObjectByName( 'wheel_fl' ),
            //     car_model.getObjectByName( 'wheel_fr' ),
            //     car_model.getObjectByName( 'wheel_rl' ),
            //     car_model.getObjectByName( 'wheel_rr' )
            // );

            scene.add( car_model );
        } );
    animate();
}