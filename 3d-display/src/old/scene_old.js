import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Queue } from './../Queue';

import { exportGLTF } from './../exportGLTF';

var scene, camera, renderer, controls, grid;
var lights = new Array(8);
var models = [];

export function init() {
    // create the gray scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gray');

    // create the camera
    camera = new THREE.PerspectiveCamera( 60, 2, 0.1, 1000 );
    camera.position.set(2, 4, 5);
    
    for (let i = 0; i < 8; i++){
        lights[i] = new THREE.DirectionalLight(0xffffff, 0.9);
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

export function display(name, data) {
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    
    const gltfloader = new GLTFLoader();
    gltfloader.setDRACOLoader(dracoLoader);

    gltfloader.load(data, function (gltf) {
        let model = gltf.scene;
        scene.add(model);
        models.push(new Model(model, name, model.scale.clone(), bfs(model)));
    });
}

function bfs(model) {
    let queue = new Queue();
    let list = [];
    parent = new Node(model, null,  0);
    list.push(parent);
    queue.enqueue(parent);
    
    while (queue.isEmpty() == false) {
        let c = queue.dequeue();
        if (c.obj.children.length > 0) {
            c.obj.children.forEach(child => {
                let node_child = new Node(child, c.obj, 0);
                c.children.push(node_child);
                queue.enqueue(node_child);
                list.push(node_child);
            });
        }
    }
    return list;
}

function getModelByName(name) {
    let res;
    models.forEach(m => {
        if (m.name == name) res = m;
    });
    return res;
}

export function updateListOfInternals(menu, model_name) {
    menu.innerHTML = "";
    let tree = getModelByName(model_name).tree;
    tree.forEach(t => {
        let option = document.createElement('option');
        option.text = t.obj.name + ' (' + t.obj.type + ')', t.obj.name;
        menu.add(option);
    });
}

export function change_scale(model_name, value) {
    let model;
    model = getModelByName(model_name);
    if (model != undefined) {
        let init_scale = model.init_scale;
        let x = init_scale.x*parseFloat(value);
        let y = init_scale.y*parseFloat(value);
        let z = init_scale.z*parseFloat(value);
        model.model.scale.set(x, y, z);
        model.scale = value;
    }
}

export function change_position(model_name, {x, y, z}) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let init_scale = model.init_scale;
        model.model.position.set(init_scale.x*parseFloat(x), init_scale.y*parseFloat(y), init_scale.z*parseFloat(z));
    }
}

export function change_color(model_name, mesh_name, color) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        model.model.getObjectById(model.structure.get(mesh_name)).material.color.set(color);
    }
    
}

export function change_opacity(model_name, mesh_name, value) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        model.model.getObjectById(id).material.transparent = value > 0 ? true : false;
        model.model.getObjectById(id).material.opacity = value;   
    }
}

export function change_roughness(model_name, mesh_name, value) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        model.model.getObjectById(id).material.roughness = value;   
    }
}

export function change_metalness(model_name, mesh_name, value) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        model.model.getObjectById(id).material.metalness = value;   
    }
}


export function getOpacityValue(model_name, mesh_name) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        return model.model.getObjectById(id).material.opacity.toFixed(2);
    }
    return null;
}

export function getRoughnessValue(model_name, mesh_name) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        return model.model.getObjectById(id).material.roughness.toFixed(2);
    }
    return null;
}

export function getMetalnessValue(model_name, mesh_name) {
    let model = getModelByName(model_name);
    if (model != undefined) {
        let id = model.structure.get(mesh_name);
        return model.model.getObjectById(id).material.metalness.toFixed(2);
    }
    return null;
}

export function getScaleValue(model_name){
    let model = getModelByName(model_name);
    return (model != undefined) ? model.scale : null;
}

export function getPosition(model_name){
    let model = getModelByName(model_name);
    if (model != undefined) {
        let pos = model.model.position;
        let vector = new THREE.Vector3(pos.x.toFixed(2), pos.y.toFixed(2), pos.z.toFixed(2));
        return vector;
    }
    return null;
}

export function save_scene() {
    let new_scene = new THREE.Group();
    models.forEach(m => {
        new_scene.children.push(m.model);
        new_scene.children[new_scene.children.length-1].name = name.slice(0, m.name.length - 4);
    })
    exportGLTF('scene', new_scene.children); 
}

export class Model {
    constructor(model, name, init_scale, tree) {
        this.model = model;
        this.name = name;
        this.init_scale = init_scale;
        this.tree = tree;
        this.structure = this.createDictionary(tree); // mapping: name (type) |-> id
        this.scale = 1;
    }
    
    createDictionary(list) {
        let structure_dict = new Map();
        list.forEach(l =>{
            structure_dict.set(l.obj.name + ' (' + l.obj.type + ')', l.obj.id);
        });
        return structure_dict;
    }
}

class Node {
    constructor(obj, parent, depth) {
        this.obj = obj;
        this.parent = parent;
        this.depth = depth;
        this.children = [];
    }
}