import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Queue } from './Queue';
import { Vector3 } from 'three';

var scene, camera, renderer, controls, grid;
var lights = new Array(8);
var model;
var structure = [];
var structure_dict = new Map();
var init_scale;

export function init() {
    // create the gray scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');

    // create the camera
    camera = new THREE.PerspectiveCamera( 60, 2, 0.1, 1000 );
    camera.position.set(0.4, 0.4, 0.6);
    
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
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    let container = document.getElementById('scene-container');
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

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
        model = gltf.scene.children[0];
        scene.add(model);
        structure = bfs(model);
        addToMenu(structure);
        init_scale = model.scale.clone();
    });
}

function addToMenu(list){
    var menu = document.getElementById('selection-list');
    createDictionary(list);
    list.forEach(l => {
        let option = document.createElement('option');
        option.text = l.obj.name + ' (' + l.obj.type + ')', l.obj.name;
        menu.add(option);   
    });
}

function createDictionary(list) {
    list.forEach(l =>{
        structure_dict.set(l.obj.name + ' (' + l.obj.type + ')', l.obj.name);
    });
}

export function change_color(name, color) {
    model.getObjectByName(structure_dict.get(name)).material.color.set(color);
}

export function change_scale(value) {
    console.log("before: ", init_scale, value)
    let x = init_scale.x*parseFloat(value);
    let y = init_scale.y*parseFloat(value);
    let z = init_scale.z*parseFloat(value);
    model.scale.set(x, y, z);
}

export function change_transparency(name, value) {
    let obj_name = structure_dict.get(name);
    if (obj_name == 'all'){
        structure.forEach(l => {
            if (l.obj.type == 'Mesh'){
                l.obj.material.transparent = true;
                l.obj.material.opacity = 1 - value;
            }
        });
    }
    else{
        model.getObjectByName(obj_name).material.transparent = value > 0 ? true : false;
        model.getObjectByName(obj_name).material.opacity = 1 - value;
    }
}


export function exportGLTF(name) {
    var gltfExporter = new GLTFExporter();

    gltfExporter.parse(model, function ( result ) {
        if ( result instanceof ArrayBuffer ) {
            saveArrayBuffer(result, name+'.glb');
        } else {
            var output = JSON.stringify(result, null, 2);
            saveString(output, name+'.glb');
        }
    }, {binary: true} );
}

var link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveString(text, filename) {
    save(new Blob([text], {type: 'text/plain'}), filename);
}

function saveArrayBuffer(buffer,filename) {
    save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
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